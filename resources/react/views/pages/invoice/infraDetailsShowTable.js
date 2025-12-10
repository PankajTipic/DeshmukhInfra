
// import React, { useEffect, useMemo, useState } from 'react'
// import { getAPICall } from '../../../util/api'
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CTable,
//   CTableBody,
//   CTableDataCell,
//   CTableHead,
//   CTableHeaderCell,
//   CTableRow,
//   CFormSelect,
//   CFormInput,
//   CButton,
//   CRow,
//   CCol,
// } from '@coreui/react'
// import * as XLSX from 'xlsx'
// import jsPDF from 'jspdf'
// import 'jspdf-autotable'
// import { getUserType } from '../../../util/session'

// function InfraDetailsShowTable() {
//   const [rows, setRows] = useState([])
//   const [point, setPoint] = useState('')
//   const [startDate, setStartDate] = useState('')
//   const [endDate, setEndDate] = useState('')
//   const [loading, setLoading] = useState(false)



// const fetchRecords = async (filters = {}) => {
//   try {
//     const userType = getUserType();
//     let apiUrl = "/api/drilling";

//     if (userType === 2) {
//       apiUrl = "/api/getDataByUserId";
//     }

//     if (filters.start_date && filters.end_date) {
//       const params = new URLSearchParams({
//         start_date: filters.start_date,
//         end_date: filters.end_date,
//       }).toString();
//       apiUrl = `${apiUrl}?${params}`;
//     }

//     setLoading(true);
//     const response = await getAPICall(apiUrl);
//     const records = response.data;

//     const flattened = [];
//     records.forEach((rec, idx) => {
//       const workLen = rec.work_point_detail?.length || 0;
//       const surveyLen = rec.survey_detail?.length || 0;
//       const machineLen = rec.machine_reading?.length || 0;

//       // ✅ get max rows across all three arrays
//       const totalRows = Math.max(workLen, surveyLen, machineLen, 1);

//       for (let i = 0; i < totalRows; i++) {
//         const work = rec.work_point_detail?.[i] || {};
//         const survey = rec.survey_detail?.[i] || {};
//         const machine = rec.machine_reading?.[i] || {};

//         flattened.push({
//           srNo: idx + 1,
//           date: rec.date,
//           site: rec.project?.project_name || '',
//           operator: rec.operator?.name,

//           // ✅ Machine reading (row-wise)
//           machineStartEnd: machine.machine_start && machine.machine_end
//             ? `${machine.machine_start} - ${machine.machine_end}`
//             : '',
//           machineHour: machine.actual_machine_hr || '',

//           // ✅ Compressor data (old fields, if needed)
//           compStartEnd: `${rec.comp_rpm_start || ''} - ${rec.comp_rpm_end || ''}`,
//           compHour: rec.com_actul_hr,

//           // ✅ Work
//           workType: work.work_type || '',
//           workPoint: work.work_point || '',
//           workRate: work.rate || '',
//           workTotal: Number(work.total) || 0,

//           // ✅ Survey
//           surveyType: survey.survey_type || '',
//           surveyPoint: survey.survey_point || '',
//           surveyRate: survey.rate || '',
//           surveyTotal: Number(survey.total) || 0,

//           // ✅ Grand total (work + survey)
//           rowTotal: (Number(work.total) || 0) + (Number(survey.total) || 0),

//           rowSpan: totalRows,
//           isFirstRow: i === 0,
//         });
//       }
//     });

//     setRows(flattened);
//   } catch (error) {
//     console.error("Error fetching records:", error);
//   } finally {
//     setLoading(false);
//   }
// };






//   const downloadExcel = () => {
 
//   const headers = [
//   'Sr.No.',
//   'Date',
//   'Site',
//   'Operator/Helper',
//   'Machine Start-End Reading',
//   'Actual Hour in Machine',
//   'Compressor RPM Start-End',
//   'Actual Hours RPM',
//   'Work Type',
//   'Point',
//   'Rate',
//   'Total Bill',
//   'Surveyor Local Work',
//   'Point/Acre',
//   'Surveyor Payment',
//   'Total Bill',
//   'Grand Total'   // new
// ]



