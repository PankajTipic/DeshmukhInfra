import React, { useEffect, useState, useMemo } from 'react';
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
  CTableFoot,
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
  CNav,
  CNavItem,
  CNavLink,
  CBadge,
  CSpinner,
} from '@coreui/react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getAPICall, deleteAPICall } from '../../../util/api';
import { getUserType, getUserData } from '../../../util/session';
import { host } from '../../../util/constants';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilPlus, cilReload, cilCloudDownload, cilDescription } from '@coreui/icons';
import {
  downloadDrillingExcel,
  downloadDrillingPDF,
} from './worklogExportUtils';

const formatBreakDisplay = (val) => {
  if (!val || val === '—' || val === '00:00' || val === '00:00:00' || val === '0') return '';
  const str = String(val).trim();
  if (str === '00:30' || str === '00:30:00' || str === '30') return '30 min';
  if (str === '00:45' || str === '00:45:00' || str === '45') return '45 min';
  if (str === '01:00' || str === '01:00:00' || str === '60') return '1 hr';
  if (str === '00:15' || str === '00:15:00' || str === '15') return '15 min';
  if (str === '01:15' || str === '01:15:00' || str === '75') return '1h 15m';
  if (str === '01:30' || str === '01:30:00' || str === '90') return '1.5 hr';
  if (str === '02:00' || str === '02:00:00' || str === '120') return '2 hrs';
  if (str.includes(':')) {
    const [h, m] = str.split(':');
    const hh = parseInt(h, 10) || 0;
    const mm = parseInt(m, 10) || 0;
    if (hh > 0 && mm > 0) return `${hh}h ${mm}m`;
    if (hh > 0) return `${hh}h`;
    if (mm > 0) return `${mm} min`;
  }
  return str;
};

