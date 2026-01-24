
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
import { getAPICall, deleteAPICall } from '../../../util/api';
import { getUserData, getUserType } from '../../../util/session';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useToast } from '../../common/toast/ToastContext';
import PurchaseForm from './PurchaseForm';
import EditPurchaseModal from './EditPurchaseModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { host } from '../../../util/constants';

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

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const { showToast } = useToast();
  const usertype = getUserType();

  // Filter states
  const [filterProject, setFilterProject] = useState(null);
  const [filterVendor, setFilterVendor] = useState(null);

  const observerTarget = useRef(null);

  // Fetch vendors & projects
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

  // Paginated fetch
  const fetchPurchases = async (cursor = null, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

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

  useEffect(() => {
    fetchVendors();
    fetchProjects();
    fetchPurchases();
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && hasMore && nextCursor) {
      fetchPurchases(nextCursor, true);
    }
  }, [loadingMore, loading, hasMore, nextCursor]);

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

  const handleDelete = async () => {
    if (!deleteItemId) return;
    try {
      const res = await deleteAPICall(`/api/purchesVendorById/${deleteItemId}`);
      showToast('success', res.message || 'Deleted successfully');
      setDeleteModalVisible(false);
      refreshTable();
    } catch (err) {
      showToast('danger', 'Failed to delete purchase');
    }
  };

  const openDeleteModal = (id) => {
    setDeleteItemId(id);
    setDeleteModalVisible(true);
  };

  // Filter (client-side)
  const filteredData = purchases.filter((p) => {
    const byProject = filterProject ? p.project_id === filterProject.value : true;
    const byVendor = filterVendor ? p.vendor_id === filterVendor.value : true;
    return byProject && byVendor;
  });