//   const data = rows.map(row => [
//   row.srNo,
//   new Date(row.date).toLocaleDateString(),
//   row.site,
//   row.operator,
//   row.machineStartEnd,
//   row.machineHour,
//   row.compStartEnd,
//   row.compHour,
//   row.workType,
//   row.workPoint,
//   row.workRate,
//   row.workTotal,
//   row.surveyType,
//   row.surveyPoint,
//   row.surveyRate,
//   row.surveyTotal,
//   row.rowTotal,   // new
// ])


//   const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])  // AOA = Array of Arrays
//   const workbook = XLSX.utils.book_new()
//   XLSX.utils.book_append_sheet(workbook, worksheet, 'InfraDetails')

//   // Auto column width
//   const colWidths = headers.map((h, i) => ({
//     wch: Math.max(h.length, ...data.map(r => (r[i] ? r[i].toString().length : 0))) + 2
//   }))
//   worksheet['!cols'] = colWidths

//   XLSX.writeFile(workbook, 'InfraDetails.xlsx')
// }


//   const downloadPDF = () => {
//     const doc = new jsPDF()
//     doc.text('Infra Details Report', 14, 10)
 
//     const tableColumn = [
//   'Sr.No.',
//   'Date',
//   'Site',
//   'Operator',
//   'Machine Start-End',
//   'Machine Hr',
//   'Comp Start-End',
//   'Comp Hr',
//   'Work Type',
//   'Point',
//   'Rate',
//   'Work Total',
//   'Survey Type',
//   'Survey Point',
//   'Survey Rate',
//   'Survey Total',
//   'Grand Total'  // new
// ]


  

// const tableRows = rows.map((row) => [
//   row.srNo,
//   new Date(row.date).toLocaleDateString(),
//   row.site,
//   row.operator,
//   row.machineStartEnd,
//   row.machineHour,
//   row.compStartEnd,
//   row.compHour,
//   row.workType,
//   row.workPoint,
//   row.workRate,
//   row.workTotal,
//   row.surveyType,
//   row.surveyPoint,
//   row.surveyRate,
//   row.surveyTotal,
//   row.rowTotal,   // new
// ])


//     doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 })
//     doc.save('InfraDetails.pdf')
//   }

//   useEffect(() => {
//     fetchRecords()
//   }, [])

//    const totalRowValue = useMemo(() => {
//     return rows.reduce((sum, row) => sum + (Number(row.rowTotal) || 0), 0);
//   }, [rows]);


//   // 🔹 handle filter submit
//   const handleFilter = () => {
//     fetchRecords({
//       start_date: startDate || undefined,
//       end_date: endDate || undefined,
//       max_point: point || undefined,
//     })
//   }


//   return (
//     <div>
//       {/* Invoice Filter Section */}
//       <CCard className="mb-4">
//        <CCardHeader>
//   <div className="d-flex justify-content-between align-items-center mb-2">
//     {/* Left Side: Buttons */}
//     <div>
//       <CButton color="success" className="me-2" onClick={downloadExcel}>
//         Download Excel
//       </CButton>
//       <CButton color="danger" onClick={downloadPDF}>
//         Download PDF
//       </CButton>
//     </div>

//     {/* Right Side: Total */}
//     <h4 className="mb-0">Total Amount : {totalRowValue}</h4>
//   </div>


// <CRow className="align-items-end">
//             <CCol md={3}>
//               <CFormInput
//                 type="date"
//                 label="Start Date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//               />
//             </CCol>
//             <CCol md={3}>
//               <CFormInput
//               className=''
//                 type="date"
//                 label="End Date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//               />
//             </CCol>
//            { /*<CCol md={3}>
//                <CFormInput
//                 type="number"
//                 label="Max Point"
//                 placeholder="Enter point (e.g. 500)"
//                 value={point}
//                 onChange={(e) => setPoint(e.target.value)}
//               />
//             </CCol> */}
//             <CCol md={6}>
//               <CButton color="primary" onClick={handleFilter}>
//                 Apply Filter
//               </CButton>
//     <CButton 
//       color="secondary" 
//       className="ms-2"
//       onClick={() => {
//         setStartDate('');
//         setEndDate('');
//         // setPoint(''); // if you need point reset too
//         fetchRecords(); // ✅ reload without filters
//       }}
//     >
//       Reset
//     </CButton>

//             </CCol>
//           </CRow>

// </CCardHeader>
//   </CCard>

