import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  CButton,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CBadge,
} from '@coreui/react';
import Select from 'react-select';
import { getAPICall } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';
import PurchaseForm from './PurchaseForm';
import EditPurchaseModal from './EditPurchaseModal';

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { showToast } = useToast();

  // ---------- FILTER STATES ----------
  const [filterProject, setFilterProject] = useState(null);
  const [filterVendor, setFilterVendor] = useState(null);

  // ---------- REF FOR INFINITE SCROLL ----------
  const observerTarget = useRef(null);

  // -------------------------------------------------
  const fetchVendors = async () => {
    try {
      const res = await getAPICall('/api/getPurchesVendor');
      setVendors(res || []);
    } catch {
      showToast('danger', 'Error loading vendors');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await getAPICall('/api/projects');
      setProjects(res || []);
    } catch {
      showToast('danger', 'Failed to load projects');
    }
  };

  // -------------------------------------------------
  // PAGINATED FETCH
  const fetchPurchases = async (cursor = null, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const url = cursor
        ? `/api/purchesVendor?cursor=${cursor}&perPage=10`
        : '/api/purchesVendor?perPage=10';

      const res = await getAPICall(url);

      const newData = res?.data || [];

      if (isLoadMore) {
        setPurchases((prev) => [...prev, ...newData]);
      } else {
        setPurchases(newData);
      }

      setNextCursor(res.next_cursor);
      setHasMore(res.has_more_pages);
    } catch (err) {
      showToast('danger', 'Failed to load purchases');
      if (!isLoadMore) setPurchases([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchVendors();
    fetchProjects();
    fetchPurchases();
  }, []);

  // Load more when scrolling
  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && hasMore && nextCursor) {
      fetchPurchases(nextCursor, true);
    }
  }, [loadingMore, loading, hasMore, nextCursor]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const current = observerTarget.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, loadingMore, loading, loadMore]);

  // -------------------------------------------------
  const refreshTable = () => {
    setPurchases([]);
    setNextCursor(null);
    setHasMore(true);
    fetchPurchases();
  };

  const openEdit = (purchase) => {
    setEditItem(purchase);
    setShowEditModal(true);
  };

  // ---------- APPLY FILTER (client-side) ----------
  const filteredData = purchases.filter((p) => {
    const byProject = filterProject ? p.project_id === filterProject.value : true;
    const byVendor = filterVendor ? p.vendor_id === filterVendor.value : true;
    return byProject && byVendor;
  });