const formatIndianNumber = (number) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number || 0);
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};


  // ───────────────────────────────────────────────
  // DOWNLOAD PDF - With repeating header + border on every page
  // ───────────────────────────────────────────────
  const downloadPDF = () => {
    const doc = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    const user = getUserData();
    const companyInfo = user?.company_info || {};

    // Approximate header height (tune after testing)
    const headerHeight = 110; // pt

    // Function to draw full header + border (called on every page)
    const drawHeaderAndBorder = () => {
      // 1. Outer border
      doc.setDrawColor(80, 80, 80);
      doc.setLineWidth(1);
      doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

      // 2. Logo (top-right)
      const logoSize = 70; // pt (~25mm)
      const logoX = pageWidth - margin - logoSize - 15;
      const logoY = margin + 15;

      let logoUrl = null;
      if (companyInfo.logo && companyInfo.logo !== "invoice/empty.png") {
        logoUrl = `${host}/img/${companyInfo.logo}`;
      }

      if (logoUrl) {
        try {
          doc.addImage(logoUrl, 'PNG', logoX, logoY, logoSize, logoSize);
        } catch (err) {
          console.warn("Logo failed to load:", err);
          doc.setFillColor(220, 220, 240);
          doc.rect(logoX, logoY, logoSize, logoSize, 'F');
          doc.setFontSize(12);
          doc.setTextColor(100);
          doc.text("LOGO", logoX + 15, logoY + 40);
        }
      } else {
        doc.setFillColor(220, 220, 240);
        doc.rect(logoX, logoY, logoSize, logoSize, 'F');
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text("LOGO", logoX + 15, logoY + 40);
      }

      // 3. Company name & details (top-left)
      const textX = margin + 15;
      let textY = margin + 30;

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 60);
      doc.text(companyInfo.company_name || "Deshmukh Infra Soft", textX, textY);

      textY += 22;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);

      const details = [
        companyInfo.land_mark || "Urali Kanchan, Pune",
        `Phone: ${companyInfo.phone_no || "9173635656"}`,
        `Email: ${companyInfo.email_id || "shreyas.gijare.21@gmail.com"}`,
        `GSTIN: ${companyInfo.gst_number || "Not Available"}`,
      ];

      details.forEach(line => {
        if (line && line.trim()) {
          doc.text(line, textX, textY);
          textY += 15;
        }
      });

      // 4. Horizontal separator
      doc.setLineWidth(1.5);
      doc.setDrawColor(0, 0, 0);
      doc.line(margin + 10, textY + 10, pageWidth - margin - 10, textY + 10);

      // 5. Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text('PURCHASE REPORT', pageWidth / 2, textY + 35, { align: 'center' });

      // 6. Generated date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70);
      const generatedDate = new Date().toLocaleDateString('en-GB');
      doc.text(`Generated on: ${generatedDate}`, pageWidth / 2, textY + 55, { align: 'center' });

      // Return next content Y
      return textY + 70;
    }

    // Draw header on first page
    let yPosition = drawHeaderAndBorder();
    let currentPage = 1;

    // Grand Total summary
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      currentPage++;
      yPosition = drawHeaderAndBorder();
    }

    const totalQty = filteredData.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const totalAmount = filteredData.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const totalPricePerUnit = filteredData.reduce((sum, item) => sum + Number(item.price_per_unit || 0), 0);

    doc.setFillColor(231, 76, 60);
    doc.setDrawColor(192, 57, 43);
    doc.setLineWidth(2);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 35, 'FD');

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    const grandText = `Grand Total : Qty: ${totalQty} | Price/Unit Sum: ${formatIndianNumber(totalPricePerUnit)} | Total Amount: ${formatIndianNumber(totalAmount)}`;
    doc.text(grandText, pageWidth / 2, yPosition + 23, { align: 'center' });

    yPosition += 50;

    // Table columns
    const tableColumn = [
      "Sr No", "Project", "Vendor", "Material",
      "Price/Unit", "Qty", "Total", "Date", "About"
    ];

    const tableRows = filteredData.map((p, index) => [
      index + 1,
      p.project?.project_name || "—",
      p.vendor?.name || "—",
      p.material_name,
      formatIndianNumber(parseFloat(p.price_per_unit || 0)),
      p.qty || "—",
      formatIndianNumber(parseFloat(p.total || 0)),
      formatDate(p.date),
      p.about || "—"
    ]);

    // Total row
    tableRows.push([
      { content: "Total:", colSpan: 4, styles: { halign: "right", fontStyle: "bold" } },
      formatIndianNumber(totalPricePerUnit),
      totalQty,
      formatIndianNumber(totalAmount),
      "",
      ""
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: yPosition,
      theme: "grid",
      headStyles: {
        fillColor: [30, 115, 120],
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
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        // Redraw full header + border when table creates new page
        if (data.pageNumber > currentPage) {
          currentPage = data.pageNumber;
          drawHeaderAndBorder();
        }
        // Page number
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${currentPage}`,
          pageWidth / 2,
          pageHeight - 20,
          { align: 'center' }
        );
      },
    });

    // Final footer text on all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Purchase Report | Generated: ${new Date().toLocaleDateString('en-GB')}`,
        pageWidth / 2,
        pageHeight - 35,
        { align: 'center' }
      );
    }

    const fileName = `Purchase_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    showToast('success', 'PDF file downloaded successfully!');
  };

  // ───────────────────────────────────────────────
  // EXCEL DOWNLOAD (unchanged - already good)
  // ───────────────────────────────────────────────
  const downloadExcel = () => {
    import('xlsx').then(XLSX => {
      const totalQty = filteredData.reduce((sum, item) => sum + Number(item.qty || 0), 0);
      const totalAmount = filteredData.reduce((sum, item) => sum + Number(item.total || 0), 0);
      const totalPricePerUnit = filteredData.reduce((sum, item) => sum + Number(item.price_per_unit || 0), 0);

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

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");
      XLSX.writeFile(workbook, "purchase_report.xlsx");
    });
  };

  // ───────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────
  return (
    <>
      <CCard className="mb-4">
        <CCardHeader
          className="d-flex justify-content-between align-items-center flex-wrap gap-3"
          style={{ paddingBottom: "1rem" }}
        >
          <strong>Purchase History</strong>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <CButton color="primary" onClick={downloadPDF}>
              Download PDF
            </CButton>

            <CButton color="info" onClick={downloadExcel}>
              Download Excel
            </CButton>

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
                          <div className="d-flex gap-2">
                            <CButton color="warning" size="sm" onClick={() => openEdit(p)}>
                              Edit
                            </CButton>
                            {usertype === 1 && (
                              <CButton color="danger" size="sm" onClick={() => openDeleteModal(p.id)}>
                                Delete
                              </CButton>
                            )}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

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

      {/* Modals */}
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

      <ConfirmationModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        resource="Purchase Record"
        onYes={handleDelete}
      />
    </>
  );
};

export default PurchaseList;