//       {/* Table Section */}
//       {rows.length > 0 && (
//         <CCard className="mt-4">
//           {/* <CCardHeader className="bg-dark text-white">
//             <h5 className="mb-0">Infra Details</h5>
//           </CCardHeader> */}
//           <CCardBody className="p-0">
//             <div className="table-responsive">
//               <CTable bordered hover>
//                 <CTableHead color="dark">
//                   <CTableRow>
//                     <CTableHeaderCell>Sr.No.</CTableHeaderCell>
//                     <CTableHeaderCell>Date</CTableHeaderCell>
//                     <CTableHeaderCell>Site</CTableHeaderCell>
//                     <CTableHeaderCell>Operator/Helper</CTableHeaderCell>
//                     <CTableHeaderCell>Machine Start-End Reading</CTableHeaderCell>
//                     <CTableHeaderCell>Actual Hour in Machine</CTableHeaderCell>
//                     <CTableHeaderCell>Compressor RPM Start-End</CTableHeaderCell>
//                     <CTableHeaderCell>Actual Hours RPM</CTableHeaderCell>
//                     <CTableHeaderCell>Work Type</CTableHeaderCell>
//                     <CTableHeaderCell>Point</CTableHeaderCell>
//                     <CTableHeaderCell>Rate</CTableHeaderCell>
//                     <CTableHeaderCell>Total Bill</CTableHeaderCell>
//                     <CTableHeaderCell>Surveyor Local Work</CTableHeaderCell>
//                     <CTableHeaderCell>Point/Acre</CTableHeaderCell>
//                     <CTableHeaderCell>Surveyor Payment</CTableHeaderCell>
//                     <CTableHeaderCell>Total Bill</CTableHeaderCell>
//                     <CTableHeaderCell>Grand Total</CTableHeaderCell>

//                   </CTableRow>
//                 </CTableHead>
//                 <CTableBody>
//                   {rows.map((row, i) => (
//                     <CTableRow key={i}>
//                       {row.isFirstRow && (
//                         <>
//                           <CTableDataCell rowSpan={row.rowSpan} className="align-middle text-center">
//                             {row.srNo}
//                           </CTableDataCell>
//                           <CTableDataCell rowSpan={row.rowSpan} className="align-middle text-center">
//                             {new Date(row.date).toLocaleDateString()}
//                           </CTableDataCell>
//                           <CTableDataCell rowSpan={row.rowSpan} className="align-middle text-center">
//                             {row.site}
//                           </CTableDataCell>
//                           <CTableDataCell rowSpan={row.rowSpan} className="align-middle text-center">
//                             {row.operator}
//                           </CTableDataCell>
//                           <CTableDataCell rowSpan={row.rowSpan} className="align-middle text-center">
//                             {row.machineStartEnd}
//                           </CTableDataCell>
//                           <CTableDataCell rowSpan={row.rowSpan} className="align-middle text-center">
//                             {row.machineHour}
//                           </CTableDataCell>
//                           <CTableDataCell rowSpan={row.rowSpan} className="align-middle text-center">
//                             {row.compStartEnd}
//                           </CTableDataCell>
//                           <CTableDataCell rowSpan={row.rowSpan} className="align-middle text-center">
//                             {row.compHour}
//                           </CTableDataCell>



//                         </>
//                       )}

//                       <CTableDataCell>{row.workType}</CTableDataCell>
//                       <CTableDataCell>{row.workPoint}</CTableDataCell>
//                       <CTableDataCell>{row.workRate}</CTableDataCell>
//                       <CTableDataCell className="fw-bold text-primary">{row.workTotal}</CTableDataCell>

//                       <CTableDataCell>{row.surveyType}</CTableDataCell>
//                       <CTableDataCell>{row.surveyPoint}</CTableDataCell>
//                       <CTableDataCell>{row.surveyRate}</CTableDataCell>
//                       <CTableDataCell className="fw-bold text-primary">{row.surveyTotal}</CTableDataCell>

//                       {/* <CTableDataCell>{row.surveyTotal}</CTableDataCell> */}
// <CTableDataCell className="fw-bold text-success">{row.rowTotal}</CTableDataCell>


//                     </CTableRow>
//                   ))}
//                 </CTableBody>
//               </CTable>
//             </div>
//           </CCardBody>


                  


//         </CCard>
//       )}
//     </div>
//   )
// }