const SeparateWorkLogReport = () => {
  // Active Tab: 'drilling' | 'casting'
  const [activeTab, setActiveTab] = useState('drilling');

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectName, setProjectName] = useState('');
  const [workType, setWorkType] = useState('');
  const [surveyType, setSurveyType] = useState('');
  const [drillingType, setDrillingType] = useState('');
  const [castingTeamFilter, setCastingTeamFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown options
  const [projects, setProjects] = useState([]);
  const [workTypeOptions, setWorkTypeOptions] = useState([]);
  const [surveyTypeOptions, setSurveyTypeOptions] = useState([]);
  const [machineryMap, setMachineryMap] = useState({});

  // Data States
  const [rawRecords, setRawRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Delete modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Fetch Projects & Dropdown Options
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [projRes, wtRes, stRes, machRes] = await Promise.all([
          getAPICall('/api/myProjects'),
          getAPICall('/api/work-types'),
          getAPICall('/api/survey-types'),
          getAPICall('/api/machineries'),
        ]);
        setProjects(projRes || []);
        const wtList = (Array.isArray(wtRes) ? wtRes : (wtRes?.data || [])).map(item => item.name || item).filter(Boolean);
        const stList = (Array.isArray(stRes) ? stRes : (stRes?.data || [])).map(item => item.name || item).filter(Boolean);
        setWorkTypeOptions(Array.from(new Set(wtList)));
        setSurveyTypeOptions(Array.from(new Set(stList)));

        const mMap = {};
        const machList = machRes?.data || machRes || [];
        if (Array.isArray(machList)) {
          machList.forEach(m => {
            if (m && m.id) mMap[String(m.id)] = m.machine_name;
          });
        }
        setMachineryMap(mMap);
      } catch (err) {
        console.error('Error fetching dropdown options:', err);
      }
    };
    fetchDropdownData();
  }, []);

  // Fetch records whenever activeTab or primary filters change
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const userType = getUserType();
      let apiUrl = userType === 2 ? '/api/getDataByUserId' : '/api/drilling';

      const params = new URLSearchParams();
      params.append('tab_type', activeTab);

      if (startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      }
      if (projectName) params.append('project_name', projectName);
      if (workType) params.append('work_type', workType);
      if (surveyType && activeTab === 'drilling') params.append('survey_type', surveyType);

      const url = `${apiUrl}?${params.toString()}`;
      const response = await getAPICall(url);
      const data = response?.data || [];
      setRawRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching work log records:', err);
      showToast('danger', 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [activeTab]);

  const handleApplyFilter = () => {
    fetchRecords();
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setProjectName('');
    setWorkType('');
    setSurveyType('');
    setDrillingType('');
    setCastingTeamFilter('');
    setSearchQuery('');
    setTimeout(() => {
      fetchRecords();
    }, 50);
  };

  // Delete Record Handler
  const confirmDelete = (id) => {
    setSelectedRecordId(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedRecordId) return;
    setLoading(true);
    try {
      const res = await deleteAPICall(`/api/drilling/${selectedRecordId}`);
      if (res) {
        showToast('success', `${activeTab === 'drilling' ? 'Drilling' : 'Casting'} log deleted successfully!`);
        fetchRecords();
      } else {
        showToast('danger', 'Failed to delete record.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('danger', 'Something went wrong while deleting.');
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setSelectedRecordId(null);
    }
  };

  // Flattened Row Data per record with sub-rows
  const flattenedRows = useMemo(() => {
    const list = [];

    rawRecords.forEach((rec, recIdx) => {
      // Local filters
      if (drillingType && activeTab === 'drilling') {
        const hasMatchingDrillingType = (rec.work_point_detail || []).some(
          w => (w.drilling_type || '').toLowerCase() === drillingType.toLowerCase()
        );
        if (!hasMatchingDrillingType) return;
      }

      if (castingTeamFilter && activeTab === 'casting') {
        const team = (rec.casting_team_name || '').toLowerCase();
        if (!team.includes(castingTeamFilter.toLowerCase())) return;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const pName = (rec.project?.project_name || rec.site_name || '').toLowerCase();
        const opName = (rec.operator?.name || '').toLowerCase();
        const teamName = (rec.casting_team_name || '').toLowerCase();
        if (!pName.includes(q) && !opName.includes(q) && !teamName.includes(q)) return;
      }

      const workDetails = rec.work_point_detail || [];
      const surveyDetails = rec.survey_detail || [];
      const machineReadings = rec.machine_reading || rec.machineReading || [];
      const compressorRpms = rec.compressor_rpm || rec.compressorRpm || [];
      const rawMaterials = rec.uses_raw_material || [];

      // Fallback if readings array is empty but stored directly on rec
      const effectiveMachine = machineReadings.length > 0 ? machineReadings : (
        (rec.machine_start != null || rec.machine_end != null || rec.actual_machine_hr != null) ? [{
          machine_start: rec.machine_start,
          machine_end: rec.machine_end,
          actual_machine_hr: rec.actual_machine_hr,
          diesel_filled: rec.machine_diesel_filled,
          diesel_used: rec.machine_diesel_used,
          diesel_balance: rec.machine_diesel_balance,
          diesel_avg: rec.machine_diesel_avg,
        }] : []
      );

      const effectiveCompressor = compressorRpms.length > 0 ? compressorRpms : (
        (rec.comp_rpm_start != null || rec.comp_rpm_end != null || rec.com_actul_hr != null) ? [{
          comp_rpm_start: rec.comp_rpm_start,
          comp_rpm_end: rec.comp_rpm_end,
          com_actul_hr: rec.com_actul_hr,
          diesel_filled: rec.comp_diesel_filled,
          diesel_used: rec.comp_diesel_used,
          diesel_balance: rec.comp_diesel_balance,
          diesel_avg: rec.comp_diesel_avg,
        }] : []
      );

      const totalSubRows = Math.max(
        workDetails.length,
        surveyDetails.length,
        effectiveMachine.length,
        effectiveCompressor.length,
        rawMaterials.length,
        1
      );

      for (let i = 0; i < totalSubRows; i++) {
        const work = workDetails[i] || {};
        const survey = surveyDetails[i] || {};
        const machine = effectiveMachine[i] || {};
        const comp = effectiveCompressor[i] || {};
        const rawMat = rawMaterials[i] || {};

        list.push({
          drillingRecordId: rec.id,
          srNo: recIdx + 1,
          date: rec.date,
          site: rec.project?.project_name || rec.site_name || '—',
          supervisor: rec.supervisor || rec.project?.supervisor?.name || '—',
          startTime: rec.start_time || '—',
          endTime: rec.end_time || '—',
          breakTime: rec.break_time || '—',
          netHours: rec.net_hours != null ? rec.net_hours : '—',

          // Operator & Casting Info
          operator: rec.operator?.name || machine.operator?.name || '—',
          castingTeamName: rec.casting_team_name || '—',
          castingTeamNo: rec.casting_team_no || '—',
          helperName: rec.helper?.name || '—',

          // Machine Usage
          machineName: machine.machine?.machine_name || machine.machinery?.machine_name || machineryMap[String(machine.machine_id)] || machine.machine_name || '—',
          machineStart: machine.machine_start != null && machine.machine_start !== '' ? machine.machine_start : '—',
          machineEnd: machine.machine_end != null && machine.machine_end !== '' ? machine.machine_end : '—',
          machineHr: machine.actual_machine_hr != null && machine.actual_machine_hr !== '' ? machine.actual_machine_hr : '—',
          machineDieselFilled: machine.diesel_filled != null && machine.diesel_filled !== '' ? machine.diesel_filled : '—',
          machineDieselUsed: machine.diesel_used != null && machine.diesel_used !== '' ? machine.diesel_used : '—',
          machineDieselBalance: machine.diesel_balance != null && machine.diesel_balance !== '' ? machine.diesel_balance : '—',
          machineDieselAvg: machine.diesel_avg != null && machine.diesel_avg !== '' ? machine.diesel_avg : '—',

          // Compressor Usage (available for both Drilling & Casting)
          compMachineName: comp.machine?.machine_name || comp.machinery?.machine_name || machineryMap[String(comp.machine_id)] || comp.machine_name || '—',
          compStart: comp.comp_rpm_start != null && comp.comp_rpm_start !== '' ? comp.comp_rpm_start : '—',
          compEnd: comp.comp_rpm_end != null && comp.comp_rpm_end !== '' ? comp.comp_rpm_end : '—',
          compHr: comp.com_actul_hr != null && comp.com_actul_hr !== '' ? comp.com_actul_hr : '—',
          compDieselFilled: comp.diesel_filled != null && comp.diesel_filled !== '' ? comp.diesel_filled : '—',
          compDieselUsed: comp.diesel_used != null && comp.diesel_used !== '' ? comp.diesel_used : '—',
          compDieselBalance: comp.diesel_balance != null && comp.diesel_balance !== '' ? comp.diesel_balance : '—',
          compDieselAvg: comp.diesel_avg != null && comp.diesel_avg !== '' ? comp.diesel_avg : '—',

          // Work Details
          workType: work.work_type || '—',
          drillingType: work.drilling_type || '',
          workPoint: work.work_point != null ? work.work_point : '—',
          workRate: work.rate != null ? work.rate : '—',
          workTotal: parseFloat(work.total) || 0,
          workHrs: work.hrs != null ? work.hrs : '—',
          workDiesel: work.diesel != null ? work.diesel : '—',

          // Survey Details
          surveyType: survey.survey_type || '—',
          surveyPoint: survey.survey_point != null ? survey.survey_point : '—',
          surveyRate: survey.rate != null ? survey.rate : '—',
          surveyTotal: parseFloat(survey.total) || 0,
          surveyHrs: survey.hrs != null ? survey.hrs : '—',
          surveyDiesel: survey.diesel != null ? survey.diesel : '—',

          // Raw Material
          materialName: rawMat.material?.name || rawMat.material_name || '—',
          materialUsedQty: rawMat.used_qty != null ? `${rawMat.used_qty} ${rawMat.material?.unit || ''}` : '—',

          rowTotal: (parseFloat(work.total) || 0) + (parseFloat(survey.total) || 0),
          isFirstRow: i === 0,
          rowSpan: totalSubRows,
        });
      }
    });

    return list;
  }, [rawRecords, drillingType, castingTeamFilter, searchQuery, activeTab, machineryMap]);

  // Aggregate Totals
  const totals = useMemo(() => {
    let grandTotal = 0;
    let totalWorkPoints = 0;
    let totalMachineHours = 0;
    let totalDieselUsed = 0;
    let totalRawMaterialCount = 0;

    rawRecords.forEach(rec => {
      (rec.work_point_detail || []).forEach(w => {
        grandTotal += parseFloat(w.total) || 0;
        totalWorkPoints += parseFloat(w.work_point) || 0;
      });
      (rec.survey_detail || []).forEach(s => {
        grandTotal += parseFloat(s.total) || 0;
      });
      const machineReadings = rec.machine_reading || rec.machineReading || [];
      machineReadings.forEach(m => {
        totalMachineHours += parseFloat(m.actual_machine_hr) || 0;
        totalDieselUsed += parseFloat(m.diesel_used) || 0;
      });
      const compressorRpms = rec.compressor_rpm || rec.compressorRpm || [];
      compressorRpms.forEach(c => {
        totalMachineHours += parseFloat(c.com_actul_hr) || 0;
        totalDieselUsed += parseFloat(c.diesel_used) || 0;
      });
      totalRawMaterialCount += (rec.uses_raw_material || []).length;
    });

    return {
      recordCount: rawRecords.length,
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      totalWorkPoints: parseFloat(totalWorkPoints.toFixed(2)),
      totalMachineHours: parseFloat(totalMachineHours.toFixed(2)),
      totalDieselUsed: parseFloat(totalDieselUsed.toFixed(2)),
      totalRawMaterialCount,
    };
  }, [rawRecords]);

  // Table Column Totals for Excel & PDF
  const tableTotals = useMemo(() => {
    let grandTotal = 0;
    let workPoint = 0;
    let workRate = 0;
    let workTotal = 0;
    let workHrs = 0;
    let workDiesel = 0;
    let surveyPoint = 0;
    let surveyRate = 0;
    let surveyTotal = 0;
    let surveyHrs = 0;
    let surveyDiesel = 0;
    let machineDieselFilled = 0;
    let machineDieselUsed = 0;
    let compressorDieselFilled = 0;
    let compressorDieselUsed = 0;

    flattenedRows.forEach(r => {
      grandTotal += r.rowTotal || 0;
      workTotal += r.workTotal || 0;
      surveyTotal += r.surveyTotal || 0;
      workPoint += parseFloat(r.workPoint) || 0;
      surveyPoint += parseFloat(r.surveyPoint) || 0;
      workHrs += parseFloat(r.workHrs) || 0;
      surveyHrs += parseFloat(r.surveyHrs) || 0;
      workDiesel += parseFloat(r.workDiesel) || 0;
      surveyDiesel += parseFloat(r.surveyDiesel) || 0;
      machineDieselFilled += parseFloat(r.machineDieselFilled) || 0;
      machineDieselUsed += parseFloat(r.machineDieselUsed) || 0;
      compressorDieselFilled += parseFloat(r.compDieselFilled) || 0;
      compressorDieselUsed += parseFloat(r.compDieselUsed) || 0;
    });

    return {
      recordCount: rawRecords.length,
      grandTotal,
      workPoint,
      workRate,
      workTotal,
      workHrs,
      workDiesel,
      surveyPoint,
      surveyRate,
      surveyTotal,
      surveyHrs,
      surveyDiesel,
      machineDieselFilled,
      machineDieselUsed,
      compressorDieselFilled,
      compressorDieselUsed,
    };
  }, [flattenedRows, rawRecords]);

  // Download Excel
  const handleExportExcel = () => {
    const isDrill = activeTab === 'drilling';
    const dateStr = new Date().toISOString().split('T')[0];

    if (isDrill) {
      downloadDrillingExcel({
        rows: flattenedRows,
        tableTotals,
        startDate,
        endDate,
        projectName,
        workType,
        drillingType,
        fileName: `Drilling_WorkLog_Report_${dateStr}.xlsx`,
      });
    } else {
      downloadCastingExcel({
        rows: flattenedRows,
        tableTotals,
        startDate,
        endDate,
        projectName,
        workType,
        castingTeam: castingTeamFilter,
        fileName: `Casting_WorkLog_Report_${dateStr}.xlsx`,
      });
    }
  };

  // Download PDF
  const handleExportPDF = () => {
    const isDrill = activeTab === 'drilling';
    const dateStr = new Date().toISOString().split('T')[0];
    const user = getUserData();
    const companyInfo = user?.company_info || {};

    if (isDrill) {
      downloadDrillingPDF({
        rows: flattenedRows,
        tableTotals,
        startDate,
        endDate,
        projectName,
        workType,
        drillingType,
        companyInfo,
        host,
        fileName: `Drilling_WorkLog_Report_${dateStr}.pdf`,
      });
    } else {
      downloadCastingPDF({
        rows: flattenedRows,
        tableTotals,
        startDate,
        endDate,
        projectName,
        workType,
        castingTeam: castingTeamFilter,
        companyInfo,
        host,
        fileName: `Casting_WorkLog_Report_${dateStr}.pdf`,
      });
    }
  };

  const getDrillingBadgeColor = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'hard') return 'danger';
    if (t === 'medium') return 'warning';
    if (t === 'soft') return 'success';
    return 'secondary';
  };

  return (
    <div className="container-fluid px-0">
      {/* Top Banner / Navigation Bar */}
      <CCard className="mb-4 shadow-sm border-0">
        <CCardBody className="p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h3 className="fw-bold mb-1 text-primary d-flex align-items-center">
                <CIcon icon={cilDescription} className="me-2" />
                Separate Work Log Report
              </h3>
              <p className="text-muted mb-0 small">
                Dedicated independent reporting and analysis for <strong>Drilling</strong> operations and <strong>Casting</strong> concrete works.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <CButton
                color="primary"
                variant="outline"
                size="sm"
                onClick={() => navigate('/worklog')}
                className="d-flex align-items-center"
              >
                <CIcon icon={cilPlus} className="me-1" /> New Work Log
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                onClick={() => navigate('/infraDetailsShowTable')}
              >
                Combined Report View
              </CButton>
            </div>
          </div>
        </CCardBody>
      </CCard>

      {/* Primary Tab Switcher */}
      <CNav variant="pills" className="nav-pills-custom mb-3 p-1 bg-white rounded shadow-sm">
        <CNavItem className="flex-fill text-center">
          <CNavLink
            active={activeTab === 'drilling'}
            onClick={() => setActiveTab('drilling')}
            style={{ cursor: 'pointer', fontWeight: 700, padding: '10px 20px', borderRadius: '8px' }}
            className={`d-flex align-items-center justify-content-center gap-2 ${
              activeTab === 'drilling' ? 'bg-warning text-dark shadow-sm' : 'text-muted'
            }`}
          >
            <span>⛏️ 1. Drilling Report</span>
            <CBadge color={activeTab === 'drilling' ? 'dark' : 'warning'} shape="rounded-pill">
              {activeTab === 'drilling' ? totals.recordCount : ''}
            </CBadge>
          </CNavLink>
        </CNavItem>
        <CNavItem className="flex-fill text-center">
          <CNavLink
            active={activeTab === 'casting'}
            onClick={() => setActiveTab('casting')}
            style={{ cursor: 'pointer', fontWeight: 700, padding: '10px 20px', borderRadius: '8px' }}
            className={`d-flex align-items-center justify-content-center gap-2 ${
              activeTab === 'casting' ? 'bg-info text-white shadow-sm' : 'text-muted'
            }`}
          >
            <span>🏗️ 2. Casting Report</span>
            <CBadge color={activeTab === 'casting' ? 'light' : 'info'} textColor={activeTab === 'casting' ? 'dark' : 'light'} shape="rounded-pill">
              {activeTab === 'casting' ? totals.recordCount : ''}
            </CBadge>
          </CNavLink>
        </CNavItem>
      </CNav>

      {/* KPI Summary Cards for Active Tab */}
      <CRow className="g-3 mb-4">
        <CCol md={activeTab === 'drilling' ? 3 : 2}>
          <CCard className="border-0 shadow-sm text-center py-2 h-100" style={{ borderLeft: '4px solid #F59E0B' }}>
            <CCardBody className="p-2">
              <div className="text-muted small fw-semibold text-uppercase">Total Records</div>
              <div className="fs-4 fw-bold text-dark">{totals.recordCount}</div>
              <div className="text-secondary small">{activeTab === 'drilling' ? 'Drilling Logs' : 'Casting Logs'}</div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={activeTab === 'drilling' ? 2 : 2}>
          <CCard className="border-0 shadow-sm text-center py-2 h-100" style={{ borderLeft: '4px solid #10B981' }}>
            <CCardBody className="p-2">
              <div className="text-muted small fw-semibold text-uppercase">Total Points</div>
              <div className="fs-4 fw-bold text-success">{totals.totalWorkPoints}</div>
              <div className="text-secondary small">Work Done</div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={activeTab === 'drilling' ? 2 : 2}>
          <CCard className="border-0 shadow-sm text-center py-2 h-100" style={{ borderLeft: '4px solid #3B82F6' }}>
            <CCardBody className="p-2">
              <div className="text-muted small fw-semibold text-uppercase">Machine Hrs</div>
              <div className="fs-4 fw-bold text-primary">{totals.totalMachineHours}h</div>
              <div className="text-secondary small">Total Run Time</div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={activeTab === 'drilling' ? 2 : 2}>
          <CCard className="border-0 shadow-sm text-center py-2 h-100" style={{ borderLeft: '4px solid #EF4444' }}>
            <CCardBody className="p-2">
              <div className="text-muted small fw-semibold text-uppercase">Diesel Consumed</div>
              <div className="fs-4 fw-bold text-danger">{totals.totalDieselUsed} L</div>
              <div className="text-secondary small">Machines & Comp</div>
            </CCardBody>
          </CCard>
        </CCol>

        {activeTab === 'casting' && (
          <CCol md={2}>
            <CCard className="border-0 shadow-sm text-center py-2 h-100" style={{ borderLeft: '4px solid #8B5CF6' }}>
              <CCardBody className="p-2">
                <div className="text-muted small fw-semibold text-uppercase">Materials Used</div>
                <div className="fs-4 fw-bold text-purple">{totals.totalRawMaterialCount}</div>
                <div className="text-secondary small">Batches / Items</div>
              </CCardBody>
            </CCard>
          </CCol>
        )}

        <CCol md={3}>
          <CCard className="border-0 shadow-sm text-center py-2 h-100" style={{ borderLeft: '4px solid #059669' }}>
            <CCardBody className="p-2">
              <div className="text-muted small fw-semibold text-uppercase">Total Bill / Value</div>
              <div className="fs-4 fw-bold text-success">₹ {totals.grandTotal.toLocaleString()}</div>
              <div className="text-secondary small">Revenue Generated</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Filter Card */}
      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-light d-flex justify-content-between align-items-center py-2">
          <span className="fw-bold small text-uppercase text-secondary">
            Filter {activeTab === 'drilling' ? 'Drilling' : 'Casting'} Logs
          </span>
          <div className="d-flex gap-2">
            <CButton color="success" size="sm" onClick={handleExportExcel} className="d-flex align-items-center text-white">
              <CIcon icon={cilCloudDownload} className="me-1" /> Excel
            </CButton>
            <CButton color="danger" size="sm" onClick={handleExportPDF} className="d-flex align-items-center text-white">
              <CIcon icon={cilCloudDownload} className="me-1" /> PDF
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody className="p-3">
          <CRow className="g-2 align-items-end">
            <CCol md={2}>
              <CFormInput
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </CCol>
            <CCol md={2}>
              <CFormInput
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </CCol>
            <CCol md={2}>
              <CFormSelect
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              >
                <option value="">-- All Projects --</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.project_name}>
                    {proj.project_name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect
                label="Work Type"
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
              >
                <option value="">-- All Work Types --</option>
                {workTypeOptions.map((wt, idx) => (
                  <option key={idx} value={wt}>
                    {wt}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Drilling-specific filter: Drilling Type (Hard, Medium, Soft) */}
            {activeTab === 'drilling' && (
              <CCol md={2}>
                <CFormSelect
                  label="Drilling Type"
                  value={drillingType}
                  onChange={(e) => setDrillingType(e.target.value)}
                >
                  <option value="">-- All Drilling Types --</option>
                  <option value="Hard">Hard</option>
                  <option value="Medium">Medium</option>
                  <option value="Soft">Soft</option>
                </CFormSelect>
              </CCol>
            )}

            {/* Casting-specific filter: Team Name */}
            {activeTab === 'casting' && (
              <CCol md={2}>
                <CFormInput
                  type="text"
                  label="Casting Team"
                  placeholder="Filter by Team Name..."
                  value={castingTeamFilter}
                  onChange={(e) => setCastingTeamFilter(e.target.value)}
                />
              </CCol>
            )}

            <CCol md={2} className="d-flex gap-2">
              <CButton color="primary" onClick={handleApplyFilter} className="w-100">
                Filter
              </CButton>
              <CButton color="secondary" variant="outline" onClick={handleResetFilter} title="Reset">
                <CIcon icon={cilReload} />
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Main Table Card */}
      <CCard className="shadow-sm border-0 mb-4">
        <CCardHeader className={`${activeTab === 'drilling' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-info-subtle text-info-emphasis'} py-3 d-flex justify-content-between align-items-center`}>
          <div className="d-flex align-items-center gap-2">
            <span className="fs-5 fw-bold">
              {activeTab === 'drilling' ? '⛏️ Detailed Drilling Records' : '🏗️ Detailed Casting Records'}
            </span>
            <CBadge color={activeTab === 'drilling' ? 'warning' : 'info'}>
              {flattenedRows.length} sub-rows
            </CBadge>
          </div>
          <div className="fw-bold fs-5 text-dark">
            Total Amount: ₹ {totals.grandTotal.toLocaleString()}
          </div>
        </CCardHeader>

        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <div className="mt-2 text-muted">Loading {activeTab} report...</div>
            </div>
          ) : flattenedRows.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <h5>No {activeTab} logs found.</h5>
              <p className="small">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '70vh' }}>
              <CTable bordered hover small align="middle" className="mb-0 text-center text-nowrap">
                <CTableHead className="table-light sticky-top shadow-sm">
                  <CTableRow>
                    <CTableHeaderCell rowSpan={2} style={{ width: 40 }}>#</CTableHeaderCell>
                    <CTableHeaderCell rowSpan={2}>Date</CTableHeaderCell>
                    <CTableHeaderCell rowSpan={2}>Site / Project</CTableHeaderCell>
                    <CTableHeaderCell rowSpan={2}>Supervisor</CTableHeaderCell>
                    <CTableHeaderCell rowSpan={2}>Operator</CTableHeaderCell>

                    {/* Casting Team specific columns */}
                    {activeTab === 'casting' && (
                      <>
                        <CTableHeaderCell rowSpan={2} className="table-info">Casting Team</CTableHeaderCell>
                        <CTableHeaderCell rowSpan={2} className="table-info">Team No</CTableHeaderCell>
                        <CTableHeaderCell rowSpan={2} className="table-info">Helper</CTableHeaderCell>
                      </>
                    )}

                    <CTableHeaderCell rowSpan={2}>Timing (Net)</CTableHeaderCell>

                    {/* Machine & Compressor Readings */}
                    <CTableHeaderCell colSpan={8} className="table-warning">
                      Machine Usage
                    </CTableHeaderCell>

                    <CTableHeaderCell colSpan={8} className="table-primary">
                      Compressor Usage
                    </CTableHeaderCell>

                    {/* Work Details */}
                    <CTableHeaderCell colSpan={activeTab === 'drilling' ? 7 : 5} className="table-success">
                      {activeTab === 'drilling' ? 'Drilling Work Details' : 'Casting Work Details'}
                    </CTableHeaderCell>

                    {/* Raw Materials (for Casting) */}
                    {activeTab === 'casting' && (
                      <CTableHeaderCell colSpan={2} className="table-secondary">
                        Raw Materials Used
                      </CTableHeaderCell>
                    )}

                    {/* Survey Details (for Drilling) */}
                    {activeTab === 'drilling' && (
                      <CTableHeaderCell colSpan={5} className="table-info">
                        Survey Details
                      </CTableHeaderCell>
                    )}

                    <CTableHeaderCell rowSpan={2} className="table-dark text-white">Row Total</CTableHeaderCell>
                    <CTableHeaderCell rowSpan={2}>Actions</CTableHeaderCell>
                  </CTableRow>

                  <CTableRow>
                    {/* Machine columns */}
                    <CTableHeaderCell className="table-warning">Machine</CTableHeaderCell>
                    <CTableHeaderCell className="table-warning">Start</CTableHeaderCell>
                    <CTableHeaderCell className="table-warning">End</CTableHeaderCell>
                    <CTableHeaderCell className="table-warning">Hrs</CTableHeaderCell>
                    <CTableHeaderCell className="table-warning">Filled</CTableHeaderCell>
                    <CTableHeaderCell className="table-warning">Used</CTableHeaderCell>
                    <CTableHeaderCell className="table-warning">Bal</CTableHeaderCell>
                    <CTableHeaderCell className="table-warning">Avg</CTableHeaderCell>

                    {/* Compressor columns */}
                    <CTableHeaderCell className="table-primary">Compressor</CTableHeaderCell>
                    <CTableHeaderCell className="table-primary">Start</CTableHeaderCell>
                    <CTableHeaderCell className="table-primary">End</CTableHeaderCell>
                    <CTableHeaderCell className="table-primary">Hr</CTableHeaderCell>
                    <CTableHeaderCell className="table-primary">Filled</CTableHeaderCell>
                    <CTableHeaderCell className="table-primary">Used</CTableHeaderCell>
                    <CTableHeaderCell className="table-primary">Bal</CTableHeaderCell>
                    <CTableHeaderCell className="table-primary">Avg</CTableHeaderCell>

                    {/* Work Details columns */}
                    <CTableHeaderCell className="table-success">Work Type</CTableHeaderCell>
                    {activeTab === 'drilling' && (
                      <CTableHeaderCell className="table-success">Drilling Type</CTableHeaderCell>
                    )}
                    <CTableHeaderCell className="table-success">Points</CTableHeaderCell>
                    <CTableHeaderCell className="table-success">Rate</CTableHeaderCell>
                    <CTableHeaderCell className="table-success">Total</CTableHeaderCell>
                    <CTableHeaderCell className="table-success">Hrs</CTableHeaderCell>
                    {activeTab === 'drilling' && (
                      <CTableHeaderCell className="table-success">Diesel</CTableHeaderCell>
                    )}

                    {/* Raw Material Sub-columns */}
                    {activeTab === 'casting' && (
                      <>
                        <CTableHeaderCell className="table-secondary">Material</CTableHeaderCell>
                        <CTableHeaderCell className="table-secondary">Used Qty</CTableHeaderCell>
                      </>
                    )}

                    {/* Survey Details sub-columns */}
                    {activeTab === 'drilling' && (
                      <>
                        <CTableHeaderCell className="table-info">Survey Type</CTableHeaderCell>
                        <CTableHeaderCell className="table-info">Points</CTableHeaderCell>
                        <CTableHeaderCell className="table-info">Rate</CTableHeaderCell>
                        <CTableHeaderCell className="table-info">Total</CTableHeaderCell>
                        <CTableHeaderCell className="table-info">Hrs</CTableHeaderCell>
                      </>
                    )}
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {flattenedRows.map((row, idx) => (
                    <CTableRow key={idx}>
                      {row.isFirstRow && (
                        <>
                          <CTableDataCell rowSpan={row.rowSpan} className="fw-semibold bg-white">
                            {row.srNo}
                          </CTableDataCell>
                          <CTableDataCell rowSpan={row.rowSpan} className="bg-white">
                            {row.date ? new Date(row.date).toLocaleDateString('en-GB') : '—'}
                          </CTableDataCell>
                          <CTableDataCell rowSpan={row.rowSpan} className="fw-bold bg-white text-start">
                            {row.site}
                          </CTableDataCell>
                          <CTableDataCell rowSpan={row.rowSpan} className="bg-white">
                            {row.supervisor}
                          </CTableDataCell>
                          <CTableDataCell rowSpan={row.rowSpan} className="bg-white">
                            {row.operator}
                          </CTableDataCell>

                          {activeTab === 'casting' && (
                            <>
                              <CTableDataCell rowSpan={row.rowSpan} className="bg-info-subtle fw-semibold">
                                {row.castingTeamName}
                              </CTableDataCell>
                              <CTableDataCell rowSpan={row.rowSpan} className="bg-info-subtle small">
                                {row.castingTeamNo}
                              </CTableDataCell>
                              <CTableDataCell rowSpan={row.rowSpan} className="bg-info-subtle text-dark">
                                {row.helperName}
                              </CTableDataCell>
                            </>
                          )}

                          <CTableDataCell rowSpan={row.rowSpan} className="bg-white small">
                            {row.startTime} - {row.endTime}
                            {row.netHours !== '—' && (
                              <div className="fw-bold text-primary">{row.netHours} hrs</div>
                            )}
                            {formatBreakDisplay(row.breakTime) && (
                              <div className="text-secondary" style={{ fontSize: '11px' }}>
                                Break: {formatBreakDisplay(row.breakTime)}
                              </div>
                            )}
                          </CTableDataCell>
                        </>
                      )}

                      {/* Machine Usage */}
                      <CTableDataCell className="fw-semibold text-start">{row.machineName}</CTableDataCell>
                      <CTableDataCell>{row.machineStart}</CTableDataCell>
                      <CTableDataCell>{row.machineEnd}</CTableDataCell>
                      <CTableDataCell className="fw-semibold">{row.machineHr}</CTableDataCell>
                      <CTableDataCell className="text-muted">{row.machineDieselFilled}</CTableDataCell>
                      <CTableDataCell className="fw-bold text-danger">{row.machineDieselUsed}</CTableDataCell>
                      <CTableDataCell>{row.machineDieselBalance}</CTableDataCell>
                      <CTableDataCell>{row.machineDieselAvg}</CTableDataCell>

                      {/* Compressor Usage (Both Drilling and Casting) */}
                      <CTableDataCell className="fw-semibold text-start">{row.compMachineName}</CTableDataCell>
                      <CTableDataCell>{row.compStart}</CTableDataCell>
                      <CTableDataCell>{row.compEnd}</CTableDataCell>
                      <CTableDataCell className="fw-semibold">{row.compHr}</CTableDataCell>
                      <CTableDataCell className="text-muted">{row.compDieselFilled}</CTableDataCell>
                      <CTableDataCell className="fw-bold text-danger">{row.compDieselUsed}</CTableDataCell>
                      <CTableDataCell>{row.compDieselBalance}</CTableDataCell>
                      <CTableDataCell>{row.compDieselAvg}</CTableDataCell>

                      {/* Work Details */}
                      <CTableDataCell className="fw-semibold text-start">{row.workType}</CTableDataCell>
                      {activeTab === 'drilling' && (
                        <CTableDataCell>
                          {row.drillingType ? (
                            <CBadge color={getDrillingBadgeColor(row.drillingType)}>
                              {row.drillingType}
                            </CBadge>
                          ) : (
                            '—'
                          )}
                        </CTableDataCell>
                      )}
                      <CTableDataCell>{row.workPoint}</CTableDataCell>
                      <CTableDataCell>{row.workRate !== '—' ? `₹ ${row.workRate}` : '—'}</CTableDataCell>
                      <CTableDataCell className="fw-bold text-success">
                        {row.workTotal > 0 ? `₹ ${row.workTotal.toFixed(2)}` : '—'}
                      </CTableDataCell>
                      <CTableDataCell>{row.workHrs}</CTableDataCell>
                      {activeTab === 'drilling' && (
                        <CTableDataCell>{row.workDiesel}</CTableDataCell>
                      )}

                      {/* Raw Materials (Casting) */}
                      {activeTab === 'casting' && (
                        <>
                          <CTableDataCell className="fw-semibold text-start">
                            {row.materialName}
                          </CTableDataCell>
                          <CTableDataCell className="fw-bold text-primary">
                            {row.materialUsedQty}
                          </CTableDataCell>
                        </>
                      )}

                      {/* Survey Details (Drilling) */}
                      {activeTab === 'drilling' && (
                        <>
                          <CTableDataCell className="text-start">{row.surveyType}</CTableDataCell>
                          <CTableDataCell>{row.surveyPoint}</CTableDataCell>
                          <CTableDataCell>{row.surveyRate !== '—' ? `₹ ${row.surveyRate}` : '—'}</CTableDataCell>
                          <CTableDataCell className="fw-bold text-info">
                            {row.surveyTotal > 0 ? `₹ ${row.surveyTotal.toFixed(2)}` : '—'}
                          </CTableDataCell>
                          <CTableDataCell>{row.surveyHrs}</CTableDataCell>
                        </>
                      )}

                      {/* Row Total */}
                      <CTableDataCell className="fw-bold text-dark">
                        {row.rowTotal > 0 ? `₹ ${row.rowTotal.toFixed(2)}` : '—'}
                      </CTableDataCell>

                      {/* Action buttons (only rendered once per record) */}
                      {row.isFirstRow && (
                        <CTableDataCell rowSpan={row.rowSpan} className="bg-white">
                          <div className="d-flex justify-content-center gap-1">
                            <CButton
                              color="primary"
                              variant="ghost"
                              size="sm"
                              title="Edit Log"
                              onClick={() => navigate(`/updateDrillingForm/${row.drillingRecordId}`)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              variant="ghost"
                              size="sm"
                              title="Delete Log"
                              onClick={() => confirmDelete(row.drillingRecordId)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  ))}
                </CTableBody>

                <CTableFoot className="table-light fw-bold">
                  <CTableRow>
                    <CTableDataCell colSpan={5} className="text-end">
                      Grand Total:
                    </CTableDataCell>
                    <CTableDataCell colSpan={activeTab === 'drilling' ? 31 : 29} className="text-start fs-6 text-success">
                      ₹ {totals.grandTotal.toLocaleString()}
                    </CTableDataCell>
                  </CTableRow>
                </CTableFoot>
              </CTable>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to permanently delete this {activeTab === 'drilling' ? 'drilling' : 'casting'} work log record?
          This will also remove associated machine readings and point records.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default SeparateWorkLogReport;