const downloadPDF = () => {
  import('jspdf').then(jsPDF => {
    import('jspdf-autotable').then(() => {
      const doc = new jsPDF.jsPDF('landscape');

      // ------------ HEADER ------------
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("PURCHASE REPORT", 14, 15);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 25);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Records: ${filteredData.length}`, 14, 33);

      // ------------ TOTAL CALCULATIONS ------------
      const totalQty = filteredData.reduce((sum, item) => sum + Number(item.qty || 0), 0);
      const totalAmount = filteredData.reduce((sum, item) => sum + Number(item.total || 0), 0);
      const totalPricePerUnit = filteredData.reduce(
        (sum, item) => sum + Number(item.price_per_unit || 0), 
        0
      );

      // ------------ TABLE DATA ------------
      const tableColumn = [
        "Sr No", "Project", "Vendor", "Material",
        "Price/Unit", "Qty", "Total", "Date", "About"
      ];

      const tableRows = [];

      filteredData.forEach((p, index) => {
        tableRows.push([
          index + 1,
          p.project?.project_name || "—",
          p.vendor?.name || "—",
          p.material_name,
        parseFloat(p.price_per_unit).toFixed(2),
          p.qty,
          parseFloat(p.total).toFixed(2),
          new Date(p.date).toLocaleDateString(),
          p.about || "—"
        ]);
      });

      // ------------ ADD TOTAL ROW ------------
     tableRows.push([
  { content: "Total:", colSpan: 4, styles: { halign: "right", fontStyle: "bold" } },
  totalPricePerUnit.toFixed(2),
  totalQty,
  totalAmount.toFixed(2),
  "",
  ""
]);


      // ------------ TABLE STYLE ------------
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: "grid",
        headStyles: {
          fillColor: [30, 115, 120],   // green-ish header like your sample
          textColor: 255,
          fontSize: 10,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 9,
          halign: "center",
        },
        styles: {
          lineWidth: 0.25,
          lineColor: [120, 120, 120],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },

        // ------------ FOOTER ------------
        didDrawPage: (data) => {
          const pageHeight = doc.internal.pageSize.height;

          doc.setFontSize(10);
          doc.setTextColor(100);

          doc.text(
            `Purchase Report | Generated: ${new Date().toLocaleDateString()}`,
            data.settings.margin.left,
            pageHeight - 10
          );

          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            doc.internal.pageSize.width - 30,
            pageHeight - 10
          );
        },
      });

      doc.save("purchase_report.pdf");
    });
  });
};




const downloadExcel = () => {
  import('xlsx').then(XLSX => {

    // ---- TOTAL CALCULATIONS (same as PDF) ----
    const totalQty = filteredData.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const totalAmount = filteredData.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const totalPricePerUnit = filteredData.reduce(
      (sum, item) => sum + Number(item.price_per_unit || 0),
      0
    );

    // ---- ROW DATA ----
    const worksheetData = filteredData.map((p, index) => ({
      "Sr No": index + 1,
      "Project": p.project?.project_name || "—",
      "Vendor": p.vendor?.name || "—",
      "Material": p.material_name,
      "Price/Unit": parseFloat(p.price_per_unit).toFixed(2),
      "Qty": p.qty,
      "Total": parseFloat(p.total).toFixed(2),
      "Date": new Date(p.date).toLocaleDateString(),
      "About": p.about || "—",
    }));

    // ---- ADD TOTAL ROW AT END ----
    worksheetData.push({
      "Sr No": "",
      "Project": "",
      "Vendor": "",
      "Material": "Total:",
      "Price/Unit": totalPricePerUnit.toFixed(2),
      "Qty": totalQty,
      "Total": totalAmount.toFixed(2),
      "Date": "",
      "About": "",
    });

    // ---- GENERATE SHEET ----
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // ---- OPTIONAL: MAKE HEADER BOLD ----
    Object.keys(worksheet).forEach((cell) => {
      if (cell.startsWith("A1") || cell.startsWith("B1") || cell.startsWith("C1")) {
        worksheet[cell].s = {
          font: { bold: true }
        };
      }
    });

    // ---- WORKBOOK ----
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");

    // ---- SAVE FILE ----
    XLSX.writeFile(workbook, "purchase_report.xlsx");
  });
};




  // -------------------------------------------------
  return (
    <>
      <CCard className="mb-4">
        <CCardHeader
  className="d-flex justify-content-between align-items-center flex-wrap gap-3"
  style={{ paddingBottom: "1rem" }}
>
  <strong>Purchase History</strong>

  {/* Right Section */}
  <div className="d-flex align-items-center gap-3 flex-wrap">

    <CButton color="primary" onClick={downloadPDF}>
      Download PDF
    </CButton>

    <CButton color="info" onClick={downloadExcel}>
      Download Excel
    </CButton>

    {/* Project Filter */}
    <div style={{ width: 200 }}>
      <Select
        placeholder="Filter by Project"
        options={projects.map((p) => ({
          value: p.id,
          label: p.project_name,
        }))}
        value={filterProject}
        onChange={setFilterProject}
        isClearable
      />
    </div>

    {/* Vendor Filter */}
    <div style={{ width: 200 }}>
      <Select
        placeholder="Filter by Vendor"
        options={vendors.map((v) => ({
          value: v.id,
          label: v.name,
        }))}
        value={filterVendor}
        onChange={setFilterVendor}
        isClearable
      />
    </div>

    {/* Add Purchase */}
    <CButton color="success" onClick={() => setShowAddModal(true)}>
      Add Purchase
    </CButton>
  </div>
</CCardHeader>


        <CCardBody>
          {loading && purchases.length === 0 ? (
            <div className="text-center py-4">
              <CSpinner />
            </div>
          ) : filteredData.length > 0 ? (
            <>
              <div className="table-responsive">
                <CTable striped hover bordered>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Sr. No.</CTableHeaderCell>
                      <CTableHeaderCell>Project</CTableHeaderCell>
                      <CTableHeaderCell>Vendor</CTableHeaderCell>
                      <CTableHeaderCell>Material</CTableHeaderCell>
                      <CTableHeaderCell>Price/Unit</CTableHeaderCell>
                      <CTableHeaderCell>Qty</CTableHeaderCell>
                      <CTableHeaderCell>Total</CTableHeaderCell>
                      <CTableHeaderCell>Include GST</CTableHeaderCell>

                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>About</CTableHeaderCell>
                      <CTableHeaderCell>Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody>
                    {filteredData.map((p, i) => (
                      <CTableRow key={p.id}>
                        <CTableDataCell>{i + 1}</CTableDataCell>
                        <CTableDataCell>{p.project?.project_name || '—'}</CTableDataCell>
                        <CTableDataCell>{p.vendor?.name || '—'}</CTableDataCell>
                        <CTableDataCell>{p.material_name}</CTableDataCell>
                        <CTableDataCell>₹{parseFloat(p.price_per_unit).toFixed(2)}</CTableDataCell>
                        <CTableDataCell>{p.qty}</CTableDataCell>
                        <CTableDataCell>
                          <strong>₹{parseFloat(p.total).toFixed(2)}</strong>
                        </CTableDataCell>

                       <CTableDataCell>
  {p.gst_included ? (
    <CBadge color="success">Yes</CBadge>
  ) : (
    <CBadge color="danger">No</CBadge>
  )}
</CTableDataCell>
                        <CTableDataCell>{new Date(p.date).toLocaleDateString()}</CTableDataCell>
                        <CTableDataCell>{p.about || '—'}</CTableDataCell>
                        <CTableDataCell>
                          <CButton color="warning" size="sm" onClick={() => openEdit(p)}>
                            Edit
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }}>
                {loadingMore && (
                  <div className="text-center">
                    <CSpinner size="sm" className="me-2" />
                    <span className="text-muted small">Loading more purchases...</span>
                  </div>
                )}
                {!hasMore && purchases.length > 0 && (
                  <div className="text-center text-muted small">
                    <hr />
                    <p>All {purchases.length} purchases loaded</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <CAlert color="info" className="text-center">
              No matching purchases found.
            </CAlert>
          )}
        </CCardBody>
      </CCard>

      {/* ---------- ADD MODAL ---------- */}
      <CModal size="xl" visible={showAddModal} onClose={() => setShowAddModal(false)} backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>Add New Purchase</CModalTitle>
        </CModalHeader>
        <PurchaseForm
          vendors={vendors}
          onSuccess={() => {
            setShowAddModal(false);
            refreshTable();
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </CModal>

      {/* ---------- EDIT MODAL ---------- */}
      {editItem && (
        <EditPurchaseModal
          visible={showEditModal}
          purchase={editItem}
          vendors={vendors}
          onClose={() => {
            setShowEditModal(false);
            setEditItem(null);
          }}
          onSuccess={refreshTable}
        />
      )}
    </>
  );
};

export default PurchaseList;

























// import React, { useEffect, useState } from 'react';
// import {
//   CButton,
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
//   CSpinner,
//   CAlert,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalFooter,
  
// } from '@coreui/react';
// // import CIcon from '@coreui/icons-react';
// import { cilPencil, cilPlus } from '@coreui/icons';
// import { getAPICall, put } from '../../../util/api';
// import { useToast } from '../../common/toast/ToastContext';
// import PurchaseForm from './PurchaseForm';          // <-- new component
// import EditPurchaseModal from './EditPurchaseModal'; // <-- optional, see note

// const PurchaseList = () => {
//   const [purchases, setPurchases] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editItem, setEditItem] = useState(null);
//   const { showToast } = useToast();

//   // -------------------------------------------------
//   const fetchVendors = async () => {
//     try {
//       const res = await getAPICall('/api/getPurchesVendor');
//       setVendors(res || []);
//     } catch {
//       showToast('danger', 'Error loading vendors');
//     }
//   };

//   const fetchPurchases = async () => {
//     setLoading(true);
//     try {
//       const res = await getAPICall('/api/purchesVendor');
//       setPurchases(res?.data || []);
//     } catch {
//       showToast('danger', 'Failed to load purchases');
//       setPurchases([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // -------------------------------------------------
//   useEffect(() => {
//     fetchVendors();
//     fetchPurchases();
//   }, []);

//   const refreshTable = () => fetchPurchases();

//   const openEdit = (purchase) => {
//     setEditItem(purchase);
//     setShowEditModal(true);
//   };

//   // -------------------------------------------------
//   return (
//     <>
//       <CCard className="mb-4">
//         <CCardHeader className="d-flex justify-content-between align-items-center">
//           <strong>Purchase History</strong>
//           <CButton
//             color="success"
//             onClick={() => setShowAddModal(true)}
//           >
//             {/* <CIcon icon={cilPlus} className="me-1" /> */}
//             Add Purchase
//           </CButton>
//         </CCardHeader>

//         <CCardBody>
//           {loading ? (
//             <div className="text-center py-4"><CSpinner /></div>
//           ) : purchases.length > 0 ? (
//             <div className="table-responsive">
//               <CTable striped hover bordered>
//                 <CTableHead color="light">
//                   <CTableRow>
//                     <CTableHeaderCell>#</CTableHeaderCell>
//                     <CTableHeaderCell>Project</CTableHeaderCell>
//                     <CTableHeaderCell>Vendor</CTableHeaderCell>
//                     <CTableHeaderCell>Material</CTableHeaderCell>
//                     <CTableHeaderCell>Price/Unit</CTableHeaderCell>
//                     <CTableHeaderCell>Qty</CTableHeaderCell>
//                     <CTableHeaderCell>Total</CTableHeaderCell>
//                     <CTableHeaderCell>Date</CTableHeaderCell>
//                     <CTableHeaderCell>About</CTableHeaderCell>
//                     <CTableHeaderCell>Action</CTableHeaderCell>
//                   </CTableRow>
//                 </CTableHead>
//                 <CTableBody>
//                   {purchases.map((p, i) => (
//                     <CTableRow key={p.id}>
//                       <CTableDataCell>{i + 1}</CTableDataCell>
//                       <CTableDataCell>{p.project?.project_name || '—'}</CTableDataCell>
//                       <CTableDataCell>{p.vendor?.name || '—'}</CTableDataCell>
//                       <CTableDataCell>{p.material_name}</CTableDataCell>
//                       <CTableDataCell>₹{parseFloat(p.price_per_unit).toFixed(2)}</CTableDataCell>
//                       <CTableDataCell>{p.qty}</CTableDataCell>
//                       <CTableDataCell><strong>₹{parseFloat(p.total).toFixed(2)}</strong></CTableDataCell>
//                       <CTableDataCell>{new Date(p.date).toLocaleDateString()}</CTableDataCell>
//                       <CTableDataCell>{p.about || '—'}</CTableDataCell>
//                       <CTableDataCell>
//                         <CButton color="warning" size="sm" onClick={() => openEdit(p)}>
//                           {/* <CIcon icon={cilPencil} /> */}
//                            Edit
//                         </CButton>
//                       </CTableDataCell>
//                     </CTableRow>
//                   ))}
//                 </CTableBody>
//               </CTable>
//             </div>
//           ) : (
//             <CAlert color="info" className="text-center">
//               No purchases found. Click <strong>Add Purchase</strong> to create one.
//             </CAlert>
//           )}
//         </CCardBody>
//       </CCard>

//       {/* ---------- ADD MODAL ---------- */}
//       <CModal
//         size="xl"
//         visible={showAddModal}
//         onClose={() => setShowAddModal(false)}
//         backdrop="static"
//       >
//         <CModalHeader closeButton>
//           <CModalTitle>Add New Purchase</CModalTitle>
//         </CModalHeader>
//         <PurchaseForm
//           vendors={vendors}
//           onSuccess={() => {
//             setShowAddModal(false);
//             refreshTable();
//           }}
//           onCancel={() => setShowAddModal(false)}
//         />
//       </CModal>

//       {/* ---------- EDIT MODAL (optional) ---------- */}
//       {editItem && (
//         <EditPurchaseModal
//           visible={showEditModal}
//           purchase={editItem}
//           vendors={vendors}
//           onClose={() => {
//             setShowEditModal(false);
//             setEditItem(null);
//           }}
//           onSuccess={refreshTable}
//         />
//       )}
//     </>
//   );
// };

// export default PurchaseList;
































































































// import React, { useEffect, useState } from 'react';
// import {
//   CButton,
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CRow,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
//   CSpinner,
//   CAlert,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
// } from '@coreui/react';
// import { getAPICall, postAPICall, put } from '../../../util/api';
// import { useToast } from '../../common/toast/ToastContext';
// import { useTranslation } from 'react-i18next';
// import i18n from 'i18next';
// import { cilSearch, cilX, cilPencil } from '@coreui/icons';
// import CIcon from '@coreui/icons-react';
// import ProjectSelectionModal from '../../common/ProjectSelectionModal';

// const PurchesVendor = () => {
//   const [showProjectModal, setShowProjectModal] = useState(false);
//   const [vendors, setVendors] = useState([]);
//   const [purchases, setPurchases] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [customerSuggestions, setCustomerSuggestions] = useState([]);
//   const [customerName, setCustomerName] = useState({ name: '', id: null });
//   const { showToast } = useToast();
//   const { t } = useTranslation("global");

//   // Edit Modal
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editForm, setEditForm] = useState({
//     payment_id: null,
//     vendor_id: '',
//     project_id: '',
//     material_name: '',
//     about: '',
//     price_per_unit: 0,
//     qty: 1,
//     date: '',
//   });
//   const [editLoading, setEditLoading] = useState(false);

//   // Add Form state
//   const [state, setState] = useState({
//     project_id: '',
//     vendor_id: '',
//     material_name: '',
//     about: '',
//     price_per_unit: 0,
//     qty: 1,
//     total: 0,
//     date: new Date().toISOString().split('T')[0],
//   });

//   // Fetch Vendors
//   const fetchVendors = async () => {
//     try {
//       const response = await getAPICall('/api/getPurchesVendor');
//       setVendors(response || []);
//     } catch (error) {
//       showToast('danger', 'Error fetching vendors');
//     }
//   };

//   // Fetch Purchases
//   const fetchPurchases = async () => {
//     setLoading(true);
//     try {
//       const response = await getAPICall('/api/purchesVendor');
//       if (response && response.data) {
//         setPurchases(response.data);
//       } else {
//         setPurchases([]);
//       }
//     } catch (error) {
//       showToast('danger', 'Failed to load purchases');
//       setPurchases([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchVendors();
//     fetchPurchases();
//   }, [i18n.language]);

//   // Calculate total for Add form
//   const calculateTotal = (qty, price) => {
//     return Number((qty * price).toFixed(2));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setState(prev => {
//       const updated = { ...prev, [name]: value };
//       if (name === "qty" || name === "price_per_unit") {
//         const qty = name === "qty" ? parseFloat(value) || 0 : parseFloat(prev.qty) || 0;
//         const price = name === "price_per_unit" ? parseFloat(value) || 0 : parseFloat(prev.price_per_unit) || 0;
//         updated.total = calculateTotal(qty, price);
//       }
//       return updated;
//     });
//   };

//   // Project Search
//   const searchProject = async (value) => {
//     if (value.length > 0) {
//       try {
//         const projects = await getAPICall(`/api/projects?searchQuery=${value}`);
//         setCustomerSuggestions(projects || []);
//       } catch {
//         showToast('danger', 'Error searching projects');
//       }
//     } else {
//       setCustomerSuggestions([]);
//     }
//   };

//   const handleCustomerNameChange = (e) => {
//     const value = e.target.value;
//     setCustomerName({ name: value, id: null });
//     searchProject(value);
//   };

//   const handleCustomerSelect = (project) => {
//     setCustomerName({ name: project.project_name, id: project.id });
//     setState(prev => ({ ...prev, project_id: project.id }));
//     setCustomerSuggestions([]);
//   };

//   // Submit Add
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!state.project_id) return showToast('danger', 'Please select a project');
//     if (!state.vendor_id) return showToast('danger', 'Please select a vendor');
//     if (!state.material_name.trim()) return showToast('danger', 'Enter material name');
//     if (state.price_per_unit <= 0) return showToast('danger', 'Price must be > 0');
//     if (state.qty <= 0) return showToast('danger', 'Quantity must be > 0');

//     const payload = {
//       project_id: parseInt(state.project_id),
//       vendor_id: parseInt(state.vendor_id),
//       material_name: state.material_name,
//       about: state.about || null,
//       price_per_unit: parseFloat(state.price_per_unit),
//       qty: parseFloat(state.qty),
//       total: parseFloat(state.total),
//       date: state.date,
//       paid_amount: 0,
//     };

//     try {
//       await postAPICall('/api/purchesVendor', payload);
//       showToast('success', 'Purchase saved successfully!');
//       handleClear();
//       fetchPurchases();
//     } catch (error) {
//       showToast('danger', 'Failed to save: ' + (error.response?.data?.message || error.message));
//     }
//   };

//   const handleClear = () => {
//     setState({
//       project_id: '',
//       vendor_id: '',
//       material_name: '',
//       about: '',
//       price_per_unit: 0,
//       qty: 1,
//       total: 0,
//       date: new Date().toISOString().split('T')[0],
//     });
//     setCustomerName({ name: '', id: null });
//     setCustomerSuggestions([]);
//   };

//   // Open Edit Modal
//   const openEditModal = (purchase) => {
//     setEditForm({
//       payment_id: purchase.id,
//       vendor_id: purchase.vendor_id.toString(),
//       project_id: purchase.project_id.toString(),
//       material_name: purchase.material_name,
//       about: purchase.about || '',
//       price_per_unit: parseFloat(purchase.price_per_unit),
//       qty: parseFloat(purchase.qty),
//       date: purchase.date,
//     });
//     setShowEditModal(true);
//   };

//   const closeEditModal = () => {
//     setShowEditModal(false);
//     setEditForm({
//       payment_id: null,
//       vendor_id: '',
//       project_id: '',
//       material_name: '',
//       about: '',
//       price_per_unit: 0,
//       qty: 1,
//       date: '',
//     });
//   };

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm(prev => ({ ...prev, [name]: value }));
//   };

//   const handleUpdate = async () => {
//     if (!editForm.material_name.trim()) return showToast('danger', 'Material name is required');
//     if (editForm.price_per_unit <= 0) return showToast('danger', 'Price must be > 0');
//     if (editForm.qty <= 0) return showToast('danger', 'Quantity must be > 0');

//     const payload = {
//       payment_id: parseInt(editForm.payment_id),
//       vendor_id: parseInt(editForm.vendor_id),
//       project_id: parseInt(editForm.project_id),
//       material_name: editForm.material_name,
//       about: editForm.about || null,
//       price_per_unit: parseFloat(editForm.price_per_unit),
//       qty: parseFloat(editForm.qty),
//       date: editForm.date,
//     };

//     setEditLoading(true);
//     try {
//       await put('/api/updatePurchesVendorPayment', payload);
//       showToast('success', 'Purchase updated successfully!');
//       closeEditModal();
//       fetchPurchases();
//     } catch (error) {
//       showToast('danger', 'Update failed: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setEditLoading(false);
//     }
//   };

//   return (
//     <>
//       <style jsx global>{`
//         .suggestions-list {
//           position: absolute; z-index: 1000; background: white;
//           border: 1px solid #ccc; max-height: 200px; overflow-y: auto; width: 100%;
//           margin: 0; padding: 0; list-style: none; border-radius: 0.375rem;
//           box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//         }
//         .suggestions-list li {
//           padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;
//         }
//         .suggestions-list li:hover { background: #f8f9fa; }
//       `}</style>

//       <CRow>
//         <CCol xs={12}>
//           {/* ADD FORM */}
//           <CCard className="mb-4">
//             <CCardHeader>
//               <strong>Add Purchase</strong>
//             </CCardHeader>
//             <CCardBody>
//               <CForm onSubmit={handleSubmit}>
//                 <CRow className="g-3">
//                   {/* Project */}
//                   <CCol md={4} style={{ position: 'relative' }}>
//                     <CFormLabel><b>Project Name *</b></CFormLabel>
//                     <div style={{ position: 'relative' }}>
//                       <CFormInput
//                         type="text"
//                         placeholder="Enter project name"
//                         value={customerName.name}
//                         onChange={handleCustomerNameChange}
//                         autoComplete="off"
//                         required
//                       />
//                       {!customerName.id ? (
//                         <CButton
//                           color="primary"
//                           variant="outline"
//                           onClick={() => setShowProjectModal(true)}
//                           style={{ position: 'absolute', right: 0, top: 0, bottom: 0, borderRadius: 0 }}
//                         >
//                           <CIcon icon={cilSearch} />
//                         </CButton>
//                       ) : (
//                         <CButton
//                           color="danger"
//                           variant="outline"
//                           onClick={() => {
//                             setCustomerName({ name: '', id: null });
//                             setState(prev => ({ ...prev, project_id: '' }));
//                             setCustomerSuggestions([]);
//                           }}
//                           style={{ position: 'absolute', right: 0, top: 0, bottom: 0, borderRadius: 0 }}
//                         >
//                           <CIcon icon={cilX} />
//                         </CButton>
//                       )}
//                     </div>
//                     {customerSuggestions.length > 0 && (
//                       <ul className="suggestions-list">
//                         {customerSuggestions.map((p) => (
//                           <li key={p.id} onClick={() => handleCustomerSelect(p)}>
//                             {p.project_name}
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </CCol>

//                   {/* Vendor */}
//                   <CCol md={4}>
//                     <CFormLabel><b>Vendor *</b></CFormLabel>
//                     <select
//                       className="form-select"
//                       name="vendor_id"
//                       value={state.vendor_id}
//                       onChange={handleChange}
//                       required
//                     >
//                       <option value="">Select Vendor</option>
//                       {vendors.map((v) => (
//                         <option key={v.id} value={v.id}>{v.name}</option>
//                       ))}
//                     </select>
//                   </CCol>

//                   {/* Material Name */}
//                   <CCol md={4}>
//                     <CFormLabel><b>Material Name *</b></CFormLabel>
//                     <CFormInput
//                       type="text"
//                       name="material_name"
//                       placeholder="e.g. Cement, Sand"
//                       value={state.material_name}
//                       onChange={handleChange}
//                       required
//                     />
//                   </CCol>
//                 </CRow>

//                 <CRow className="g-3 mt-3">
//                   <CCol md={12}>
//                     <CFormLabel><b>About (optional)</b></CFormLabel>
//                     <CFormInput
//                       type="text"
//                       name="about"
//                       placeholder="Description..."
//                       value={state.about}
//                       onChange={handleChange}
//                     />
//                   </CCol>
//                 </CRow>

//                 <CRow className="g-3 mt-3 align-items-end">
//                   <CCol md={3}>
//                     <CFormLabel><b>Price/Unit *</b></CFormLabel>
//                     <CFormInput
//                       type="number"
//                       name="price_per_unit"
//                       value={state.price_per_unit}
//                       onChange={handleChange}
//                       min="0"
//                       step="0.01"
//                       required
//                     />
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormLabel><b>Quantity *</b></CFormLabel>
//                     <CFormInput
//                       type="number"
//                       name="qty"
//                       value={state.qty}
//                       onChange={handleChange}
//                       min="0.01"
//                       step="0.01"
//                       required
//                     />
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormLabel><b>Total</b></CFormLabel>
//                     <CFormInput type="number" value={state.total} readOnly />
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormLabel><b>Date *</b></CFormLabel>
//                     <CFormInput
//                       type="date"
//                       name="date"
//                       value={state.date}
//                       onChange={handleChange}
//                       max={new Date().toISOString().split('T')[0]}
//                       required
//                     />
//                   </CCol>
//                 </CRow>

//                 <div className="mt-4">
//                   <CButton color="success" type="submit">
//                     Submit Purchase
//                   </CButton>
//                   {' '}
//                   <CButton color="secondary" type="button" onClick={handleClear}>
//                     Clear Form
//                   </CButton>
//                 </div>
//               </CForm>
//             </CCardBody>
//           </CCard>

//           {/* PURCHASES TABLE */}
//           <CCard>
//             <CCardHeader>
//               <strong>Purchase History</strong>
//             </CCardHeader>
//             <CCardBody>
//               {loading ? (
//                 <div className="text-center py-4">
//                   <CSpinner />
//                 </div>
//               ) : purchases.length > 0 ? (
//                 <div className="table-responsive">
//                   <CTable striped hover bordered>
//                     <CTableHead color="light">
//                       <CTableRow>
//                         <CTableHeaderCell>#</CTableHeaderCell>
//                         <CTableHeaderCell>Project</CTableHeaderCell>
//                         <CTableHeaderCell>Vendor</CTableHeaderCell>
//                         <CTableHeaderCell>Material</CTableHeaderCell>
//                         <CTableHeaderCell>Price/Unit</CTableHeaderCell>
//                         <CTableHeaderCell>Qty</CTableHeaderCell>
//                         <CTableHeaderCell>Total</CTableHeaderCell>
//                         <CTableHeaderCell>Date</CTableHeaderCell>
//                         <CTableHeaderCell>About</CTableHeaderCell>
//                         <CTableHeaderCell>Action</CTableHeaderCell>
//                       </CTableRow>
//                     </CTableHead>
//                     <CTableBody>
//                       {purchases.map((p, i) => (
//                         <CTableRow key={p.id}>
//                           <CTableDataCell>{i + 1}</CTableDataCell>
//                           <CTableDataCell>{p.project?.project_name || "—"}</CTableDataCell>
//                           <CTableDataCell>{p.vendor?.name || "—"}</CTableDataCell>
//                           <CTableDataCell>{p.material_name}</CTableDataCell>
//                           <CTableDataCell>₹{parseFloat(p.price_per_unit).toFixed(2)}</CTableDataCell>
//                           <CTableDataCell>{p.qty}</CTableDataCell>
//                           <CTableDataCell><strong>₹{parseFloat(p.total).toFixed(2)}</strong></CTableDataCell>
//                           <CTableDataCell>{new Date(p.date).toLocaleDateString()}</CTableDataCell>
//                           <CTableDataCell>{p.about || "—"}</CTableDataCell>
//                           <CTableDataCell>
//                             <CButton
//                               color="warning"
//                               size="sm"
//                               onClick={() => openEditModal(p)}
//                             >
//                               <CIcon icon={cilPencil} /> Edit
//                             </CButton>
//                           </CTableDataCell>
//                         </CTableRow>
//                       ))}
//                     </CTableBody>
//                   </CTable>
//                 </div>
//               ) : (
//                 <CAlert color="info" className="text-center">
//                   No purchases found. Add one above!
//                 </CAlert>
//               )}
//             </CCardBody>
//           </CCard>
//         </CCol>
//       </CRow>

//       {/* EDIT MODAL */}
//       <CModal visible={showEditModal} onClose={closeEditModal} backdrop="static" size="lg">
//         <CModalHeader onClose={closeEditModal}>
//           <CModalTitle>Edit Purchase</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           <CForm>
//             <CRow className="g-3">
//               <CCol md={6}>
//                 <CFormLabel><b>Vendor *</b></CFormLabel>
//                 <select
//                   className="form-select"
//                   name="vendor_id"
//                   value={editForm.vendor_id}
//                   onChange={handleEditChange}
//                   required
//                 >
//                   <option value="">Select Vendor</option>
//                   {vendors.map((v) => (
//                     <option key={v.id} value={v.id}>{v.name}</option>
//                   ))}
//                 </select>
//               </CCol>
//               <CCol md={6}>
//                 <CFormLabel><b>Material Name *</b></CFormLabel>
//                 <CFormInput
//                   type="text"
//                   name="material_name"
//                   value={editForm.material_name}
//                   onChange={handleEditChange}
//                   required
//                 />
//               </CCol>
//             </CRow>

//             <CRow className="g-3 mt-3">
//               <CCol md={12}>
//                 <CFormLabel><b>About (optional)</b></CFormLabel>
//                 <CFormInput
//                   type="text"
//                   name="about"
//                   value={editForm.about}
//                   onChange={handleEditChange}
//                 />
//               </CCol>
//             </CRow>

//             <CRow className="g-3 mt-3 align-items-end">
//               <CCol md={4}>
//                 <CFormLabel><b>Price/Unit *</b></CFormLabel>
//                 <CFormInput
//                   type="number"
//                   name="price_per_unit"
//                   value={editForm.price_per_unit}
//                   onChange={handleEditChange}
//                   min="0"
//                   step="0.01"
//                   required
//                 />
//               </CCol>
//               <CCol md={4}>
//                 <CFormLabel><b>Quantity *</b></CFormLabel>
//                 <CFormInput
//                   type="number"
//                   name="qty"
//                   value={editForm.qty}
//                   onChange={handleEditChange}
//                   min="0.01"
//                   step="0.01"
//                   required
//                 />
//               </CCol>
//               <CCol md={4}>
//                 <CFormLabel><b>Date *</b></CFormLabel>
//                 <CFormInput
//                   type="date"
//                   name="date"
//                   value={editForm.date}
//                   onChange={handleEditChange}
//                   max={new Date().toISOString().split('T')[0]}
//                   required
//                 />
//               </CCol>
//             </CRow>
//           </CForm>
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={closeEditModal}>
//             Cancel
//           </CButton>
//           <CButton color="primary" onClick={handleUpdate} disabled={editLoading}>
//             {editLoading ? <CSpinner size="sm" /> : 'Update'}
//           </CButton>
//         </CModalFooter>
//       </CModal>

//       {/* Project Selection Modal */}
//       <ProjectSelectionModal
//         visible={showProjectModal}
//         onClose={() => setShowProjectModal(false)}
//         onSelectProject={handleCustomerSelect}
//       />
//     </>
//   );
// };

// export default PurchesVendor;