// export default InfraDetailsShowTable





import React, { useEffect, useMemo, useState } from 'react'
import { deleteAPICall, getAPICall } from '../../../util/api'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CButton,
  CRow,
  CCol,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { getUserType } from '../../../util/session'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../common/toast/ToastContext'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'

function InfraDetailsShowTable() {
  const [rows, setRows] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  // const [projectName, setProjectName] = useState('')
  const [maxPoint, setMaxPoint] = useState('')
  const [loading, setLoading] = useState(false)

  // inside InfraDetailsShowTable component
const [projects, setProjects] = useState([]) // ✅ store project list
const [projectName, setProjectName] = useState('')

const navigate = useNavigate();

const { showToast } = useToast();

// fetch project list
const fetchProjects = async () => {
  try {
    const response = await getAPICall('/api/myProjects')
    setProjects(response || [])
  } catch (err) {
    console.error("Error fetching projects:", err)
  }
}

// call it when component mounts
useEffect(() => {
  fetchProjects()
}, [])

  const fetchRecords = async (filters = {}) => {
    try {
      const userType = getUserType()
      let apiUrl = "/api/drilling"

      if (userType === 2) {
        apiUrl = "/api/getDataByUserId"
      }

      // ✅ Build query params from filters
      const params = new URLSearchParams()
      if (filters.start_date && filters.end_date) {
        params.append('start_date', filters.start_date)
        params.append('end_date', filters.end_date)
      }
      if (filters.project_name) {
        params.append('project_name', filters.project_name)
      }
      if (filters.max_point) {
        params.append('max_point', filters.max_point)
      }

      if ([...params].length > 0) {
        apiUrl = `${apiUrl}?${params.toString()}`
      }

      setLoading(true)
      const response = await getAPICall(apiUrl)
      const records = response.data

      const flattened = []
      records.forEach((rec, idx) => {
        const workLen = rec.work_point_detail?.length || 0
        const surveyLen = rec.survey_detail?.length || 0
        const machineLen = rec.machine_reading?.length || 0
        const compressorRpmLen = rec.compressor_rpm?.length || 0

        const totalRows = Math.max(workLen, surveyLen, machineLen,compressorRpmLen, 1)

        for (let i = 0; i < totalRows; i++) {
          const work = rec.work_point_detail?.[i] || {}
          const survey = rec.survey_detail?.[i] || {}
          const machine = rec.machine_reading?.[i] || {}
          const compressorRpm = rec.compressor_rpm?.[i] || {}


  //         flattened.push({
  //           srNo: idx + 1,
  //           date: rec.date,
  //           site: rec.project?.project_name || '',

  //           operator: machine.operator?.name || rec.operator?.name || '',

  //           machineStart: machine.machine_start || '',
  //           machineEnd: machine.machine_end || '',
  //           machineHr: machine.actual_machine_hr || '',

  //           // compressorStart:rec.comp_rpm_start || '',
  //           // compressorEnd:rec.comp_rpm_start || '',
  //           // compressorHr:rec.com_actul_hr || '',

  //            // ✅ compressor only on first row
  // compressorStart: i === 0 ? rec.comp_rpm_start || '' : null,
  // compressorEnd: i === 0 ? rec.comp_rpm_end || '' : null,
  // compressorHr: i === 0 ? rec.com_actul_hr || '' : null,

  //           workType: work.work_type || '',
  //           workPoint: work.work_point || '',
  //           workRate: work.rate || '',
  //           workTotal: Number(work.total) || 0,

  //           surveyType: survey.survey_type || '',
  //           surveyPoint: survey.survey_point || '',
  //           surveyRate: survey.rate || '',
  //           surveyTotal: Number(survey.total) || 0,

  //           rowTotal:
  //             (Number(work.total) || 0) +
  //             (Number(survey.total) || 0),

  //           isFirstRow: i === 0,
  //           rowSpan: totalRows,
  //         })

            flattened.push({
  srNo: idx + 1,
  date: rec.date,
  site: rec.project?.project_name || '',
  operator: machine.operator?.name || rec.operator?.name || '',

  machineStart: machine.machine_start || '',
  machineEnd: machine.machine_end || '',
  machineHr: machine.actual_machine_hr || '',

  // compressorStart: i === 0 ? rec.comp_rpm_start || '' : null,
  // compressorEnd: i === 0 ? rec.comp_rpm_end || '' : null,
  // compressorHr: i === 0 ? rec.com_actul_hr || '' : null,

  compressorStart: compressorRpm.comp_rpm_start || '',
  compressorEnd: compressorRpm.comp_rpm_end || '' ,
  compressorHr: compressorRpm.com_actul_hr || '' ,

  workType: work.work_type || '',
  workPoint: work.work_point || '',
  workRate: work.rate || '',
  workTotal: Number(work.total) || 0,

  surveyType: survey.survey_type || '',
  surveyPoint: survey.survey_point || '',
  surveyRate: survey.rate || '',
  surveyTotal: Number(survey.total) || 0,

  rowTotal: (Number(work.total) || 0) + (Number(survey.total) || 0),

  isFirstRow: i === 0,
  rowSpan: totalRows,

  drillingRecordId: rec.id,   // ✅ Add drilling record ID here
})
 


        }
      })

      setRows(flattened)
    } catch (error) {
      console.error("Error fetching records:", error)
    } finally {
      setLoading(false)
    }
  }


  const downloadExcel = () => {
    const headers = [
      'Sr.No.',
      'Date',
      'Site',
      'Operator/Helper',
      'Machine Start',
      'Machine End',
      'Machine Hr',
      'Compressor rpm Start',
      'Compressor rpm End',
      'Compressor rpm Hr',
      'Work Type',
      'Point',
      'Rate',
      'Work Total',
      'Survey Type',
      'Survey Point',
      'Survey Rate',
      'Survey Total',
      'Grand Total',
    ]

    const data = rows.map(row => [
      row.srNo,
      new Date(row.date).toLocaleDateString(),
      row.site,
      row.operator,
      row.machineStart,
      row.machineEnd,
      row.machineHr,
       row.compressorStart,
      row.compressorEnd,
      row.compressorHr,
      row.workType,
      row.workPoint,
      row.workRate,
      row.workTotal,
      row.surveyType,
      row.surveyPoint,
      row.surveyRate,
      row.surveyTotal,
      row.rowTotal,
    ])

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'InfraDetails')

    const colWidths = headers.map((h, i) => ({
      wch: Math.max(h.length, ...data.map(r => (r[i] ? r[i].toString().length : 0))) + 2,
    }))
    worksheet['!cols'] = colWidths

    XLSX.writeFile(workbook, 'InfraDetails.xlsx')
  }

  // const downloadPDF = () => {
  //   const doc = new jsPDF()
  //   doc.text('Infra Details Report', 14, 10)

  //   const tableColumn = [
  //     'Sr.No.',
  //     'Date',
  //     'Site',
  //     'Operator',
  //     'Machine Start',
  //     'Machine End',
  //     'Machine Hr',
  //     'Compressor Start',
  //     'Compressor End',
  //     'Compressor Hr',
  //     'Work Type',
  //     'Point',
  //     'Rate',
  //     'Work Total',
  //     'Survey Type',
  //     'Survey Point',
  //     'Survey Rate',
  //     'Survey Total',
  //     'Grand Total',
  //   ]

  //   const tableRows = rows.map(row => [
  //     row.srNo,
  //     new Date(row.date).toLocaleDateString(),
  //     row.site,
  //     row.operator,
  //     row.machineStart,
  //     row.machineEnd,
  //     row.machineHr,
  //     row.compressorStart,
  //     row.compressorEnd,
  //     row.compressorHr,
  //     row.workType,
  //     row.workPoint,
  //     row.workRate,
  //     row.workTotal,
  //     row.surveyType,
  //     row.surveyPoint,
  //     row.surveyRate,
  //     row.surveyTotal,
  //     row.rowTotal,
  //   ])

  //   doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 })
  //   doc.save('InfraDetails.pdf')
  // }
