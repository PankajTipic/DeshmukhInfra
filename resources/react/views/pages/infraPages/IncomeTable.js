import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAPICall, put } from '../../../util/api';
import { 
  CButton, CCard, CCardHeader, CCardBody, CCol, CRow, 
  CSpinner, CFormSelect, CModal, CModalHeader, CModalTitle, 
  CModalBody, CModalFooter, CForm, CFormInput, CFormLabel 
} from '@coreui/react';
import { cilSearch, cilPencil, cilWallet, cilCloudDownload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { gst } from '../../../util/Feilds';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Helper function to format numbers in Indian numeric system
const formatIndianNumber = (number) => {
  return new Intl.NumberFormat('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(number);
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const IncomeTable = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [summary, setSummary] = useState({ total_amount: 0, pending_amount: 0 });
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [amountToBePaid, setAmountToBePaid] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const observer = useRef();

  const perPage = 10;

  // Fetch projects for filtering
  const fetchProjects = useCallback(async () => {
    try {
      const response = await getAPICall('/api/projects');
      setProjects(response || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  }, []);

  // Fetch income data
  const fetchIncomes = useCallback(async (page = 1, reset = false) => {
    setLoading(true);
    try {
      let url = `/api/income?per_page=${perPage}&page=${page}`;
      if (projectId) url += `&project_id=${projectId}`;
      
      const response = await getAPICall(url);
      const newIncomes = response.incomes?.data || [];
      setIncomes(prev => reset ? newIncomes : [...prev, ...newIncomes]);
      setHasMore((response.incomes?.current_page || 1) < (response.incomes?.last_page || 1));
      setSummary(response.summary || { total_amount: 0, pending_amount: 0 });
    } catch (error) {
      console.error('Error fetching incomes:', error);
      setIncomes(prev => reset ? [] : prev);
      setSummary({ total_amount: 0, pending_amount: 0 });
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjects();
    fetchIncomes(1, true);
  }, [fetchProjects, projectId]);

  // Infinite scroll observer
  const lastIncomeElementRef = useCallback(node => {
    if (loading || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setCurrentPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchIncomes(currentPage);
    }
  }, [currentPage, fetchIncomes]);

  const handleProjectFilterChange = (e) => {
    setProjectId(e.target.value);
    setCurrentPage(1);
    setIncomes([]);
  };

  const handleEdit = (income) => {
    navigate('/projectIncome', { state: { income } });
  };

  const openPaymentModal = (income) => {
    setSelectedIncome(income);
    setAmountToBePaid('');
    setModalError('');
    setModalVisible(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIncome) return;

    const amountToPay = parseFloat(amountToBePaid) || 0;
    // if (amountToPay <= 0) {
    //   setModalError('Please enter a valid amount');
    //   return;
    // }

    const pending = parseFloat(selectedIncome.pending_amount);
    if (amountToPay > pending) {
      setModalError(`Amount to be paid cannot exceed pending amount of Rs ${formatIndianNumber(pending)}`);
      return;
    }

    const newReceivedAmount = parseFloat(selectedIncome.received_amount) + amountToPay;
    const newPendingAmount = pending - amountToPay;

    setModalLoading(true);
    try {
      const response = await put(`/api/income/${selectedIncome.id}`, {
        received_amount: newReceivedAmount.toFixed(2),
        pending_amount: newPendingAmount.toFixed(2)
      });

      if (response.message) {
        setModalVisible(false);
        fetchIncomes(1, true);
      } else {
        setModalError('Error updating payment');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      setModalError('Error updating payment');
    } finally {
      setModalLoading(false);
    }
  };

  // PDF Export Function with Payment Date
  const handlePDFExport = () => {
    const doc = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date().toLocaleDateString('en-GB');
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INCOME REPORT', pageWidth / 2, 40, { align: 'center' });
    
    // Period and Generated Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${today}`, pageWidth / 2, 60, { align: 'center' });
    doc.text('(Based on Payment Date)', pageWidth / 2, 75, { align: 'center' });
    
    // Grand Total Header
    doc.setFillColor(0, 109, 118);
    doc.rect(40, 90, pageWidth - 80, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const gstAmount = parseFloat(summary.total_amount) * (gst / (100 + gst));
    const basicAmount = parseFloat(summary.total_amount) - gstAmount;
    doc.text(
      `Grand Total: Amount: Rs ${formatIndianNumber(basicAmount)} | GST: Rs ${formatIndianNumber(gstAmount)} | Total With GST: Rs ${formatIndianNumber(parseFloat(summary.total_amount))} | Pending: Rs ${formatIndianNumber(parseFloat(summary.pending_amount))}`,
      pageWidth / 2,
      108,
      { align: 'center' }
    );
    
    let yPosition = 140;
    
    // Group incomes by project
    const groupedIncomes = incomes.reduce((acc, income) => {
      const projectName = income.project_name || 'N/A';
      if (!acc[projectName]) {
        acc[projectName] = [];
      }
      acc[projectName].push(income);
      return acc;
    }, {});
    
    // Generate table for each project
    Object.keys(groupedIncomes).forEach((projectName, index) => {
      const projectIncomes = groupedIncomes[projectName];
      
      // Add new page if not enough space
      if (yPosition > 500) {
        doc.addPage();
        yPosition = 40;
      }
      
      // Project Header
      doc.setFillColor(0, 172, 153);
      doc.rect(40, yPosition, pageWidth - 80, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Project: ${projectName}`, 50, yPosition + 17);
      
      yPosition += 35;
      
      // Table data with Payment Date
      const tableData = projectIncomes.map((income, idx) => {
        // Use payment_date if available, fallback to invoice_date
        const paymentDate = income.payment_date || income.invoice_date;
        
        return [
          idx + 1,
          formatDate(income.po_date),
          income.po_no,
          income.invoice_no,
          formatDate(income.invoice_date),
          formatDate(paymentDate), // Payment Date column
          formatIndianNumber(parseFloat(income.basic_amount)),
          formatIndianNumber(parseFloat(income.gst_amount)),
          formatIndianNumber(parseFloat(income.billing_amount)),
          formatIndianNumber(parseFloat(income.received_amount)),
          formatIndianNumber(parseFloat(income.pending_amount)),
          income.received_by || '-',
          income.payment_type.toUpperCase(),
          income.remark || '-',
          income.receivers_bank || '-'
        ];
      });
      
      // Calculate totals for this project
      const projectTotal = projectIncomes.reduce((sum, inc) => sum + parseFloat(inc.billing_amount), 0);
      const projectReceived = projectIncomes.reduce((sum, inc) => sum + parseFloat(inc.received_amount), 0);
      const projectPending = projectIncomes.reduce((sum, inc) => sum + parseFloat(inc.pending_amount), 0);
      const projectBasic = projectIncomes.reduce((sum, inc) => sum + parseFloat(inc.basic_amount), 0);
      const projectGST = projectIncomes.reduce((sum, inc) => sum + parseFloat(inc.gst_amount), 0);
      
      tableData.push([
        { content: 'Total:', colSpan: 6, styles: { fontStyle: 'bold', halign: 'right' } },
        formatIndianNumber(projectBasic),
        formatIndianNumber(projectGST),
        formatIndianNumber(projectTotal),
        formatIndianNumber(projectReceived),
        formatIndianNumber(projectPending),
        '', '', '', ''
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [[
          'Sr', 'PO Date', 'PO No', 'Invoice No', 'Invoice Date', 'Payment Date',
          'Base Amount', 'GST Rs', 'Total', 'Received', 'Pending',
          'Sent By', 'Payment Type', 'Txn ID', 'Bank'
        ]],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [210, 224, 170],
          textColor: 'black',
          fontSize: 7,
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 6,
          cellPadding: 2,
          halign: 'right'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          1: { cellWidth: 50 },
          2: { cellWidth: 45 },
          3: { cellWidth: 50 },
          4: { cellWidth: 50 },
          5: { cellWidth: 50, halign: 'center' }, // Payment Date
          6: { cellWidth: 55 },
          7: { cellWidth: 45 },
          8: { cellWidth: 55 },
          9: { cellWidth: 55 },
          10: { cellWidth: 55 },
          11: { cellWidth: 45 },
          12: { cellWidth: 45 },
          13: { cellWidth: 45 },
          14: { cellWidth: 50 }
        },
        margin: { left: 40, right: 40 },
        didDrawPage: (data) => {
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(128);
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 20,
            { align: 'center' }
          );
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 20;
    });
    
    doc.save(`Income_Report_${today.replace(/\//g, '-')}.pdf`);
  };

  // Excel Export Function with Payment Date
  const handleExcelExport = () => {
    const workbook = XLSX.utils.book_new();
    const today = new Date().toLocaleDateString('en-GB');

    // Group incomes by project
    const groupedIncomes = incomes.reduce((acc, income) => {
      const projectName = income.project_name || 'N/A';
      if (!acc[projectName]) acc[projectName] = [];
      acc[projectName].push(income);
      return acc;
    }, {});

    Object.keys(groupedIncomes).forEach(projectName => {
      const projectIncomes = groupedIncomes[projectName];

      const gstAmount = parseFloat(summary.total_amount) * (gst / (100 + gst));
      const basicAmount = parseFloat(summary.total_amount) - gstAmount;

      // Sheet header (title and summary)
      const headerRows = [
        [
          {
            v: 'INCOME REPORT',
            t: 's',
            s: {
              font: { bold: true, sz: 18, color: { rgb: "FFFFFF" } },
              alignment: { horizontal: 'center' },
              fill: { fgColor: { rgb: "006D76" } },
            },
          },
        ],
        [
          {
            v: `Generated on: ${today} (Based on Payment Date)`,
            t: 's',
            s: {
              font: { bold: false, sz: 10 },
              alignment: { horizontal: 'center' },
            },
          },
        ],
        [
          {
            v: `Grand Total: Amount: Rs ${formatIndianNumber(basicAmount)} | GST: Rs ${formatIndianNumber(gstAmount)} | Total With GST: Rs ${formatIndianNumber(parseFloat(summary.total_amount))} | Pending: Rs ${formatIndianNumber(parseFloat(summary.pending_amount))}`,
            t: 's',
            s: {
              font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
              alignment: { horizontal: 'center', wrapText: true },
              fill: { fgColor: { rgb: "00AC99" } },
            },
          },
        ],
        [],
      ];

      // Table headers with Payment Date
      const tableHeader = [
        [
          'Sr', 'PO Date', 'PO No', 'Invoice No', 'Invoice Date', 'Payment Date',
          'Base Amount', 'GST Rs', 'Total', 'Received', 'Pending',
          'Sent By', 'Payment Type', 'Txn ID', 'Bank'
        ]
      ];

      const tableData = projectIncomes.map((income, idx) => {
        const paymentDate = income.payment_date || income.invoice_date;
        
        return [
          idx + 1,
          formatDate(income.po_date),
          income.po_no,
          income.invoice_no,
          formatDate(income.invoice_date),
          formatDate(paymentDate), // Payment Date
          parseFloat(income.basic_amount),
          parseFloat(income.gst_amount),
          parseFloat(income.billing_amount),
          parseFloat(income.received_amount),
          parseFloat(income.pending_amount),
          income.received_by || '-',
          income.payment_type.toUpperCase(),
          income.remark || '-',
          income.receivers_bank || '-'
        ];
      });

      // Totals
      const projectTotal = projectIncomes.reduce((sum, inc) => sum + parseFloat(inc.billing_amount), 0);
      const projectReceived = projectIncomes.reduce((sum, inc) => sum + parseFloat(inc.received_amount), 0);
      const projectPending = projectIncomes.reduce((sum, inc) => sum + parseFloat(inc.pending_amount), 0);
      const projectBasic = projectIncomes.reduce((sum, inc) => sum + parseFloat(inc.basic_amount), 0);
      const projectGST = projectIncomes.reduce((sum, inc) => sum + parseFloat(inc.gst_amount), 0);

      tableData.push([
        '', '', '', '', '', 'TOTAL:',
        projectBasic, projectGST, projectTotal,
        projectReceived, projectPending, '', '', '', ''
      ]);

      // Merge all data together
      const sheetData = [...headerRows, ...tableHeader, ...tableData];

      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // Merge header cells
      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } },
      ];

      // Style table header
      const headerStyle = {
        font: { bold: true, sz: 10 },
        fill: { fgColor: { rgb: "D2E0AA" } },
        alignment: { horizontal: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: "006D76" } },
          bottom: { style: 'thin', color: { rgb: "006D76" } },
          left: { style: 'thin', color: { rgb: "006D76" } },
          right: { style: 'thin', color: { rgb: "006D76" } },
        },
      };

      // Apply style to header row
      const headerRowIndex = headerRows.length;
      for (let i = 0; i < 15; i++) {
        const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: i });
        if (worksheet[cellRef]) worksheet[cellRef].s = headerStyle;
      }

      const sheetName = projectName.substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    const todayFormatted = today.replace(/\//g, '-');
    XLSX.writeFile(workbook, `Income_Report_${todayFormatted}.xlsx`);
  };

  return (
    <div className="container-fluid py-4">
      <CCard>
        <CCardHeader className="bg-success text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Income Details</h5>
          <div className="d-flex gap-2">
            <CButton color="light" size="sm" onClick={handlePDFExport} disabled={incomes.length === 0}>
              <CIcon icon={cilCloudDownload} className="me-1" />
              PDF
            </CButton>
            <CButton color="light" size="sm" onClick={handleExcelExport} disabled={incomes.length === 0}>
              <CIcon icon={cilCloudDownload} className="me-1" />
              Excel
            </CButton>
            <CButton color="light" size="sm" onClick={() => fetchIncomes(1, true)}>
              <CIcon icon={cilSearch} className="me-1" />
              Refresh
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {/* Filters */}
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormSelect
                value={projectId}
                onChange={handleProjectFilterChange}
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.project_name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          {/* Summary */}
          <CRow className="mb-3">
            <CCol md={12}>
              <div className="alert alert-info mb-0">
                <div className="row">
                  <div className="col-md-4">
                    <strong>Total Amount With GST:</strong><br />
                    Rs {formatIndianNumber(parseFloat(summary.total_amount))}
                  </div>
                  {/* <div className="col-md-4">
                    <strong>Total Pending Amount:</strong><br />
                    Rs {formatIndianNumber(parseFloat(summary.pending_amount))}
                  </div> */}
                  <div className="col-md-4">
                    <small className="text-muted">
                      <strong>📅 Note:</strong> Reports are based on Payment Date when available, 
                      otherwise Invoice Date is used.
                    </small>
                  </div>
                </div>
              </div>
            </CCol>
          </CRow>

          {loading && incomes.length === 0 ? (
            <div className="text-center py-4">
              <CSpinner />
              <div className="mt-2">Loading income records...</div>
            </div>
          ) : incomes.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead className="table-success">
                  <tr>
                    <th style={{ textAlign: 'right' }}>ID</th>
                    <th style={{ textAlign: 'right' }}>Project Name</th>
                    <th style={{ textAlign: 'right' }}>PO No</th>
                    <th style={{ textAlign: 'right' }}>PO Date</th>
                    <th style={{ textAlign: 'right' }}>Invoice No</th>
                    <th style={{ textAlign: 'right' }}>Invoice Date</th>
                    <th style={{ textAlign: 'right' }}>Payment Date</th>
                    <th style={{ textAlign: 'right' }}>Amount Before GST</th>
                    <th style={{ textAlign: 'right' }}>GST {gst}%</th>
                    <th style={{ textAlign: 'right' }}>Amount With GST</th>
                    <th style={{ textAlign: 'right' }}>Received Amount</th>
                    {/* <th style={{ textAlign: 'right' }}>Pending Amount</th> */}
                    <th style={{ textAlign: 'right' }}>Sent By</th>
                    <th style={{ textAlign: 'right' }}>Payment Type</th>
                    <th style={{ textAlign: 'right' }}>Transaction ID</th>
                    <th style={{ textAlign: 'right' }}>Received Bank</th>
                    {/* <th style={{ textAlign: 'right' }}>Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((income, index) => {
                    const paymentDate = income.payment_date || income.invoice_date;
                    
                    return (
                      <tr key={income.id} ref={index === incomes.length - 1 ? lastIncomeElementRef : null}>
                        <td style={{ textAlign: 'right' }}>{income.id}</td>
                        <td style={{ textAlign: 'right' }}>{income.project_name || 'N/A'}</td>
                        <td style={{ textAlign: 'right' }}>{income.po_no}</td>
                        <td style={{ textAlign: 'right' }}>{formatDate(income.po_date)}</td>
                        <td style={{ textAlign: 'right' }}>{income.invoice_no}</td>
                        <td style={{ textAlign: 'right' }}>{formatDate(income.invoice_date)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={income.payment_date ? 'badge bg-success' : 'text-muted'}>
                            {formatDate(paymentDate)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>{formatIndianNumber(parseFloat(income.basic_amount))}</td>
                        <td style={{ textAlign: 'right' }}>{formatIndianNumber(parseFloat(income.gst_amount))}</td>
                        <td style={{ textAlign: 'right' }}>{formatIndianNumber(parseFloat(income.billing_amount))}</td>
                        <td style={{ textAlign: 'right' }}>{formatIndianNumber(parseFloat(income.received_amount))}</td>
                        {/* <td style={{ textAlign: 'right' }}>
                          {parseFloat(income.pending_amount) > 0 ? (
                            <span className="badge bg-danger">{formatIndianNumber(parseFloat(income.pending_amount))}</span>
                          ) : (
                            'NA'
                          )}
                        </td> */}
                        <td style={{ textAlign: 'right' }}>{income.received_by}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="badge bg-primary">{income.payment_type.toUpperCase()}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>{income.remark || 'N/A'}</td>
                        <td style={{ textAlign: 'right' }}>{income.receivers_bank}</td>
                        {/* <td style={{ textAlign: 'right' }} className="d-flex gap-2">
                          <CButton
                            color="warning"
                            size="sm"
                            onClick={() => handleEdit(income)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          {parseFloat(income.pending_amount) > 0 && (
                            <CButton
                              color="success"
                              size="sm"
                              onClick={() => openPaymentModal(income)}
                            >
                              <CIcon icon={cilWallet} />
                            </CButton>
                          )}
                        </td> */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {loading && incomes.length > 0 && (
                <div className="text-center py-4">
                  <CSpinner />
                  <div className="mt-2">Loading more records...</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-muted">No income records found</div>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Payment Update Modal */}
      {selectedIncome && (
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Update Payment for Invoice {selectedIncome.invoice_no}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm onSubmit={handlePaymentSubmit}>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="billing_amount">Amount With GST Rs</CFormLabel>
                  <CFormInput
                    step="0.01"
                    value={formatIndianNumber(parseFloat(selectedIncome.billing_amount))}
                    disabled
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="received_amount">Received Amount Rs</CFormLabel>
                  <CFormInput
                    step="0.01"
                    value={formatIndianNumber(parseFloat(selectedIncome.received_amount))}
                    disabled
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="pending_amount">Pending Amount Rs</CFormLabel>
                  <CFormInput
                    step="0.01"
                    value={formatIndianNumber(parseFloat(selectedIncome.pending_amount))}
                    disabled
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="amount_to_be_paid">Amount To Be Paid Rs *</CFormLabel>
                  <CFormInput
                    type="number"
                    step="0.01"
                    value={amountToBePaid}
                    onChange={(e) => setAmountToBePaid(e.target.value)}
                    placeholder="Enter amount to be paid"
                    required
                  />
                </CCol>
              </CRow>
              {modalError && (
                <CRow>
                  <CCol>
                    <div className="alert alert-danger" role="alert">
                      {modalError}
                    </div>
                  </CCol>
                </CRow>
              )}
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handlePaymentSubmit} disabled={modalLoading}>
              {modalLoading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                'Update Payment'
              )}
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </div>
  );
};

export default IncomeTable;