const downloadPDF = () => {
  const doc = new jsPDF('l', 'mm', 'a4') // ✅ Landscape (horizontal)
  doc.setFontSize(8)

  doc.text('Infra Details Report', 14, 8)

  const tableColumn = [
    'Sr.No.',
    'Date',
    'Site',
    'Operator',
    'Machine Start',
    'Machine End',
    'Machine Hr',
    'Compressor Start',
    'Compressor End',
    'Compressor Hr',
    'Work Type',
    'Point',
    'Rate',
    'Work Total',
    'Survey Type',
    'Survey Point',
    'Survey Rate',
    'Survey Total',
    'Grand Total',
  ]

  const tableRows = rows.map(row => [
    row.srNo,
    new Date(row.date).toLocaleDateString(),
    row.site,
    row.operator,
    row.machineStart,
    row.machineEnd,
    row.machineHr,
    row.compressorStart,
    row.compressorEnd,
    row.compressorHr,
    row.workType,
    row.workPoint,
    row.workRate,
    row.workTotal,
    row.surveyType,
    row.surveyPoint,
    row.surveyRate,
    row.surveyTotal,
    row.rowTotal,
  ])

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 12,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2,     // ✅ only 2px padding on all sides
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 7,
    },
    tableWidth: 'auto',   // ✅ auto scale to fit page width
    pageBreak: 'auto',
  })

  doc.save('InfraDetails.pdf')
}



  useEffect(() => {
    fetchRecords()
  }, [])

  const totalRowValue = useMemo(() => {
    return rows.reduce((sum, row) => sum + (Number(row.rowTotal) || 0), 0)
  }, [rows])

  const handleFilter = () => {
    fetchRecords({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      project_name: projectName || undefined,
      max_point: maxPoint || undefined,
    })
  }

//  const handleDelete=async(id)=>{
//   const DeleteData = await deleteAPICall(`/api/drilling/${id}`);

//   if (DeleteData){
// showToast('')
//   }
//   else{

//   }
//  }
//  useEffect(() => {
//     handleDelete()
//   }, [])

 const [visible, setVisible] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // open modal with selected record id
  const openDeleteModal = (id) => {
    setSelectedId(id);
    setVisible(true);
  };

  // delete record
  const handleDelete = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await deleteAPICall(`/api/drilling/${selectedId}`);
      if (res) {
        showToast("success", "Entry deleted successfully!");
        fetchRecords?.(); // refresh list if needed
      } else {
        showToast("danger", "Failed to delete entry");
      }
    } catch (err) {
      console.error(err);
      showToast("danger", "Something went wrong while deleting.");
    } finally {
      setLoading(false);
      setVisible(false);
      setSelectedId(null);
    }
  };


  return (
    <div>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
            <div className="d-flex flex-wrap gap-2">
              <CButton color="success" className="me-2" onClick={downloadExcel}>
                Download Excel
              </CButton>
              <CButton color="danger" className="pe-3"onClick={downloadPDF}>
                Download PDF
              </CButton>
            </div>
            <h4 className="mb-0">Total Amount : {totalRowValue}</h4>
          </div>

          <CRow className="align-items-end d-flex flex-wrap gap-2" >
            <CCol md={3}>
              <CFormInput
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </CCol>
           <CCol md={3}>
  <CFormSelect
    label="Project Name"
    value={projectName}
    onChange={(e) => setProjectName(e.target.value)}
  >
    <option value="">-- Select Project --</option>
    {projects.map((proj) => (
      <option key={proj.id} value={proj.project_name}>
        {proj?.project_name}
      </option>
    ))}
  </CFormSelect>
</CCol>

            {/* <CCol md={2}>
              <CFormInput
                type="number"
                label="Max Point"
                value={maxPoint}
                onChange={(e) => setMaxPoint(e.target.value)}
                placeholder="Enter max point"
              />
            </CCol> */}
            <CCol md={3}>
              <CButton color="primary" onClick={handleFilter}>
                Apply
              </CButton>
              <CButton
                color="secondary"
                className="ms-2"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setProjectName('')
                  setMaxPoint('')
                  fetchRecords()
                }}
              >
                Reset
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
      </CCard>

      {rows.length > 0 && (
        <CCard className="mt-4">
          <CCardBody className="p-0">
            <div className="table-responsive">
              <CTable bordered hover>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell>Sr.No.</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Site</CTableHeaderCell>
                    <CTableHeaderCell>Oprator/Helper</CTableHeaderCell>
                    <CTableHeaderCell>Machine Start</CTableHeaderCell>
                    <CTableHeaderCell>Machine End</CTableHeaderCell>
                    <CTableHeaderCell>Machine Hr</CTableHeaderCell>

                    <CTableHeaderCell>Compressor rpm Start</CTableHeaderCell>
                    <CTableHeaderCell>Compressor rpm End</CTableHeaderCell>
                    <CTableHeaderCell>Compressor rpm Hr</CTableHeaderCell>

                    <CTableHeaderCell>Work Type</CTableHeaderCell>
                    <CTableHeaderCell>Point</CTableHeaderCell>
                    <CTableHeaderCell>Rate</CTableHeaderCell>
                    <CTableHeaderCell>Work Total</CTableHeaderCell>
                    <CTableHeaderCell>Survey Type</CTableHeaderCell>
                    <CTableHeaderCell>Survey Point</CTableHeaderCell>
                    <CTableHeaderCell>Survey Rate</CTableHeaderCell>
                    <CTableHeaderCell>Survey Total</CTableHeaderCell>
                    <CTableHeaderCell>Grand Total</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
               
         <CTableBody>
  {rows.map((row, rowIndex) => (
    <CTableRow key={rowIndex}>
      {row.isFirstRow && (
        <>
          <CTableDataCell rowSpan={row.rowSpan}>{row.srNo}</CTableDataCell>
          <CTableDataCell rowSpan={row.rowSpan}>
            {new Date(row.date).toLocaleDateString("en-GB")}
          </CTableDataCell>
          <CTableDataCell rowSpan={row.rowSpan}>{row.site}</CTableDataCell>
        </>
      )}

      <CTableDataCell>{row.operator}</CTableDataCell>
      <CTableDataCell>{row.machineStart}</CTableDataCell>
      <CTableDataCell>{row.machineEnd}</CTableDataCell>
      <CTableDataCell>{row.machineHr}</CTableDataCell>

      {/* ✅ Compressor only once per record */}
      {/* {row.isFirstRow && (
        <> */}
          <CTableDataCell >{row.compressorStart}</CTableDataCell>
          <CTableDataCell >{row.compressorEnd}</CTableDataCell>
          <CTableDataCell >{row.compressorHr}</CTableDataCell>
        {/* </>
      )} */}

      <CTableDataCell>{row.workType}</CTableDataCell>
      <CTableDataCell>{row.workPoint}</CTableDataCell>
      <CTableDataCell>{row.workRate}</CTableDataCell>
      <CTableDataCell className="fw-bold text-primary">{row.workTotal}</CTableDataCell>
      <CTableDataCell>{row.surveyType}</CTableDataCell>
      <CTableDataCell>{row.surveyPoint}</CTableDataCell>
      <CTableDataCell>{row.surveyRate}</CTableDataCell>
      <CTableDataCell className="fw-bold text-primary">{row.surveyTotal}</CTableDataCell>
      <CTableDataCell className="fw-bold text-success">{row.rowTotal}</CTableDataCell>

      {/* ✅ Edit button only once per drillingRecordId */}
      {row.isFirstRow && (
        <CTableDataCell rowSpan={row.rowSpan} className="text-center ">
           <div className="d-flex justify-content-center gap-2">
          <CButton
         
            color="primary"
            onClick={() =>
              navigate(`/updateDrillingForm/${row.drillingRecordId}`, {
                state: { drillingRecordId: row.drillingRecordId },
              })
            }
          >
            {/* Edit */}
            <CIcon icon={cilPencil} />
          </CButton>

            <CButton
        color="danger"
        onClick={() => openDeleteModal(row.drillingRecordId)}
      >
        {/* Delete    */}
          <CIcon icon={cilTrash} />
      </CButton>
     </div>

        </CTableDataCell>
      )}
    </CTableRow>
  ))}
</CTableBody>


              </CTable>
            </div>
          </CCardBody>
        </CCard>
      )}



 {/* Confirmation Modal */}
     <CModal visible={visible} onClose={() => setVisible(false)} backdrop="static">
        <CModalHeader onClose={() => setVisible(false)}>
          <CModalTitle>Delete drilling record?</CModalTitle>
        </CModalHeader>

        <CModalBody>
          Do you really want to{" "}
          <span className="text-danger fw-bold">Delete</span> this record?
        </CModalBody>

        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setVisible(false)}
            disabled={loading}
          >
            Close
          </CButton>
          <CButton
            color="danger"
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? "Deleting…" : "Yes"}
          </CButton>
        </CModalFooter>
      </CModal>


    </div>
  )
}

export default InfraDetailsShowTable

