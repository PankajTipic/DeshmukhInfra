import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CCard, CCardBody, CCardHeader, CRow, CCol, CForm, CFormLabel, CFormInput,
  CFormSelect, CButton, CContainer, CAlert,
  CInputGroup, CInputGroupText, CBadge,
  CNav, CNavItem, CNavLink
} from '@coreui/react';
import { cilSettings, cilCalculator, cilLocationPin, cilX, cilFile, cilSearch, cilPeople, cilInfo } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { getAPICall, post, put } from '../../../util/api';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import Select from "react-select";
import { useToast } from '../../common/toast/ToastContext';
import ProjectSelectionModal from '../../common/ProjectSelectionModal';

const defaultMaterialOptions = [
  { value: '10 mm', label: '10 mm', current_stock: 500, unit: 'Ton' },
  { value: '20 mm', label: '20 mm', current_stock: 300, unit: 'Ton' },
  { value: 'Crush Sand', label: 'Crush Sand', current_stock: 400, unit: 'Ton' },
  { value: 'Cement', label: 'Cement', current_stock: 200, unit: 'Bag' },
];

const createInitialSectionState = () => ({
  start_time: '',
  end_time: '',
  break_time: '',
  net_hours: 0,
  casting_team_name: '',
  casting_team_no: '',
  helper_id: '',
  machineReading: [
    { oprator_id: '', machine_id: '', machine_start: '', machine_end: '', actual_machine_hr: 0, diesel_filled: '', diesel_used: '', diesel_balance: 0, diesel_avg: 0 }
  ],
  compressorReading: [
    { oprator_id: '', machine_id: '', comp_rpm_start: '', comp_rpm_end: '', com_actul_hr: 0, diesel_filled: '', diesel_used: '', diesel_balance: 0, diesel_avg: 0 }
  ],
  workDetails: [
    { operator_id: '', workType: '', drilling_type: '', uom: '', workPoints: '', rate: '', total: 0, diesel: '', hrs: '' }
  ],
  surveys: [
    { operator_id: '', survey_type: '', uom: '', survey_point: '', rate: '', total: 0, diesel: '', hrs: '' }
  ],
  rawMaterials: [
    { material_id: null, material_type: '', available_qty: 0, received_qty: '', qty_used: '', balance_qty: 0, unit: '' }
  ],
  totalBill: 0,
});

const createInitialRotaryRow = (defaultDate = '', defaultSupervisorId = '', defaultSupervisorName = '') => ({
  date: defaultDate,
  machine_id: '',
  machine_no: '',
  group_no: '',
  site_engineer_id: defaultSupervisorId,
  site_engineer: defaultSupervisorName,
  operator_id: '',
  operator_name: '',
  helper_id: '',
  helper_name: '',
  shift_time: 'Day',
  open_reading_hr: '',
  closing_reading_hr: '',
  total_hours: 0,
  dia: '',
  pile_no: '',
  soft_soil: '',
  hard_rock: '',
  today_miter: 0,
  total_miter: '',
  today_pile: 1,
  total_pile: '',
  diesel_lit: '',
  diesel_start_percent: '',
  diesel_closing_percent: '',
  diesel_use_percent: '',
  bullet_use: '',
  stock_bullet: '',
});

const MachineUsageForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { id: paramId } = useParams();

  const editId = paramId || location.state?.id || location.state?.editId || searchParams.get('id') || searchParams.get('editId');
  const targetTab = location.state?.tab || searchParams.get('tab');

  // Shared top-level project & date
  const [projectInfo, setProjectInfo] = useState({
    project_id: '',
    project_name: '',
    supervisor_id: '',
    date: '',
  });

  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
  const [supervisors, setSupervisors] = useState([]);

  // Tab State: 'drilling' | 'casting' | 'rotary'
  const [activeTab, setActiveTab] = useState(
    targetTab && ['drilling', 'casting', 'rotary'].includes(targetTab) ? targetTab : 'drilling'
  );

  // Independent form data per tab
  const [tabData, setTabData] = useState({
    drilling: createInitialSectionState(),
    casting: createInitialSectionState(),
    rotary: [createInitialRotaryRow()],
  });

  const { showToast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [operators, setOperators] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [machineries, setMachineries] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [materialTypes, setMaterialTypes] = useState(defaultMaterialOptions);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [surveyTypes, setSurveyTypes] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customBreak, setCustomBreak] = useState({ drilling: false, casting: false });

  // Fetch projects
  const fetchProjects = useCallback(async (query) => {
    try {
      const response = await getAPICall(`/api/projects?searchQuery=${query}`);
      setProjects(response || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  }, []);

  // Fetch operators, helpers and config data
  useEffect(() => {
    getAPICall("/api/operatorsByType?type=1")
      .then((response) => {
        const options = (response || []).map((op) => ({
          value: op.id,
          label: op.name
        }));
        setOperators(options);
      })
      .catch((error) => {
        console.error("Error fetching operators:", error);
      });

    // Fetch Helpers (type = 4 from operators table)
    getAPICall("/api/operatorsByType?type=4")
      .then((response) => {
        const options = (response || []).map((op) => ({
          value: op.id,
          label: op.name
        }));
        setHelpers(options);
      })
      .catch((error) => {
        console.error("Error fetching helpers:", error);
      });

    // Fetch Supervisors from usersData and operators
    const fetchSupervisors = async () => {
      try {
        const [usersRes, opsRes] = await Promise.allSettled([
          getAPICall("/api/usersData"),
          getAPICall("/api/operatorsByType?type=0")
        ]);

        const list = [];
        const seenIds = new Set();

        if (usersRes.status === 'fulfilled' && usersRes.value?.users) {
          usersRes.value.users.forEach((u) => {
            if (u && u.id && !seenIds.has(String(u.id))) {
              seenIds.add(String(u.id));
              list.push({ value: u.id, label: u.name });
            }
          });
        }

        if (opsRes.status === 'fulfilled' && Array.isArray(opsRes.value)) {
          opsRes.value.forEach((op) => {
            if (op && op.id && !seenIds.has(String(op.id))) {
              seenIds.add(String(op.id));
              list.push({ value: op.id, label: op.name });
            }
          });
        }

        setSupervisors(list);
      } catch (err) {
        console.error("Error fetching supervisors:", err);
      }
    };
    fetchSupervisors();

    const fetchConfigData = async () => {
      try {
        const [wt, st, um] = await Promise.all([
          getAPICall("/api/work-types"),
          getAPICall("/api/survey-types"),
          getAPICall("/api/uoms")
        ]);
        setWorkTypes(wt || []);
        setSurveyTypes(st || []);
        setUoms(um || []);
      } catch (err) {
        console.error("Error fetching config data:", err);
      }
    };
    fetchConfigData();
  }, []);

  // Fetch machineries and initialize balances
  useEffect(() => {
    const fetchMachineries = async () => {
      try {
        const res = await getAPICall("/api/machineries");
        if (res.data && Array.isArray(res.data)) {
          const list = res.data.map((m) => ({
            value: m.id,
            label: m.machine_name,
            diesel_balance: m.diesel_balance || 0,
          }));
          setMachineries(list);

          // Recalculate with fresh machinery balances
          setTabData(prev => recalculateAllReadings(prev, list));
        }
      } catch (err) {
        console.error("Error fetching machineries:", err);
      }
    };
    fetchMachineries();
  }, []);

  // Fetch materials based on project_id and sync existing rows with latest stock
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const url = projectInfo.project_id
          ? `/api/getMaterialByProject?project_id=${projectInfo.project_id}`
          : `/api/getMaterialByProject`;
        const res = await getAPICall(url);
        if (res && res.materials && Array.isArray(res.materials) && res.materials.length > 0) {
          setMaterials(res.materials);
          const types = res.materials.map(material => ({
            value: material.id,
            label: material.name,
            current_stock: material.current_stock,
            unit: material.unit,
          }));
          setMaterialTypes(types);

          // Synchronize ONLY existing rows with DB stocks (do not auto-select if empty)
          setTabData(prev => {
            const syncExistingRows = (currentRawMaterials) => {
              const currentList = currentRawMaterials && currentRawMaterials.length > 0
                ? currentRawMaterials
                : [{ material_id: null, material_type: '', available_qty: 0, received_qty: '', qty_used: '', balance_qty: 0, unit: '' }];

              return currentList.map(row => {
                if (!row.material_id && !row.material_type) return row;
                const matched = res.materials.find(
                  dbMat => dbMat.id === row.material_id || (row.material_type && dbMat.name?.toLowerCase() === row.material_type?.toLowerCase())
                );
                if (matched) {
                  const avail = matched.current_stock != null ? parseFloat(matched.current_stock) : row.available_qty;
                  const rec = parseFloat(row.received_qty) || 0;
                  const used = parseFloat(row.qty_used) || 0;
                  return {
                    ...row,
                    material_id: matched.id,
                    material_type: matched.name,
                    available_qty: avail,
                    unit: matched.unit || row.unit || '',
                    balance_qty: avail + rec - used,
                  };
                }
                return row;
              });
            };

            return {
              ...prev,
              drilling: {
                ...prev.drilling,
                rawMaterials: syncExistingRows(prev.drilling.rawMaterials)
              },
              casting: {
                ...prev.casting,
                rawMaterials: syncExistingRows(prev.casting.rawMaterials)
              }
            };
          });
        }
      } catch (err) {
        console.error("Error fetching materials:", err);
      }
    };
    fetchMaterials();
  }, [projectInfo.project_id]);

  // Fetch existing record data if editing
  useEffect(() => {
    if (!editId) return;

    const fetchEditRecord = async () => {
      try {
        const res = await getAPICall(`/api/drilling/${editId}`);
        const data = res?.data || res;
        if (!data) return;

        setProjectInfo({
          project_id: data.project_id || '',
          project_name: data.project?.project_name || data.site_name || '',
          supervisor_id: data.supervisor_id || data.project?.supervisor_id || '',
          date: data.date || '',
        });

        if (data.project) {
          setSelectedProjectDetails(data.project);
          setSearchQuery(data.project.project_name || '');
        }

        const rotDetails = data.rotary_details || data.rotaryDetails || [];
        const isRot = data.tab_type === 'rotary' || rotDetails.length > 0;
        const finalTab = isRot ? 'rotary' : (data.tab_type === 'casting' ? 'casting' : (targetTab || 'drilling'));
        setActiveTab(finalTab);

        if (isRot && rotDetails.length > 0) {
          const mappedRotary = rotDetails.map(r => ({
            id: r.id,
            date: r.date || data.date || '',
            machine_id: r.machine_id != null ? Number(r.machine_id) : '',
            machine_no: r.machine_no || r.machine?.machine_name || '',
            group_no: r.group_no || '',
            site_engineer_id: r.site_engineer_id != null ? Number(r.site_engineer_id) : (data.supervisor_id ? Number(data.supervisor_id) : ''),
            site_engineer: r.site_engineer || r.engineer?.name || '',
            operator_id: r.operator_id != null ? Number(r.operator_id) : '',
            operator_name: r.operator_name || r.operator?.name || '',
            helper_id: r.helper_id != null ? Number(r.helper_id) : '',
            helper_name: r.helper_name || r.helper?.name || '',
            shift_time: r.shift_time || 'Day',
            open_reading_hr: r.open_reading_hr != null ? r.open_reading_hr : '',
            closing_reading_hr: r.closing_reading_hr != null ? r.closing_reading_hr : '',
            total_hours: r.total_hours != null ? parseFloat(r.total_hours) : 0,
            dia: r.dia != null ? r.dia : '',
            pile_no: r.pile_no || '',
            soft_soil: r.soft_soil != null ? r.soft_soil : '',
            hard_rock: r.hard_rock != null ? r.hard_rock : '',
            today_miter: r.today_miter != null ? parseFloat(r.today_miter) : 0,
            total_miter: r.total_miter != null ? r.total_miter : '',
            today_pile: r.today_pile != null ? r.today_pile : 1,
            total_pile: r.total_pile != null ? r.total_pile : '',
            diesel_lit: r.diesel_lit != null ? r.diesel_lit : '',
            diesel_start_percent: r.diesel_start_percent != null ? r.diesel_start_percent : '',
            diesel_closing_percent: r.diesel_closing_percent != null ? r.diesel_closing_percent : '',
            diesel_use_percent: r.diesel_use_percent != null ? r.diesel_use_percent : '',
            bullet_use: r.bullet_use != null ? r.bullet_use : '',
            stock_bullet: r.stock_bullet != null ? r.stock_bullet : '',
          }));

          setTabData(prev => ({
            ...prev,
            rotary: mappedRotary,
          }));
        } else if (finalTab === 'rotary') {
          setTabData(prev => ({
            ...prev,
            rotary: [createInitialRotaryRow(data.date || '', data.supervisor_id || '', '')],
          }));
        }
      } catch (err) {
        console.error("Error fetching record for editing:", err);
      }
    };

    fetchEditRecord();
  }, [editId]);

  // Debounced project search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchProjects(searchQuery);
      } else {
        setProjects([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProjects]);

  // Calculate machine/rpm hours safely
  const calculateMachineHours = (start, end) => {
    if (start === '' || end === '' || start === null || end === null || start === undefined || end === undefined) return 0;
    const s = parseFloat(start);
    const e = parseFloat(end);
    if (isNaN(s) || isNaN(e)) return 0;
    const diff = e - s;
    return diff >= 0 ? parseFloat(diff.toFixed(2)) : 0;
  };

  // Convert "HH:mm" time string to total minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const parts = String(timeStr).split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  // Parse any break/lunch duration to minutes (e.g. "00:30", "00:45", "30", "45", "30 min", "1 hr", "01:00")
  const parseBreakTimeToMinutes = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const str = String(val).trim().toLowerCase();
    if (!str || str === '0' || str === '00:00' || str === '00:00:00') return 0;

    if (str.includes(':')) {
      const parts = str.split(':');
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      return h * 60 + m;
    }

    if (str.includes('min') || str.includes('m')) {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 0 : num;
    }

    if (str.includes('hr') || str.includes('h')) {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 0 : Math.round(num * 60);
    }

    const num = parseFloat(str);
    if (!isNaN(num)) {
      if (num < 5 && str.includes('.')) {
        return Math.round(num * 60);
      }
      return num;
    }
    return 0;
  };

  // Format net hours e.g. 8.5 -> "(8h 30m)"
  const formatNetHoursDuration = (netHours) => {
    if (!netHours || isNaN(netHours) || netHours <= 0) return '';
    const totalMinutes = Math.round(Number(netHours) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0 && m > 0) return `(${h}h ${m}m)`;
    if (h > 0) return `(${h}h)`;
    return `(${m}m)`;
  };

  // Normalize break_time to standard "HH:mm" if matching known presets, or return as-is
  const normalizeBreakValue = (val) => {
    if (!val || val === '0' || val === '00:00' || val === '00:00:00') return '00:00';
    const s = String(val).trim();
    if (s === '30' || s === '00:30' || s === '00:30:00') return '00:30';
    if (s === '45' || s === '00:45' || s === '00:45:00') return '00:45';
    if (s === '60' || s === '01:00' || s === '01:00:00') return '01:00';
    if (s === '15' || s === '00:15' || s === '00:15:00') return '00:15';
    if (s === '75' || s === '01:15' || s === '01:15:00') return '01:15';
    if (s === '90' || s === '01:30' || s === '01:30:00') return '01:30';
    if (s === '120' || s === '02:00' || s === '02:00:00') return '02:00';
    if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.substring(0, 5);
    return s;
  };

  // Calculate Net Working Hours: (End Time - Start Time) - (Break / Lunch)
  const calculateNetWorkingHours = (startTime, endTime, breakTime) => {
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    if (startMins === null || endMins === null) return 0;

    let totalMins = endMins - startMins;
    if (totalMins < 0) {
      totalMins += 24 * 60; // Overnight shift
    }

    const breakMins = parseBreakTimeToMinutes(breakTime);
    const netMins = Math.max(0, totalMins - breakMins);
    return parseFloat((netMins / 60).toFixed(2));
  };

  // Work Timing handler
  const handleWorkTimingChange = (field, value) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      const updatedTab = { ...currentTab, [field]: value };
      updatedTab.net_hours = calculateNetWorkingHours(
        updatedTab.start_time,
        updatedTab.end_time,
        updatedTab.break_time
      );
      return {
        ...prev,
        [activeTab]: updatedTab,
      };
    });
  };

  /**
   * CENTRAL RECALCULATION:
   * Cascades diesel filled, used, balance and avg sequentially across ALL readings
   * in both Machine Usage and Compressor Usage (and across tabs).
   * Solves the bug where using the same machine in machine and compressor shows duplicate un-deducted balance!
   */
  const recalculateAllReadings = (tabs, machineriesList) => {
    if (!tabs) return tabs;
    const machineBalances = {};
    (machineriesList || []).forEach(m => {
      machineBalances[String(m.value)] = parseFloat(m.diesel_balance) || 0;
    });

    const processRow = (row, hrField) => {
      const mId = row.machine_id ? String(row.machine_id) : '';
      const filled = parseFloat(row.diesel_filled) || 0;
      const used = parseFloat(row.diesel_used) || 0;
      const hrs = parseFloat(row[hrField]) || 0;

      // Formula: used disel / Machine HR
      const avg = (hrs > 0 && used > 0) ? parseFloat((used / hrs).toFixed(2)) : 0;

      let bal = 0;
      if (mId) {
        if (!(mId in machineBalances)) {
          const found = (machineriesList || []).find(m => String(m.value) === mId);
          machineBalances[mId] = found ? parseFloat(found.diesel_balance) || 0 : 0;
        }
        // Sequential cascading: running balance = previous balance + filled - used
        machineBalances[mId] = machineBalances[mId] + filled - used;
        bal = parseFloat(machineBalances[mId].toFixed(2));
      }

      return {
        ...row,
        diesel_balance: bal,
        diesel_avg: avg,
      };
    };

    // Sequential order: Drilling Machine Reading -> Drilling Compressor -> Casting Machine Reading -> Casting Compressor
    const newDrillingMR = (tabs.drilling?.machineReading || []).map(r => processRow(r, 'actual_machine_hr'));
    const newDrillingCR = (tabs.drilling?.compressorReading || []).map(r => processRow(r, 'com_actul_hr'));
    const newCastingMR = (tabs.casting?.machineReading || []).map(r => processRow(r, 'actual_machine_hr'));
    const newCastingCR = (tabs.casting?.compressorReading || []).map(r => processRow(r, 'com_actul_hr'));

    return {
      ...tabs,
      drilling: {
        ...tabs.drilling,
        machineReading: newDrillingMR,
        compressorReading: newDrillingCR,
      },
      casting: {
        ...tabs.casting,
        machineReading: newCastingMR,
        compressorReading: newCastingCR,
      }
    };
  };

  // Handle Machine Reading Changes
  const handleMachineReadingChange = (index, field, value) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      const updatedMR = currentTab.machineReading.map((r, i) => {
        if (i !== index) return r;
        const next = { ...r, [field]: value };
        if (field === 'machine_start' || field === 'machine_end') {
          next.actual_machine_hr = calculateMachineHours(next.machine_start, next.machine_end);
        }
        return next;
      });

      const nextTabData = {
        ...prev,
        [activeTab]: {
          ...currentTab,
          machineReading: updatedMR,
        }
      };

      return recalculateAllReadings(nextTabData, machineries);
    });
  };

  const addMachineReading = () => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      const nextTabData = {
        ...prev,
        [activeTab]: {
          ...currentTab,
          machineReading: [
            ...currentTab.machineReading,
            { oprator_id: '', machine_id: '', machine_start: '', machine_end: '', actual_machine_hr: 0, diesel_filled: '', diesel_used: '', diesel_balance: 0, diesel_avg: 0 }
          ]
        }
      };
      return recalculateAllReadings(nextTabData, machineries);
    });
  };

  const removeMachineReading = (index) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      if (currentTab.machineReading.length <= 1) return prev;
      const nextTabData = {
        ...prev,
        [activeTab]: {
          ...currentTab,
          machineReading: currentTab.machineReading.filter((_, i) => i !== index)
        }
      };
      return recalculateAllReadings(nextTabData, machineries);
    });
  };

  // Handle Compressor Reading Changes
  const handleCompressorChange = (index, field, value) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      const updatedCR = currentTab.compressorReading.map((r, i) => {
        if (i !== index) return r;
        const next = { ...r, [field]: value };
        if (field === 'comp_rpm_start' || field === 'comp_rpm_end') {
          next.com_actul_hr = calculateMachineHours(next.comp_rpm_start, next.comp_rpm_end);
        }
        return next;
      });

      const nextTabData = {
        ...prev,
        [activeTab]: {
          ...currentTab,
          compressorReading: updatedCR,
        }
      };

      return recalculateAllReadings(nextTabData, machineries);
    });
  };

  const addCompressorReading = () => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      const nextTabData = {
        ...prev,
        [activeTab]: {
          ...currentTab,
          compressorReading: [
            ...currentTab.compressorReading,
            { oprator_id: '', machine_id: '', comp_rpm_start: '', comp_rpm_end: '', com_actul_hr: 0, diesel_filled: '', diesel_used: '', diesel_balance: 0, diesel_avg: 0 }
          ]
        }
      };
      return recalculateAllReadings(nextTabData, machineries);
    });
  };

  const removeCompressorReading = (index) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      if (currentTab.compressorReading.length <= 1) return prev;
      const nextTabData = {
        ...prev,
        [activeTab]: {
          ...currentTab,
          compressorReading: currentTab.compressorReading.filter((_, i) => i !== index)
        }
      };
      return recalculateAllReadings(nextTabData, machineries);
    });
  };

  // Work details handlers
  const handleWorkDetailChange = (index, field, value) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      const updatedWD = currentTab.workDetails.map((w, i) => {
        if (i !== index) return w;
        const next = { ...w, [field]: value };
        const wp = parseFloat(next.workPoints) || 0;
        const r = parseFloat(next.rate) || 0;
        next.total = wp * r;
        return next;
      });
      const workTotal = updatedWD.reduce((sum, w) => sum + (parseFloat(w.total) || 0), 0);
      const surveyTotal = currentTab.surveys.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
      return {
        ...prev,
        [activeTab]: {
          ...currentTab,
          workDetails: updatedWD,
          totalBill: workTotal + surveyTotal
        }
      };
    });
  };

  const addWorkDetail = () => {
    setTabData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        workDetails: [
          ...prev[activeTab].workDetails,
          { operator_id: '', workType: '', drilling_type: '', uom: '', workPoints: '', rate: '', total: 0, diesel: '', hrs: '' }
        ]
      }
    }));
  };

  const removeWorkDetail = (index) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      if (currentTab.workDetails.length <= 1) return prev;
      const updatedWD = currentTab.workDetails.filter((_, i) => i !== index);
      const workTotal = updatedWD.reduce((sum, w) => sum + (parseFloat(w.total) || 0), 0);
      const surveyTotal = currentTab.surveys.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
      return {
        ...prev,
        [activeTab]: {
          ...currentTab,
          workDetails: updatedWD,
          totalBill: workTotal + surveyTotal
        }
      };
    });
  };

  // Survey handlers
  const handleSurveyChange = (index, field, value) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      const updatedS = currentTab.surveys.map((s, i) => {
        if (i !== index) return s;
        const next = { ...s, [field]: value };
        const sp = parseFloat(next.survey_point) || 0;
        const r = parseFloat(next.rate) || 0;
        next.total = sp * r;
        return next;
      });
      const workTotal = currentTab.workDetails.reduce((sum, w) => sum + (parseFloat(w.total) || 0), 0);
      const surveyTotal = updatedS.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
      return {
        ...prev,
        [activeTab]: {
          ...currentTab,
          surveys: updatedS,
          totalBill: workTotal + surveyTotal
        }
      };
    });
  };

  const addSurvey = () => {
    setTabData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        surveys: [
          ...prev[activeTab].surveys,
          { operator_id: '', survey_type: '', uom: '', survey_point: '', rate: '', total: 0, diesel: '', hrs: '' }
        ]
      }
    }));
  };

  const removeSurvey = (index) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      if (currentTab.surveys.length <= 1) return prev;
      const updatedS = currentTab.surveys.filter((_, i) => i !== index);
      const workTotal = currentTab.workDetails.reduce((sum, w) => sum + (parseFloat(w.total) || 0), 0);
      const surveyTotal = updatedS.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
      return {
        ...prev,
        [activeTab]: {
          ...currentTab,
          surveys: updatedS,
          totalBill: workTotal + surveyTotal
        }
      };
    });
  };

  // Casting team handler (for Casting tab)
  const handleCastingTeamChange = (field, value) => {
    setTabData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value
      }
    }));
  };

  // Raw material handlers
  const handleMaterialSelect = (index, selectedValue) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      const updatedRM = currentTab.rawMaterials.map((r, i) => {
        if (i !== index) return r;
        if (!selectedValue) {
          return {
            ...r,
            material_id: null,
            material_type: '',
            available_qty: 0,
            unit: '',
            balance_qty: 0,
          };
        }
        // Match either by id or by name/value
        const found = (materials || []).find(m => String(m.id) === String(selectedValue) || m.name?.toLowerCase() === String(selectedValue).toLowerCase()) ||
                      (materialTypes || []).find(m => String(m.value) === String(selectedValue) || m.label?.toLowerCase() === String(selectedValue).toLowerCase());
        const avail = found ? (parseFloat(found.current_stock ?? found.stock) || 0) : (parseFloat(r.available_qty) || 0);
        const u = found ? (found.unit || 'Ton') : (r.unit || 'Ton');
        const name = found ? (found.name || found.label) : selectedValue;
        const rec = parseFloat(r.received_qty) || 0;
        const used = parseFloat(r.qty_used) || 0;
        return {
          ...r,
          material_id: found && found.id ? found.id : (found && typeof found.value === 'number' ? found.value : null),
          material_type: name,
          available_qty: avail,
          unit: u,
          balance_qty: avail + rec - used,
        };
      });
      return {
        ...prev,
        [activeTab]: {
          ...currentTab,
          rawMaterials: updatedRM
        }
      };
    });
  };

  const handleRawMaterialChange = (index, field, value) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      const updatedRM = currentTab.rawMaterials.map((r, i) => {
        if (i !== index) return r;
        const next = { ...r, [field]: value };
        const avail = parseFloat(next.available_qty) || 0;
        const rec = parseFloat(next.received_qty) || 0;
        const used = parseFloat(next.qty_used) || 0;
        next.balance_qty = avail + rec - used;
        return next;
      });
      return {
        ...prev,
        [activeTab]: {
          ...currentTab,
          rawMaterials: updatedRM
        }
      };
    });
  };

  const addRawMaterial = () => {
    setTabData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        rawMaterials: [
          ...prev[activeTab].rawMaterials,
          { material_id: null, material_type: '', available_qty: 0, received_qty: '', qty_used: '', balance_qty: 0, unit: '' }
        ]
      }
    }));
  };

  const removeRawMaterial = (index) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      if (currentTab.rawMaterials.length <= 1) return prev;
      return {
        ...prev,
        [activeTab]: {
          ...currentTab,
          rawMaterials: currentTab.rawMaterials.filter((_, i) => i !== index)
        }
      };
    });
  };

  // Top Section: Project selection
  const handleProjectChange = (project) => {
    const supId = project.supervisor_id || (project.supervisor?.id) || '';
    setProjectInfo(prev => ({
      ...prev,
      project_id: project.id,
      project_name: project.project_name,
      supervisor_id: supId ? String(supId) : prev.supervisor_id,
    }));
    setSelectedProjectDetails(project);
    setSearchQuery(project.project_name);
    setProjects([]);
    setShowDropdown(false);
  };

  // Block negative symbol and scientific 'e' from numeric inputs
  const blockNegativeKey = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  // Rotary Row Handlers - strictly positive values only
  const handleRotaryChange = (index, field, value) => {
    const positiveOnlyFields = [
      'dia', 'total_miter', 'today_pile', 'total_pile',
      'diesel_lit', 'diesel_use_percent', 'bullet_use', 'stock_bullet'
    ];
    if (positiveOnlyFields.includes(field)) {
      if (value !== '' && value != null) {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          value = Math.max(0, num);
        }
      }
    }
    setTabData(prev => {
      const rows = [...(prev.rotary || [createInitialRotaryRow()])];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, rotary: rows };
    });
  };

  const handleRotaryNumberChange = (index, field, value) => {
    if (value !== '' && value != null) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        value = Math.max(0, num);
      }
    }
    setTabData(prev => {
      const rows = [...(prev.rotary || [createInitialRotaryRow()])];
      const updated = { ...rows[index], [field]: value };

      if (field === 'open_reading_hr' || field === 'closing_reading_hr') {
        const open = Math.max(0, parseFloat(field === 'open_reading_hr' ? value : updated.open_reading_hr) || 0);
        const close = Math.max(0, parseFloat(field === 'closing_reading_hr' ? value : updated.closing_reading_hr) || 0);
        if (close >= open) {
          updated.total_hours = parseFloat((close - open).toFixed(2));
        } else {
          updated.total_hours = 0;
        }
      }

      if (field === 'soft_soil' || field === 'hard_rock') {
        const soil = Math.max(0, parseFloat(field === 'soft_soil' ? value : updated.soft_soil) || 0);
        const rock = Math.max(0, parseFloat(field === 'hard_rock' ? value : updated.hard_rock) || 0);
        updated.today_miter = parseFloat((soil + rock).toFixed(2));
      }

      rows[index] = updated;
      return { ...prev, rotary: rows };
    });
  };

  const handleRotaryPercentChange = (index, field, value) => {
    if (value !== '' && value != null) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        value = Math.max(0, Math.min(100, num));
      }
    }
    setTabData(prev => {
      const rows = [...(prev.rotary || [createInitialRotaryRow()])];
      const updated = { ...rows[index], [field]: value };

      const start = parseFloat(field === 'diesel_start_percent' ? value : updated.diesel_start_percent);
      const close = parseFloat(field === 'diesel_closing_percent' ? value : updated.diesel_closing_percent);
      if (!isNaN(start) && !isNaN(close) && start >= close) {
        updated.diesel_use_percent = parseFloat(Math.max(0, start - close).toFixed(2));
      } else {
        updated.diesel_use_percent = 0;
      }

      rows[index] = updated;
      return { ...prev, rotary: rows };
    });
  };

  const addRotaryRow = () => {
    setTabData(prev => ({
      ...prev,
      rotary: [
        ...(prev.rotary || []),
        createInitialRotaryRow(
          projectInfo.date || '',
          projectInfo.supervisor_id || '',
          supervisors.find(s => String(s.value) === String(projectInfo.supervisor_id))?.label || ''
        )
      ]
    }));
  };

  const removeRotaryRow = (index) => {
    setTabData(prev => {
      const rows = [...(prev.rotary || [])];
      if (rows.length > 1) {
        rows.splice(index, 1);
        return { ...prev, rotary: rows };
      }
      return prev;
    });
  };

  const rotaryTotals = useMemo(() => {
    const rows = tabData.rotary || [];
    let totalHours = 0;
    let totalMiter = 0;
    let totalPiles = 0;
    let totalDiesel = 0;
    let totalBullet = 0;
    rows.forEach(r => {
      totalHours += parseFloat(r.total_hours) || 0;
      totalMiter += parseFloat(r.today_miter) || 0;
      totalPiles += parseFloat(r.today_pile) || 0;
      totalDiesel += parseFloat(r.diesel_lit) || 0;
      totalBullet += parseFloat(r.bullet_use) || 0;
    });
    return {
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalMiter: parseFloat(totalMiter.toFixed(2)),
      totalPiles,
      totalDiesel: parseFloat(totalDiesel.toFixed(2)),
      totalBullet: parseFloat(totalBullet.toFixed(2)),
    };
  }, [tabData.rotary]);

  // Helper to validate & submit a single tab
  const validateAndSubmitTab = async (tabKey) => {
    // Section 1 Validation
    if (!projectInfo.project_id) {
      showToast("danger", "Please select a Project.");
      return false;
    }
    if (!projectInfo.date) {
      showToast("danger", "Please select a Date.");
      return false;
    }

    if (tabKey === 'rotary') {
      const rows = tabData.rotary || [];
      if (rows.length === 0) {
        showToast("danger", "Please add at least one Rotary row.");
        return false;
      }

      const validRows = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const hasSome = r.machine_id || r.operator_id || r.group_no || r.pile_no || r.open_reading_hr || r.closing_reading_hr || r.soft_soil || r.hard_rock || r.diesel_lit || r.site_engineer_id || r.dia;
        if (!hasSome && rows.length > 1) {
          continue;
        }
        if (!r.operator_id && !r.operator_name) {
          showToast("danger", `Rotary Row ${i + 1}: Please select an Operator.`);
          return false;
        }

        // Validate strictly positive values only
        const checkFields = [
          { key: 'open_reading_hr', label: 'Open Reading Hr' },
          { key: 'closing_reading_hr', label: 'Closing Reading Hr' },
          { key: 'dia', label: 'Dia' },
          { key: 'soft_soil', label: 'Soft Soil' },
          { key: 'hard_rock', label: 'Hard Rock' },
          { key: 'total_miter', label: 'Total Miter' },
          { key: 'today_pile', label: 'Today Pile' },
          { key: 'total_pile', label: 'Total Pile' },
          { key: 'diesel_lit', label: 'Diesel Lit' },
          { key: 'diesel_start_percent', label: 'Diesel Start %' },
          { key: 'diesel_closing_percent', label: 'Diesel Closing %' },
          { key: 'diesel_use_percent', label: 'Diesel Use %' },
          { key: 'bullet_use', label: 'Bullet Use' },
          { key: 'stock_bullet', label: 'Stock Bullet' },
        ];

        for (const cf of checkFields) {
          const val = r[cf.key];
          if (val !== '' && val != null && parseFloat(val) < 0) {
            showToast("danger", `Rotary Row ${i + 1}: ${cf.label} cannot be negative. Only positive values are allowed.`);
            return false;
          }
        }

        const openHr = r.open_reading_hr !== '' && r.open_reading_hr != null ? Math.max(0, parseFloat(r.open_reading_hr)) : null;
        const closeHr = r.closing_reading_hr !== '' && r.closing_reading_hr != null ? Math.max(0, parseFloat(r.closing_reading_hr)) : null;
        const totHr = (openHr != null && closeHr != null && closeHr >= openHr)
          ? parseFloat((closeHr - openHr).toFixed(2))
          : (r.total_hours !== '' && r.total_hours != null ? Math.max(0, parseFloat(r.total_hours)) : null);

        const softSoil = r.soft_soil !== '' && r.soft_soil != null ? Math.max(0, parseFloat(r.soft_soil)) : null;
        const hardRock = r.hard_rock !== '' && r.hard_rock != null ? Math.max(0, parseFloat(r.hard_rock)) : null;
        const todayMit = (softSoil != null || hardRock != null)
          ? parseFloat(((softSoil || 0) + (hardRock || 0)).toFixed(2))
          : (r.today_miter !== '' && r.today_miter != null ? Math.max(0, parseFloat(r.today_miter)) : null);

        validRows.push({
          date: r.date || projectInfo.date,
          machine_id: r.machine_id || null,
          machine_no: r.machine_no || (machineries.find(m => String(m.value) === String(r.machine_id))?.label || ''),
          group_no: r.group_no || null,
          site_engineer_id: r.site_engineer_id || projectInfo.supervisor_id || null,
          site_engineer: r.site_engineer || (supervisors.find(s => String(s.value) === String(r.site_engineer_id || projectInfo.supervisor_id))?.label || ''),
          operator_id: r.operator_id || null,
          operator_name: r.operator_name || (operators.find(o => String(o.value) === String(r.operator_id))?.label || ''),
          helper_id: r.helper_id || null,
          helper_name: r.helper_name || (helpers.find(h => String(h.value) === String(r.helper_id))?.label || ''),
          shift_time: r.shift_time || 'Day',
          open_reading_hr: openHr,
          closing_reading_hr: closeHr,
          total_hours: totHr,
          dia: r.dia !== '' && r.dia != null ? Math.max(0, parseFloat(r.dia)) : null,
          pile_no: r.pile_no || null,
          soft_soil: softSoil,
          hard_rock: hardRock,
          today_miter: todayMit,
          total_miter: r.total_miter !== '' && r.total_miter != null ? Math.max(0, parseFloat(r.total_miter)) : null,
          today_pile: r.today_pile !== '' && r.today_pile != null ? Math.max(0, parseFloat(r.today_pile)) : 1,
          total_pile: r.total_pile !== '' && r.total_pile != null ? Math.max(0, parseFloat(r.total_pile)) : null,
          diesel_lit: r.diesel_lit !== '' && r.diesel_lit != null ? Math.max(0, parseFloat(r.diesel_lit)) : null,
          diesel_start_percent: r.diesel_start_percent !== '' && r.diesel_start_percent != null ? Math.max(0, parseFloat(r.diesel_start_percent)) : null,
          diesel_closing_percent: r.diesel_closing_percent !== '' && r.diesel_closing_percent != null ? Math.max(0, parseFloat(r.diesel_closing_percent)) : null,
          diesel_use_percent: r.diesel_use_percent !== '' && r.diesel_use_percent != null ? Math.max(0, parseFloat(r.diesel_use_percent)) : null,
          bullet_use: r.bullet_use !== '' && r.bullet_use != null ? Math.max(0, parseFloat(r.bullet_use)) : null,
          stock_bullet: r.stock_bullet !== '' && r.stock_bullet != null ? Math.max(0, parseFloat(r.stock_bullet)) : null,
        });
      }

      if (validRows.length === 0) {
        showToast("danger", "Please fill in Rotary details.");
        return false;
      }

      const payload = {
        project_id: projectInfo.project_id,
        supervisor_id: projectInfo.supervisor_id || null,
        date: projectInfo.date,
        tab_type: 'rotary',
        rotary_details: validRows,
      };

      if (editId) {
        await put(`/api/drilling/${editId}`, payload);
      } else {
        await post("/api/drilling", payload);
      }
      return true;
    }

    const currentTab = tabData[tabKey];
    const tabTitle = tabKey === 'drilling' ? 'Drilling' : 'Casting';

    // Machine Reading Validation
    for (let i = 0; i < currentTab.machineReading.length; i++) {
      const reading = currentTab.machineReading[i];
      if (reading.machine_start || reading.machine_end || reading.diesel_used || reading.diesel_filled) {
        if (!reading.oprator_id) {
          showToast("danger", `${tabTitle} Row ${i + 1} (Machine Usage): Please select an Operator.`);
          return false;
        }
        if (!reading.machine_id) {
          showToast("danger", `${tabTitle} Row ${i + 1} (Machine Usage): Please select a Machinery.`);
          return false;
        }
      }
    }

    // Compressor Reading Validation
    for (let i = 0; i < currentTab.compressorReading.length; i++) {
      const reading = currentTab.compressorReading[i];
      if (reading.comp_rpm_start || reading.comp_rpm_end || reading.diesel_used || reading.diesel_filled) {
        if (!reading.oprator_id) {
          showToast("danger", `${tabTitle} Row ${i + 1} (Compressor Usage): Please select an Operator.`);
          return false;
        }
        if (!reading.machine_id) {
          showToast("danger", `${tabTitle} Row ${i + 1} (Compressor Usage): Please select a Machinery.`);
          return false;
        }
      }
    }

    // Work Details Validation
    for (let i = 0; i < currentTab.workDetails.length; i++) {
      const work = currentTab.workDetails[i];
      if (work.workPoints && work.rate) {
        if (!work.operator_id) {
          showToast("danger", `${tabTitle} Row ${i + 1} (Work Details): Please select an Operator.`);
          return false;
        }
        if (!work.workType) {
          showToast("danger", `${tabTitle} Row ${i + 1} (Work Details): Please select a Work Type.`);
          return false;
        }
      }
    }

    // Survey Details Validation
    for (let i = 0; i < currentTab.surveys.length; i++) {
      const survey = currentTab.surveys[i];
      if (survey.survey_point && survey.rate) {
        if (!survey.operator_id) {
          showToast("danger", `${tabTitle} Row ${i + 1} (Survey Details): Please select an Operator.`);
          return false;
        }
        if (!survey.survey_type) {
          showToast("danger", `${tabTitle} Row ${i + 1} (Survey Details): Please select a Survey Type.`);
          return false;
        }
      }
    }

    // Raw Materials Validation
    for (let i = 0; i < currentTab.rawMaterials.length; i++) {
      const material = currentTab.rawMaterials[i];
      if (material.qty_used) {
        if (!material.material_type) {
          showToast("danger", `${tabTitle} Row ${i + 1} (Raw Materials): Please select a Material Type.`);
          return false;
        }
      }
    }

    // Negative Balance Check
    for (let i = 0; i < currentTab.machineReading.length; i++) {
      const r = currentTab.machineReading[i];
      if (r.machine_id && r.diesel_balance < 0) {
        const m = machineries.find(item => String(item.value) === String(r.machine_id));
        showToast("danger", `Diesel balance cannot be negative for machine "${m?.label || 'Machine'}" in ${tabTitle} Machine Usage.`);
        return false;
      }
    }
    for (let i = 0; i < currentTab.compressorReading.length; i++) {
      const r = currentTab.compressorReading[i];
      if (r.machine_id && r.diesel_balance < 0) {
        const m = machineries.find(item => String(item.value) === String(r.machine_id));
        showToast("danger", `Diesel balance cannot be negative for machine "${m?.label || 'Machine'}" in ${tabTitle} Compressor Usage.`);
        return false;
      }
    }

    // Filter valid rows to submit
    const validMachineReadings = currentTab.machineReading
      .filter(m => m.machine_id || m.machine_start || m.machine_end || m.diesel_used || m.diesel_filled)
      .map(m => ({
        oprator_id: m.oprator_id,
        machine_id: m.machine_id,
        machine_start: m.machine_start,
        machine_end: m.machine_end,
        actual_machine_hr: m.actual_machine_hr,
        diesel_filled: m.diesel_filled || 0,
        diesel_used: m.diesel_used || 0,
        diesel_balance: m.diesel_balance,
        diesel_avg: m.diesel_avg || 0,
      }));

    const validCompressorReadings = currentTab.compressorReading
      .filter(c => c.machine_id || c.comp_rpm_start || c.comp_rpm_end || c.diesel_used || c.diesel_filled)
      .map(c => ({
        oprator_id: c.oprator_id,
        machine_id: c.machine_id,
        comp_rpm_start: c.comp_rpm_start,
        comp_rpm_end: c.comp_rpm_end,
        com_actul_hr: c.com_actul_hr,
        diesel_filled: c.diesel_filled || 0,
        diesel_used: c.diesel_used || 0,
        diesel_balance: c.diesel_balance,
        diesel_avg: c.diesel_avg || 0,
      }));

    const validWorkPoints = currentTab.workDetails
      .filter(w => w.workType || w.workPoints || w.rate || w.diesel || w.hrs || w.drilling_type)
      .map(w => ({
        operator_id: w.operator_id,
        work_type: w.workType,
        drilling_type: w.drilling_type || null,
        work_point: w.workPoints,
        uom: w.uom,
        rate: w.rate,
        total: w.total,
        diesel: w.diesel,
        hrs: w.hrs
      }));

    const validSurveys = currentTab.surveys
      .filter(s => s.survey_type || s.survey_point || s.rate || s.diesel || s.hrs)
      .map(s => ({
        operator_id: s.operator_id,
        survey_type: s.survey_type,
        survey_point: s.survey_point,
        uom: s.uom,
        rate: s.rate,
        total: s.total,
        diesel: s.diesel,
        hrs: s.hrs
      }));

    const validRawMaterials = currentTab.rawMaterials
      .filter(r => r.material_type && (parseFloat(r.qty_used) > 0 || parseFloat(r.received_qty) > 0 || r.material_id))
      .map(r => ({
        material_id: r.material_id || null,
        material_type: r.material_type,
        material_name: r.material_type,
        available_qty: parseFloat(r.available_qty) || 0,
        received_qty: parseFloat(r.received_qty) || 0,
        qty_used: parseFloat(r.qty_used) || 0,
        balance_qty: parseFloat(r.balance_qty) || 0,
        unit: r.unit || 'Ton'
      }));

    const payload = {
      project_id: projectInfo.project_id,
      supervisor_id: projectInfo.supervisor_id || null,
      date: projectInfo.date,
      tab_type: tabKey,
      start_time: currentTab.start_time || null,
      end_time: currentTab.end_time || null,
      break_time: currentTab.break_time || null,
      net_hours: currentTab.net_hours != null ? currentTab.net_hours : null,
      helper_id: tabKey === 'casting' ? (currentTab.helper_id || null) : null,
      casting_team_name: tabKey === 'casting' ? (currentTab.casting_team_name || null) : null,
      casting_team_no: tabKey === 'casting' ? (currentTab.casting_team_no || null) : null,
      work_points: validWorkPoints,
      surveys: validSurveys,
      machineReading: validMachineReadings,
      compressor_rpm: validCompressorReadings,
      raw_material_usage: validRawMaterials,
    };

    if (editId) {
      await put(`/api/drilling/${editId}`, payload);
    } else {
      await post("/api/drilling", payload);
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const ok = await validateAndSubmitTab(activeTab);
      if (ok) {
        const title = activeTab === 'drilling' ? 'Drilling' : activeTab === 'casting' ? 'Casting' : 'Rotary';
        setSuccessMessage(`${title} work log ${editId ? 'updated' : 'submitted'} successfully!`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        navigate(activeTab === 'rotary' ? '/separateWorkLogReport' : '/infraDetailsShowTable');
      }
    } catch (error) {
      console.error("Error saving data", error);
      showToast("danger", "Error saving data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if a tab has user-entered content
  const tabHasData = (tabKey) => {
    if (tabKey === 'rotary') {
      const rows = tabData.rotary || [];
      return rows.some(r => r.machine_id || r.operator_id || r.group_no || r.pile_no || r.open_reading_hr || r.closing_reading_hr || r.soft_soil || r.hard_rock || r.diesel_lit);
    }
    const tab = tabData[tabKey];
    if (!tab) return false;
    const hasMR = tab.machineReading.some(r => r.machine_id || r.machine_start || r.machine_end || r.diesel_used || r.diesel_filled);
    const hasCR = tab.compressorReading.some(r => r.machine_id || r.comp_rpm_start || r.comp_rpm_end || r.diesel_used || r.diesel_filled);
    const hasWD = tab.workDetails.some(w => w.workType || w.workPoints || w.rate);
    const hasSD = tab.surveys.some(s => s.survey_type || s.survey_point || s.rate);
    const hasRM = tab.rawMaterials.some(m => m.material_type || m.qty_used);
    return hasMR || hasCR || hasWD || hasSD || hasRM;
  };

  const handleClearProject = () => {
    setProjectInfo(prev => ({
      ...prev,
      project_name: "",
      project_id: "",
      supervisor_id: "",
    }));
    setSelectedProjectDetails(null);
    setSearchQuery("");
    setShowDropdown(false);
  };

  // Current active tab data
  const currentTab = tabData[activeTab] || createInitialSectionState();

  return (
    <div className="">
      <CContainer fluid>
        {showSuccess && (
          <CAlert color="success" dismissible onClose={() => setShowSuccess(false)}>
            {successMessage || 'Form submitted successfully!'}
          </CAlert>
        )}

        <CCard className="shadow-sm">
          <CCardHeader className="bg-primary text-white">
            <h1 className="mb-0 h4 d-flex align-items-center">
              <CIcon icon={cilSettings} className="me-2" /> Daily Work Log
            </h1>
          </CCardHeader>

          <CCardBody className="p-4">
            <CForm>
              {/* 1. Project Information - Kept as is at the top */}
              <CCard className="mb-4 border-0" color="info" textColor="dark">
                <CCardBody className="bg-info-subtle rounded rounded-lg">
                  <h5 className="text-info mb-3 d-flex align-items-center fw-bold">
                    <CIcon icon={cilFile} className="me-2" /> 1. Project Information
                  </h5>
                  <CRow className="g-3">
                    <CCol md={4}>
                      <CFormLabel className="fw-semibold">Project Name *</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowDropdown(true);
                          }}
                          placeholder="Search for a project..."
                        />

                        {!projectInfo.project_name ? (
                          <CButton
                            color="primary"
                            variant="outline"
                            onClick={() => setShowProjectModal(true)}
                            title="Search project"
                          >
                            <CIcon icon={cilSearch} />
                          </CButton>
                        ) : (
                          <CButton
                            type="button"
                            color="danger"
                            variant="outline"
                            onClick={handleClearProject}
                            title="Clear project"
                          >
                            <CIcon icon={cilX} />
                          </CButton>
                        )}
                      </CInputGroup>

                      {showDropdown && projects.length > 0 && (
                        <div
                          className="border rounded bg-white mt-1 shadow-sm"
                          style={{
                            maxHeight: "150px",
                            overflowY: "auto",
                            position: "relative",
                            zIndex: 1000,
                          }}
                        >
                          {projects.map((project) => (
                            <div
                              key={project.id}
                              className="p-2 hover-bg-light border-bottom"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                handleProjectChange(project);
                                setSearchQuery(project.project_name);
                                setShowDropdown(false);
                              }}
                            >
                              <strong>{project.project_name}</strong> - <span className="text-muted">{project.customer_name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CCol>

                    <CCol md={4}>
                      <CFormLabel className="fw-semibold">Select Supervisor</CFormLabel>
                      <Select
                        options={supervisors}
                        value={
                          supervisors.find(s => String(s.value) === String(projectInfo.supervisor_id)) ||
                          (projectInfo.supervisor_id ? {
                            value: projectInfo.supervisor_id,
                            label: selectedProjectDetails?.supervisor_name || selectedProjectDetails?.supervisor?.name || 'Selected Supervisor'
                          } : null)
                        }
                        onChange={(selected) => setProjectInfo(prev => ({
                          ...prev,
                          supervisor_id: selected ? selected.value : ''
                        }))}
                        placeholder="Select Supervisor..."
                        isClearable
                        isSearchable
                      />
                    </CCol>

                    <CCol md={4}>
                      <CFormLabel className="fw-semibold">Date *</CFormLabel>
                      <CFormInput
                        type="date"
                        value={projectInfo.date}
                        onChange={(e) => setProjectInfo(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </CCol>
                  </CRow>

                  {/* Selected Project All Details */}
                  {selectedProjectDetails && (
                    <div className="mt-3 pt-3 border-top border-info-subtle">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <CIcon icon={cilInfo} className="text-info" />
                          <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                            Selected Project Details
                          </span>
                        </div>
                        {selectedProjectDetails.is_subcontract === 1 ? (
                          <CBadge color="warning" className="px-2 py-1">Subcontract Project</CBadge>
                        ) : (
                          <CBadge color="primary" className="px-2 py-1">Normal Project</CBadge>
                        )}
                      </div>

                      <div className="bg-white p-3 rounded-3 border shadow-sm">
                        <CRow className="g-3" style={{ fontSize: '13px' }}>
                          <CCol md={3} sm={6}>
                            <div className="text-muted small">Customer Name</div>
                            <div className="fw-semibold text-dark">
                              {selectedProjectDetails.customer_name || selectedProjectDetails.customer?.name || '—'}
                            </div>
                          </CCol>
                          <CCol md={3} sm={6}>
                            <div className="text-muted small">Mobile Number</div>
                            <div className="fw-semibold text-dark">
                              {selectedProjectDetails.mobile_number || selectedProjectDetails.customer?.mobile || '—'}
                            </div>
                          </CCol>
                          <CCol md={3} sm={6}>
                            <div className="text-muted small">Work Place / Location</div>
                            <div className="fw-semibold text-dark">
                              {selectedProjectDetails.work_place || selectedProjectDetails.customer?.address || '—'}
                            </div>
                          </CCol>
                          <CCol md={3} sm={6}>
                            <div className="text-muted small">Project Type</div>
                            <div className="fw-semibold text-dark">
                              {selectedProjectDetails.project_type || '—'}
                            </div>
                          </CCol>

                          <CCol md={3} sm={6}>
                            <div className="text-muted small">Project Cost</div>
                            <div className="fw-semibold text-success">
                              {selectedProjectDetails.project_cost
                                ? `₹${parseFloat(selectedProjectDetails.project_cost).toLocaleString()}`
                                : '—'}
                            </div>
                          </CCol>
                          <CCol md={3} sm={6}>
                            <div className="text-muted small">Supervisor</div>
                            <div className="fw-semibold text-dark">
                              {supervisors.find(s => String(s.value) === String(projectInfo.supervisor_id))?.label ||
                               selectedProjectDetails.supervisor_name ||
                               selectedProjectDetails.supervisor?.name ||
                               '—'}
                            </div>
                          </CCol>
                          <CCol md={3} sm={6}>
                            <div className="text-muted small">Start Date</div>
                            <div className="fw-semibold text-dark">
                              {selectedProjectDetails.start_date || '—'}
                            </div>
                          </CCol>
                          <CCol md={3} sm={6}>
                            <div className="text-muted small">End Date</div>
                            <div className="fw-semibold text-dark">
                              {selectedProjectDetails.end_date || '—'}
                            </div>
                          </CCol>

                          {(selectedProjectDetails.gst_number || selectedProjectDetails.pan_number) && (
                            <>
                              {selectedProjectDetails.gst_number && (
                                <CCol md={3} sm={6}>
                                  <div className="text-muted small">GST Number</div>
                                  <div className="fw-semibold text-dark">
                                    {selectedProjectDetails.gst_number}
                                  </div>
                                </CCol>
                              )}
                              {selectedProjectDetails.pan_number && (
                                <CCol md={3} sm={6}>
                                  <div className="text-muted small">PAN Number</div>
                                  <div className="fw-semibold text-dark">
                                    {selectedProjectDetails.pan_number}
                                  </div>
                                </CCol>
                              )}
                            </>
                          )}

                          {selectedProjectDetails.remark && (
                            <CCol md={12}>
                              <div className="text-muted small">Remark</div>
                              <div className="fw-normal text-secondary">
                                {selectedProjectDetails.remark}
                              </div>
                            </CCol>
                          )}
                        </CRow>
                      </div>
                    </div>
                  )}
                </CCardBody>
              </CCard>

              {/* 2. TABS: Drilling and Casting */}
              <div className="mb-4">
                <CNav variant="pills" className="bg-light p-2 rounded-3 border d-inline-flex gap-2">
                  <CNavItem>
                    <CNavLink
                      active={activeTab === 'drilling'}
                      onClick={() => setActiveTab('drilling')}
                      style={{
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '15px',
                        padding: '9px 26px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                      }}
                      className={activeTab === 'drilling' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-white border'}
                    >
                      <CIcon icon={cilSettings} className="me-2" />
                      Drilling
                      {tabHasData('drilling') && (
                        <span className={`ms-2 badge rounded-pill ${activeTab === 'drilling' ? 'bg-light text-primary' : 'bg-primary text-white'}`} style={{ fontSize: '10px' }}>
                          ●
                        </span>
                      )}
                    </CNavLink>
                  </CNavItem>

                  <CNavItem>
                    <CNavLink
                      active={activeTab === 'casting'}
                      onClick={() => setActiveTab('casting')}
                      style={{
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '15px',
                        padding: '9px 26px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                      }}
                      className={activeTab === 'casting' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-white border'}
                    >
                      <CIcon icon={cilCalculator} className="me-2" />
                      Casting
                      {tabHasData('casting') && (
                        <span className={`ms-2 badge rounded-pill ${activeTab === 'casting' ? 'bg-light text-primary' : 'bg-primary text-white'}`} style={{ fontSize: '10px' }}>
                          ●
                        </span>
                      )}
                    </CNavLink>
                  </CNavItem>

                  <CNavItem>
                    <CNavLink
                      active={activeTab === 'rotary'}
                      onClick={() => setActiveTab('rotary')}
                      style={{
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '15px',
                        padding: '9px 26px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                      }}
                      className={activeTab === 'rotary' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-white border'}
                    >
                      <CIcon icon={cilSettings} className="me-2" />
                      Rotary
                      {tabHasData('rotary') && (
                        <span className={`ms-2 badge rounded-pill ${activeTab === 'rotary' ? 'bg-light text-primary' : 'bg-primary text-white'}`} style={{ fontSize: '10px' }}>
                          ●
                        </span>
                      )}
                    </CNavLink>
                  </CNavItem>
                </CNav>
              </div>

              {/* Tab Header Badge */}
              <div className="mb-3 d-flex align-items-center justify-content-between">
                <span className="badge bg-dark px-3 py-2 fs-6 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                  Current Section: {activeTab === 'drilling' ? 'Drilling Log' : activeTab === 'casting' ? 'Casting Log' : 'Rotary Log'}
                </span>
                <span className="text-muted small">
                  Diesel Avg formula: <strong>Diesel Used / Machine HR</strong>
                </span>
              </div>

              {activeTab !== 'rotary' && (
                <>
              {/* Work Timing - Red/Pink Card matching uploaded design */}
              <div
                className="mb-4 rounded-3 p-3 p-md-4"
                style={{
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div className="d-flex align-items-center mb-3">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e11d48"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="me-2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <h5 className="mb-0 fw-bold" style={{ color: '#e11d48', fontSize: '18px' }}>
                    Work Timing
                  </h5>
                </div>

                <CRow className="g-3 align-items-start">
                  <CCol xs={12} sm={6} md={3}>
                    <div className="d-flex align-items-center mb-1" style={{ height: '22px' }}>
                      <CFormLabel className="fw-semibold text-dark mb-0" style={{ fontSize: '14px' }}>
                        Start Time <span className="text-danger">*</span>
                      </CFormLabel>
                    </div>
                    <CFormInput
                      type="time"
                      value={currentTab.start_time || ''}
                      onChange={(e) => handleWorkTimingChange('start_time', e.target.value)}
                      className="bg-white"
                      style={{
                        borderRadius: '8px',
                        height: '44px',
                        fontSize: '15px',
                        borderColor: '#e5e7eb',
                      }}
                    />
                  </CCol>

                  <CCol xs={12} sm={6} md={3}>
                    <div className="d-flex align-items-center mb-1" style={{ height: '22px' }}>
                      <CFormLabel className="fw-semibold text-dark mb-0" style={{ fontSize: '14px' }}>
                        End Time <span className="text-danger">*</span>
                      </CFormLabel>
                    </div>
                    <CFormInput
                      type="time"
                      value={currentTab.end_time || ''}
                      onChange={(e) => handleWorkTimingChange('end_time', e.target.value)}
                      className="bg-white"
                      style={{
                        borderRadius: '8px',
                        height: '44px',
                        fontSize: '15px',
                        borderColor: '#e5e7eb',
                      }}
                    />
                  </CCol>

                  <CCol xs={12} sm={6} md={3}>
                    <div className="d-flex justify-content-between align-items-center mb-1" style={{ height: '22px' }}>
                      <CFormLabel className="fw-semibold text-dark mb-0" style={{ fontSize: '14px' }}>
                        Break / Lunch
                      </CFormLabel>
                      {currentTab.break_time && parseBreakTimeToMinutes(currentTab.break_time) > 0 && (
                        <span className="badge bg-danger-subtle text-danger" style={{ fontSize: '11px' }}>
                          -{parseBreakTimeToMinutes(currentTab.break_time)} min
                        </span>
                      )}
                    </div>

                    {!customBreak[activeTab] ? (
                      <CFormSelect
                        value={normalizeBreakValue(currentTab.break_time)}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setCustomBreak(prev => ({ ...prev, [activeTab]: true }));
                          } else {
                            handleWorkTimingChange('break_time', val);
                          }
                        }}
                        className="bg-white"
                        style={{
                          borderRadius: '8px',
                          height: '44px',
                          fontSize: '14px',
                          borderColor: '#e5e7eb',
                        }}
                      >
                        <option value="00:00">No Break (0 min)</option>
                        <option value="00:15">15 min</option>
                        <option value="00:30">30 min (Fixed)</option>
                        <option value="00:45">45 min (Fixed)</option>
                        <option value="01:00">1 hr (60 min)</option>
                        <option value="01:15">1 hr 15 min</option>
                        <option value="01:30">1 hr 30 min</option>
                        <option value="02:00">2 hrs</option>
                        <option value="custom">✏️ Custom Time / Minutes...</option>
                      </CFormSelect>
                    ) : (
                      <div className="d-flex gap-1 align-items-center">
                        <CFormInput
                          type="text"
                          placeholder="e.g. 30 or 45 or 00:30"
                          value={currentTab.break_time || ''}
                          onChange={(e) => handleWorkTimingChange('break_time', e.target.value)}
                          className="bg-white"
                          style={{
                            borderRadius: '8px',
                            height: '44px',
                            fontSize: '14px',
                            borderColor: '#e5e7eb',
                          }}
                        />
                        <CButton
                          type="button"
                          color="secondary"
                          variant="outline"
                          size="sm"
                          style={{ height: '44px' }}
                          title="Back to Fixed Options"
                          onClick={() => setCustomBreak(prev => ({ ...prev, [activeTab]: false }))}
                        >
                          List
                        </CButton>
                      </div>
                    )}

                    {/* Quick Selection Chips in a single clean line */}
                    <div className="d-flex gap-1 mt-1 align-items-center" style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
                      <span className="text-muted" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Quick:</span>
                      {[
                        { label: '0m', val: '00:00' },
                        { label: '30m', val: '00:30' },
                        { label: '45m', val: '00:45' },
                        { label: '1h', val: '01:00' },
                      ].map((chip) => {
                        const isSelected = normalizeBreakValue(currentTab.break_time) === chip.val && !customBreak[activeTab];
                        return (
                          <button
                            key={chip.val}
                            type="button"
                            onClick={() => {
                              setCustomBreak(prev => ({ ...prev, [activeTab]: false }));
                              handleWorkTimingChange('break_time', chip.val);
                            }}
                            className={`btn btn-sm py-0 px-2 rounded-pill ${
                              isSelected
                                ? 'btn-danger text-white shadow-sm'
                                : 'btn-outline-secondary'
                            }`}
                            style={{ fontSize: '11px', fontWeight: 600, height: '22px', lineHeight: '20px', whiteSpace: 'nowrap' }}
                          >
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>
                  </CCol>

                  <CCol xs={12} sm={6} md={3}>
                    <div className="d-flex justify-content-between align-items-center mb-1" style={{ height: '22px' }}>
                      <CFormLabel className="fw-semibold text-dark mb-0" style={{ fontSize: '14px' }}>
                        Net Working Hours
                      </CFormLabel>
                      {formatNetHoursDuration(currentTab.net_hours) && (
                        <span className="badge bg-warning-subtle text-dark" style={{ fontSize: '11px' }}>
                          {formatNetHoursDuration(currentTab.net_hours)}
                        </span>
                      )}
                    </div>
                    <div
                      className="rounded-3 px-3 d-flex justify-content-between align-items-center"
                      style={{
                        backgroundColor: '#fef9c3',
                        border: '1px solid #fef08a',
                        height: '44px',
                        borderRadius: '8px',
                      }}
                    >
                      <span className="fw-bold" style={{ fontSize: '22px', color: '#111827', lineHeight: '1' }}>
                        {Number(currentTab.net_hours || 0).toFixed(2)}
                      </span>
                      <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>
                        hrs
                      </span>
                    </div>
                  </CCol>
                </CRow>
              </div>

              {/* Casting Team Section (Casting Tab Only) */}
              {activeTab === 'casting' && (
                <div
                  className="mb-4 rounded-3 p-3 p-md-4"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #dc2626',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded me-2"
                      style={{ width: '28px', height: '28px', backgroundColor: '#fee2e2', color: '#dc2626' }}
                    >
                      <CIcon icon={cilPeople} size="sm" />
                    </div>
                    <h5 className="mb-0 fw-bold" style={{ color: '#dc2626', fontSize: '18px' }}>
                      Casting Team & Helper
                    </h5>
                  </div>

                  <CRow className="g-3">
                    <CCol xs={12} md={4}>
                      <CFormLabel className="fw-semibold text-dark mb-1" style={{ fontSize: '14px' }}>
                        Casting Team Name
                      </CFormLabel>
                      <CFormInput
                        type="text"
                        placeholder="Enter Casting Team Name"
                        value={currentTab.casting_team_name || ''}
                        onChange={(e) => handleCastingTeamChange('casting_team_name', e.target.value)}
                        className="bg-white"
                        style={{ borderRadius: '8px', height: '42px', fontSize: '15px', borderColor: '#e5e7eb' }}
                      />
                    </CCol>

                    <CCol xs={12} md={4}>
                      <CFormLabel className="fw-semibold text-dark mb-1" style={{ fontSize: '14px' }}>
                        Casting Team No / Contact
                      </CFormLabel>
                      <CFormInput
                        type="text"
                        placeholder="Enter Casting Team No"
                        value={currentTab.casting_team_no || ''}
                        onChange={(e) => handleCastingTeamChange('casting_team_no', e.target.value)}
                        className="bg-white"
                        style={{ borderRadius: '8px', height: '42px', fontSize: '15px', borderColor: '#e5e7eb' }}
                      />
                    </CCol>

                    <CCol xs={12} md={4}>
                      <CFormLabel className="fw-semibold text-dark mb-1" style={{ fontSize: '14px' }}>
                        Helper (from Operators)
                      </CFormLabel>
                      <CFormSelect
                        value={currentTab.helper_id || ''}
                        onChange={(e) => handleCastingTeamChange('helper_id', e.target.value)}
                        className="bg-white"
                        style={{ borderRadius: '8px', height: '42px', fontSize: '15px', borderColor: '#e5e7eb' }}
                      >
                        <option value="">Select Helper</option>
                        {helpers.map(h => (
                          <option key={h.value} value={h.value}>{h.label}</option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>
                </div>
              )}

              {/* Machine Usage */}
              <CCard className="mb-4 border-0" color="success" textColor="dark">
                <CCardBody className="bg-success-subtle rounded rounded-lg">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="text-success mb-0 d-flex align-items-center fw-bold">
                      <CIcon icon={cilSettings} className="me-2" /> 2. Machine Usage ({activeTab === 'drilling' ? 'Drilling' : 'Casting'})
                    </h5>
                    <CButton
                      color="success"
                      variant="outline"
                      type="button"
                      size="md"
                      className="d-flex align-items-center"
                      onClick={addMachineReading}
                    >
                      Add Machine Reading
                    </CButton>
                  </div>

                  <CRow className="g-1">
                    {currentTab.machineReading.map((reading, index) => (
                      <CRow className="mb-2 gx-1 align-items-end" key={index}>
                        <CCol xs={12} md={2} className="p-1">
                          <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Oprator / Helper *</CFormLabel>
                          <Select
                            options={operators}
                            isSearchable
                            placeholder="Select Oprator..."
                            value={operators.find((op) => op.value === reading.oprator_id) || null}
                            onChange={(selected) =>
                              handleMachineReadingChange(index, "oprator_id", selected ? selected.value : "")
                            }
                          />
                        </CCol>

                        <CCol xs={12} md={2} className="p-1">
                          <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Machinery *</CFormLabel>
                          <Select
                            options={machineries}
                            isSearchable
                            placeholder="Select Machinery"
                            value={machineries.find((m) => m.value === reading.machine_id) || null}
                            onChange={(selected) =>
                              handleMachineReadingChange(index, "machine_id", selected ? selected.value : "")
                            }
                          />
                        </CCol>

                        <CCol xs={6} sm={4} md={1} className="p-1">
                          <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Meter Start</CFormLabel>
                          <CFormInput
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9.:]*"
                            value={reading.machine_start === 0 ? "" : reading.machine_start}
                            placeholder="0"
                            onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9.:]/g, "");
                              handleMachineReadingChange(index, "machine_start", val === "" ? "" : val);
                            }}
                          />
                        </CCol>

                        <CCol xs={6} sm={4} md={1} className="p-1">
                          <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Meter End</CFormLabel>
                          <CFormInput
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9.:]*"
                            value={reading.machine_end === 0 ? "" : reading.machine_end}
                            placeholder="0"
                            onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9.:]/g, "");
                              handleMachineReadingChange(index, "machine_end", val === "" ? "" : val);
                            }}
                          />
                        </CCol>

                        <CCol xs={6} sm={4} md={1} className="p-1">
                          <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Actual Hrs</CFormLabel>
                          <CInputGroup>
                            <CFormInput type="text" value={reading.actual_machine_hr} readOnly className="bg-light fw-semibold" />
                          </CInputGroup>
                        </CCol>

                        {/* 4 DIESEL COLUMNS */}
                        <CCol xs={6} sm={3} md={1} className="p-1">
                          <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Diesel Filed</CFormLabel>
                          <CFormInput
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9.]*"
                            value={reading.diesel_filled}
                            placeholder="0"
                            onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9.]/g, '');
                              const parts = val.split('.');
                              if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                              handleMachineReadingChange(index, "diesel_filled", val);
                            }}
                          />
                        </CCol>

                        <CCol xs={6} sm={3} md={1} className="p-1">
                          <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Diesel Used</CFormLabel>
                          <CFormInput
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9.]*"
                            value={reading.diesel_used}
                            placeholder="0"
                            onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9.]/g, '');
                              const parts = val.split('.');
                              if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                              handleMachineReadingChange(index, "diesel_used", val);
                            }}
                          />
                        </CCol>

                        <CCol xs={6} sm={3} md={1} className="p-1">
                          <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Diesel Balance</CFormLabel>
                          <CFormInput
                            type="text"
                            value={reading.diesel_balance}
                            readOnly
                            className="bg-light fw-bold text-success"
                          />
                        </CCol>

                        <CCol xs={6} sm={3} md={1} className="p-1">
                          <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }} title="Formula: Diesel Used / Machine HR">Diesel Avg.</CFormLabel>
                          <CFormInput
                            type="text"
                            value={reading.diesel_avg}
                            readOnly
                            className="bg-light fw-bold text-primary"
                            placeholder="0.00"
                            title="Formula: Diesel Used / Machine HR"
                          />
                        </CCol>

                        <CCol xs={12} sm={12} md={1} className="d-flex align-items-center justify-content-center p-1">
                          {currentTab.machineReading.length > 1 && (
                            <CButton
                              color="danger"
                              variant="ghost"
                              size="md"
                              onClick={() => removeMachineReading(index)}
                              title="Remove row"
                            >
                              <CIcon icon={cilX} />
                            </CButton>
                          )}
                        </CCol>
                      </CRow>
                    ))}
                  </CRow>
                </CCardBody>
              </CCard>

              {/* Compressor RPM */}
              <CCard className="mb-4 border-0" color="primary" textColor="dark">
                <CCardBody className="bg-primary-subtle rounded rounded-lg">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="text-primary mb-0 d-flex align-items-center fw-bold">
                      <CIcon icon={cilSettings} className="me-2" /> 3. Compressor Usage ({activeTab === 'drilling' ? 'Drilling' : 'Casting'})
                    </h5>
                    <CButton
                      color="primary"
                      variant="outline"
                      type="button"
                      size="md"
                      className="d-flex align-items-center"
                      onClick={addCompressorReading}
                    >
                      Add Compressor Reading
                    </CButton>
                  </div>

                  {currentTab.compressorReading.map((rpmReading, index) => (
                    <CRow className="mb-2 gx-1 align-items-end" key={index}>
                      <CCol xs={12} md={2} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Oprator / Helper *</CFormLabel>
                        <Select
                          options={operators}
                          isSearchable
                          placeholder="Select Oprator..."
                          value={operators.find((op) => op.value === rpmReading.oprator_id) || null}
                          onChange={(selected) =>
                            handleCompressorChange(index, "oprator_id", selected ? selected.value : "")
                          }
                        />
                      </CCol>

                      <CCol xs={12} md={2} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Machinery *</CFormLabel>
                        <Select
                          options={machineries}
                          isSearchable
                          placeholder="Select Machinery"
                          value={machineries.find((m) => m.value === rpmReading.machine_id) || null}
                          onChange={(selected) =>
                            handleCompressorChange(index, "machine_id", selected ? selected.value : "")
                          }
                        />
                      </CCol>

                      <CCol xs={6} sm={4} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>RPM Start *</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9.:]*"
                          value={rpmReading.comp_rpm_start}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9.:]/g, '');
                            handleCompressorChange(index, "comp_rpm_start", val);
                          }}
                        />
                      </CCol>

                      <CCol xs={6} sm={4} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>RPM End *</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9.:]*"
                          value={rpmReading.comp_rpm_end}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9.:]/g, '');
                            handleCompressorChange(index, "comp_rpm_end", val);
                          }}
                        />
                      </CCol>

                      <CCol xs={6} sm={4} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>RPM Hours</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            value={rpmReading.com_actul_hr}
                            readOnly
                            className="bg-light fw-semibold"
                          />
                        </CInputGroup>
                      </CCol>

                      {/* 4 DIESEL COLUMNS */}
                      <CCol xs={6} sm={3} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Diesel Filed</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9.]*"
                          value={rpmReading.diesel_filled}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9.]/g, '');
                            const parts = val.split('.');
                            if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                            handleCompressorChange(index, "diesel_filled", val);
                          }}
                        />
                      </CCol>

                      <CCol xs={6} sm={3} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Diesel Used</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9.]*"
                          value={rpmReading.diesel_used}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9.]/g, '');
                            const parts = val.split('.');
                            if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                            handleCompressorChange(index, "diesel_used", val);
                          }}
                        />
                      </CCol>

                      <CCol xs={6} sm={3} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }}>Diesel Balance</CFormLabel>
                        <CFormInput
                          type="text"
                          value={rpmReading.diesel_balance}
                          readOnly
                          className="bg-light fw-bold text-success"
                        />
                      </CCol>

                      <CCol xs={6} sm={3} md={1} className="p-1">
                        <CFormLabel className="text-nowrap" style={{ fontSize: '13px' }} title="Formula: Diesel Used / Machine HR">Diesel Avg.</CFormLabel>
                        <CFormInput
                          type="text"
                          value={rpmReading.diesel_avg}
                          readOnly
                          className="bg-light fw-bold text-primary"
                          placeholder="0.00"
                          title="Formula: Diesel Used / Machine HR"
                        />
                      </CCol>

                      <CCol xs={12} sm={12} md={1} className="d-flex align-items-center justify-content-center p-1">
                        {currentTab.compressorReading.length > 1 && (
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="md"
                            onClick={() => removeCompressorReading(index)}
                            title="Remove row"
                          >
                            <CIcon icon={cilX} />
                          </CButton>
                        )}
                      </CCol>
                    </CRow>
                  ))}
                </CCardBody>
              </CCard>

              {/* Work Details */}
              <CCard className="mb-4 border-0" color="warning" textColor="dark">
                <CCardBody className="bg-warning-subtle rounded rounded-lg">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="text-warning mb-0 d-flex align-items-center fw-bold">
                      <CIcon icon={cilCalculator} className="me-2" /> 4. Work Details ({activeTab === 'drilling' ? 'Drilling' : 'Casting'})
                    </h5>
                    <CButton color="warning" variant="outline" onClick={addWorkDetail}>
                      Add Work
                    </CButton>
                  </div>

                  {currentTab.workDetails.map((work, index) => (
                    <CRow key={index} className="align-items-center mb-2">
                      <CCol md={2}>
                        <CFormLabel>Oprator</CFormLabel>
                        <Select
                          options={operators}
                          isSearchable
                          placeholder="Select Oprator..."
                          value={operators.find((op) => op.value === work.operator_id) || null}
                          onChange={(selected) =>
                            handleWorkDetailChange(index, "operator_id", selected ? selected.value : "")
                          }
                        />
                      </CCol>

                      <CCol lg={2}>
                        <CFormLabel>Work Type</CFormLabel>
                        <CFormSelect
                          value={work.workType}
                          onChange={(e) =>
                            handleWorkDetailChange(index, "workType", e.target.value)
                          }
                        >
                          <option value="">Select Work Type</option>
                          {workTypes.map((type) => (
                            <option key={type.id} value={type.name}>
                              {type.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      <CCol lg={2}>
                        <CFormLabel>Drilling Type (Optional)</CFormLabel>
                        <CFormSelect
                          value={work.drilling_type || ""}
                          onChange={(e) =>
                            handleWorkDetailChange(index, "drilling_type", e.target.value)
                          }
                        >
                          <option value="">Select Drilling Type</option>
                          <option value="Hard">Hard</option>
                          <option value="Medium">Medium</option>
                          <option value="Soft">Soft</option>
                        </CFormSelect>
                      </CCol>

                      <CCol lg={1}>
                        <CFormLabel>UOM</CFormLabel>
                        <CFormSelect
                          value={work.uom}
                          onChange={(e) =>
                            handleWorkDetailChange(index, "uom", e.target.value)
                          }
                        >
                          <option value="">Select UOM</option>
                          {uoms.map((type) => (
                            <option key={type.id} value={type.name}>
                              {type.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      <CCol lg={1}>
                        <CFormLabel>Points</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={work.workPoints === 0 ? "" : work.workPoints}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            handleWorkDetailChange(
                              index,
                              "workPoints",
                              val === "" ? 0 : Number(val)
                            );
                          }}
                        />
                      </CCol>

                      <CCol lg={1}>
                        <CFormLabel>Rate</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText className="px-1">₹</CInputGroupText>
                          <CFormInput
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={work.rate === 0 ? "" : work.rate}
                            placeholder="0"
                            className="px-1"
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              handleWorkDetailChange(
                                index,
                                "rate",
                                val === "" ? 0 : Number(val)
                              );
                            }}
                          />
                        </CInputGroup>
                      </CCol>

                      <CCol lg={1}>
                        <CFormLabel>Total</CFormLabel>
                        <CFormInput
                          value={Number(work.total || 0).toFixed(2)}
                          readOnly
                          className="bg-light fw-bold px-1"
                        />
                      </CCol>

                      <CCol lg={1}>
                        <CFormLabel>Diesel</CFormLabel>
                        <CFormInput
                          type="number"
                          min="0"
                          step="any"
                          value={work.diesel}
                          placeholder="0"
                          onChange={(e) => {
                            if (e.target.value >= 0) {
                              handleWorkDetailChange(index, "diesel", e.target.value);
                            }
                          }}
                        />
                      </CCol>

                      <CCol lg={1}>
                        <CFormLabel>Hrs</CFormLabel>
                        <CFormInput
                          type="number"
                          min="0"
                          step="any"
                          value={work.hrs}
                          placeholder="0"
                          onChange={(e) => {
                            if (e.target.value >= 0) {
                              handleWorkDetailChange(index, "hrs", e.target.value);
                            }
                          }}
                        />
                      </CCol>

                      {currentTab.workDetails.length > 1 && (
                        <CCol xs="auto">
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            className="mt-4"
                            onClick={() => removeWorkDetail(index)}
                          >
                            <CIcon icon={cilX} />
                          </CButton>
                        </CCol>
                      )}
                    </CRow>
                  ))}
                </CCardBody>
              </CCard>

              {/* Survey Details */}
              <CCard className="mb-4 border-0" color="info" textColor="dark">
                <CCardBody className="bg-info-subtle rounded rounded-lg">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="text-info mb-0 d-flex align-items-center fw-bold">
                      <CIcon icon={cilLocationPin} className="me-2" /> 5. Survey Details ({activeTab === 'drilling' ? 'Drilling' : 'Casting'})
                    </h5>
                    <CButton color="info" variant="outline" onClick={addSurvey}>
                      Add Survey
                    </CButton>
                  </div>

                  {currentTab.surveys.map((survey, index) => (
                    <CRow key={index} className="align-items-center mb-2">
                      <CCol md={2}>
                        <CFormLabel>Oprator</CFormLabel>
                        <Select
                          options={operators}
                          isSearchable
                          placeholder="Select Oprator..."
                          value={operators.find((op) => op.value === survey.operator_id) || null}
                          onChange={(selected) =>
                            handleSurveyChange(index, "operator_id", selected ? selected.value : "")
                          }
                        />
                      </CCol>

                      <CCol lg={2}>
                        <CFormLabel>Survey Type</CFormLabel>
                        <CFormSelect
                          value={survey.survey_type}
                          onChange={(e) =>
                            handleSurveyChange(index, "survey_type", e.target.value)
                          }
                        >
                          <option value="">Select Survey Type</option>
                          {surveyTypes.map((type) => (
                            <option key={type.id} value={type.name}>
                              {type.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      <CCol lg={2}>
                        <CFormLabel>UOM</CFormLabel>
                        <CFormSelect
                          value={survey.uom}
                          onChange={(e) =>
                            handleSurveyChange(index, "uom", e.target.value)
                          }
                        >
                          <option value="">Select UOM</option>
                          {uoms.map((type) => (
                            <option key={type.id} value={type.name}>
                              {type.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      <CCol lg={1}>
                        <CFormLabel>Points</CFormLabel>
                        <CFormInput
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={survey.survey_point === 0 ? "" : survey.survey_point}
                          placeholder="0"
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            handleSurveyChange(
                              index,
                              "survey_point",
                              val === "" ? 0 : Number(val)
                            );
                          }}
                        />
                      </CCol>

                      <CCol lg={2}>
                        <CFormLabel>Rate</CFormLabel>
                        <CInputGroup>
                          <CInputGroupText>₹</CInputGroupText>
                          <CFormInput
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={survey.rate === 0 ? "" : survey.rate}
                            placeholder="0"
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              handleSurveyChange(
                                index,
                                "rate",
                                val === "" ? 0 : Number(val)
                              );
                            }}
                          />
                        </CInputGroup>
                      </CCol>

                      <CCol lg={1}>
                        <CFormLabel>Total</CFormLabel>
                        <CFormInput
                          value={Number(survey.total || 0).toFixed(2)}
                          readOnly
                          className="bg-light fw-bold px-1"
                        />
                      </CCol>

                      <CCol lg={1}>
                        <CFormLabel>Diesel</CFormLabel>
                        <CFormInput
                          type="number"
                          min="0"
                          step="any"
                          value={survey.diesel}
                          placeholder="0"
                          onChange={(e) => {
                            if (e.target.value >= 0) {
                              handleSurveyChange(index, "diesel", e.target.value);
                            }
                          }}
                        />
                      </CCol>

                      <CCol lg={1}>
                        <CFormLabel>Hrs</CFormLabel>
                        <CFormInput
                          type="number"
                          min="0"
                          step="any"
                          value={survey.hrs}
                          placeholder="0"
                          onChange={(e) => {
                            if (e.target.value >= 0) {
                              handleSurveyChange(index, "hrs", e.target.value);
                            }
                          }}
                        />
                      </CCol>

                      <CCol lg={1}>
                        {currentTab.surveys.length > 1 && (
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            className="mt-4"
                            onClick={() => removeSurvey(index)}
                          >
                            <CIcon icon={cilX} />
                          </CButton>
                        )}
                      </CCol>
                    </CRow>
                  ))}
                </CCardBody>
              </CCard>

              {/* Material Management Section - matching design screenshot */}
              <div
                className="mb-4 rounded-3 p-3 p-md-4 shadow-sm"
                style={{
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded me-2 shadow-sm"
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: '#e11d48',
                        color: '#fff',
                        fontSize: '15px',
                        borderRadius: '6px',
                      }}
                    >
                      📦
                    </div>
                    <h5 className="mb-0 fw-bold" style={{ color: '#e11d48', fontSize: '18px' }}>
                      Material Management ({activeTab === 'casting' ? 'Casting' : 'Drilling'})
                    </h5>
                  </div>
                  <CButton
                    color="danger"
                    variant="outline"
                    size="sm"
                    className="d-flex align-items-center"
                    onClick={addRawMaterial}
                    style={{ borderRadius: '6px' }}
                  >
                    + Add Material
                  </CButton>
                </div>

                <div className="table-responsive bg-white rounded-3 border" style={{ borderColor: '#fbcfe8' }}>
                  <table className="table table-hover align-middle mb-0 text-center" style={{ fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#eff6ff', color: '#1e293b', borderBottom: '2px solid #e2e8f0' }}>
                        <th className="text-start ps-3 py-3" style={{ minWidth: '160px', fontWeight: '600' }}>Material Type</th>
                        <th className="py-3" style={{ minWidth: '120px', fontWeight: '600' }}>Available (Qty)</th>
                        <th className="py-3" style={{ minWidth: '120px', fontWeight: '600' }}>Received (Qty)</th>
                        <th className="py-3" style={{ minWidth: '120px', fontWeight: '600' }}>Used (Qty)</th>
                        <th className="py-3" style={{ minWidth: '130px', fontWeight: '600' }}>Balance (Qty)</th>
                        <th className="py-3" style={{ minWidth: '90px', fontWeight: '600' }}>Unit</th>
                        <th className="py-3" style={{ width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTab.rawMaterials.map((material, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td className="text-start ps-3" style={{ minWidth: '180px' }}>
                            <CFormSelect
                              value={material.material_id || material.material_type || ""}
                              onChange={(e) => handleMaterialSelect(index, e.target.value)}
                              className="bg-white fw-semibold"
                              style={{ minWidth: '160px', height: '36px', borderRadius: '6px', fontSize: '14px', borderColor: '#cbd5e1' }}
                            >
                              <option value="">Select Material Type</option>
                              {materialTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </CFormSelect>
                          </td>
                          <td>
                            <span className="fw-medium text-secondary">{material.available_qty ?? 0}</span>
                          </td>
                          <td>
                            <CFormInput
                              type="number"
                              min="0"
                              step="any"
                              value={material.received_qty === '' ? '' : material.received_qty}
                              placeholder="0"
                              className="text-center mx-auto"
                              style={{ maxWidth: '100px', height: '36px', borderRadius: '6px' }}
                              onChange={(e) => handleRawMaterialChange(index, "received_qty", e.target.value)}
                            />
                          </td>
                          <td>
                            <CFormInput
                              type="number"
                              min="0"
                              step="any"
                              value={material.qty_used === '' ? '' : material.qty_used}
                              placeholder="0"
                              className="text-center mx-auto"
                              style={{ maxWidth: '100px', height: '36px', borderRadius: '6px' }}
                              onChange={(e) => handleRawMaterialChange(index, "qty_used", e.target.value)}
                            />
                          </td>
                          <td>
                            <div
                              className="py-1 px-3 fw-bold mx-auto rounded"
                              style={{
                                backgroundColor: '#dcfce7',
                                color: '#15803d',
                                maxWidth: '100px',
                                fontSize: '15px',
                                border: '1px solid #bbf7d0',
                              }}
                            >
                              {material.balance_qty ?? ((parseFloat(material.available_qty) || 0) + (parseFloat(material.received_qty) || 0) - (parseFloat(material.qty_used) || 0))}
                            </div>
                          </td>
                          <td>
                            <span className="text-secondary fw-semibold">{material.unit || '-'}</span>
                          </td>
                          <td>
                            {currentTab.rawMaterials.length > 1 && (
                              <CButton
                                color="danger"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRawMaterial(index)}
                                title="Remove Material"
                              >
                                <CIcon icon={cilX} />
                              </CButton>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
                </>
              )}

              {/* Rotary Section */}
              {activeTab === 'rotary' && (
                <div>
                  {/* KPI Summary Cards */}
                  <CRow className="g-3 mb-4">
                    <CCol md={2} sm={4} xs={6}>
                      <div className="p-3 bg-white rounded-3 border text-center shadow-sm" style={{ borderTop: '4px solid #1F3864' }}>
                        <div className="text-muted small fw-semibold text-uppercase">Total Rows</div>
                        <div className="fs-4 fw-bold text-dark">{tabData.rotary?.length || 0}</div>
                        <div className="text-secondary small">Rotary Entries</div>
                      </div>
                    </CCol>
                    <CCol md={2} sm={4} xs={6}>
                      <div className="p-3 bg-white rounded-3 border text-center shadow-sm" style={{ borderTop: '4px solid #0284c7' }}>
                        <div className="text-muted small fw-semibold text-uppercase">Total Hours</div>
                        <div className="fs-4 fw-bold text-primary">{rotaryTotals.totalHours} h</div>
                        <div className="text-secondary small">Machine Run</div>
                      </div>
                    </CCol>
                    <CCol md={2} sm={4} xs={6}>
                      <div className="p-3 bg-white rounded-3 border text-center shadow-sm" style={{ borderTop: '4px solid #059669' }}>
                        <div className="text-muted small fw-semibold text-uppercase">Today Miter</div>
                        <div className="fs-4 fw-bold text-success">{rotaryTotals.totalMiter} m</div>
                        <div className="text-secondary small">Soil + Rock</div>
                      </div>
                    </CCol>
                    <CCol md={2} sm={4} xs={6}>
                      <div className="p-3 bg-white rounded-3 border text-center shadow-sm" style={{ borderTop: '4px solid #7c3aed' }}>
                        <div className="text-muted small fw-semibold text-uppercase">Today Piles</div>
                        <div className="fs-4 fw-bold" style={{ color: '#7c3aed' }}>{rotaryTotals.totalPiles}</div>
                        <div className="text-secondary small">Piles Completed</div>
                      </div>
                    </CCol>
                    <CCol md={2} sm={4} xs={6}>
                      <div className="p-3 bg-white rounded-3 border text-center shadow-sm" style={{ borderTop: '4px solid #dc2626' }}>
                        <div className="text-muted small fw-semibold text-uppercase">Diesel (Lit.)</div>
                        <div className="fs-4 fw-bold text-danger">{rotaryTotals.totalDiesel} L</div>
                        <div className="text-secondary small">Total Consumed</div>
                      </div>
                    </CCol>
                    <CCol md={2} sm={4} xs={6}>
                      <div className="p-3 bg-white rounded-3 border text-center shadow-sm" style={{ borderTop: '4px solid #d97706' }}>
                        <div className="text-muted small fw-semibold text-uppercase">Bullets Used</div>
                        <div className="fs-4 fw-bold text-warning">{rotaryTotals.totalBullet}</div>
                        <div className="text-secondary small">Bits / Bullets</div>
                      </div>
                    </CCol>
                  </CRow>

                  {/* Rotary Form Card */}
                  <div
                    className="mb-4 rounded-3 p-3 p-md-4 bg-white border shadow-sm"
                    style={{ borderColor: '#cbd5e1' }}
                  >
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <CIcon icon={cilSettings} className="text-primary" size="lg" />
                        <h5 className="mb-0 fw-bold text-dark">
                          Rotary Operation Records
                        </h5>
                        <CBadge color="primary" className="ms-2">
                          Standard 26-Field Report
                        </CBadge>
                      </div>
                      <CButton
                        color="primary"
                        size="sm"
                        className="d-flex align-items-center fw-semibold px-3"
                        onClick={addRotaryRow}
                        style={{ borderRadius: '6px' }}
                      >
                        <CIcon icon={cilSettings} className="me-1" /> + Add Rotary Row
                      </CButton>
                    </div>

                    <div className="table-responsive bg-white rounded-3 border shadow-sm" style={{ maxHeight: '72vh' }}>
                      <table className="table table-bordered table-hover align-middle mb-0 text-center" style={{ fontSize: '13px' }}>
                        <thead className="table-light sticky-top shadow-sm" style={{ zIndex: 10 }}>
                          {/* Top group header */}
                          <tr style={{ backgroundColor: '#1F3864', color: '#ffffff', borderBottom: '2px solid #0f172a' }}>
                            <th colSpan={8} style={{ backgroundColor: '#1F3864', color: '#ffffff', borderRight: '2px solid #ffffff' }} className="py-2">
                              1. General Entry Details
                            </th>
                            <th colSpan={3} style={{ backgroundColor: '#2C4C7E', color: '#ffffff', borderRight: '2px solid #ffffff' }} className="py-2">
                              2. Machine Reading
                            </th>
                            <th colSpan={8} style={{ backgroundColor: '#1F3864', color: '#ffffff', borderRight: '2px solid #ffffff' }} className="py-2">
                              3. Boring & Pile Progress
                            </th>
                            <th colSpan={4} style={{ backgroundColor: '#2C4C7E', color: '#ffffff', borderRight: '2px solid #ffffff' }} className="py-2">
                              4. Diesel Tracking
                            </th>
                            <th colSpan={2} style={{ backgroundColor: '#1F3864', color: '#ffffff', borderRight: '2px solid #ffffff' }} className="py-2">
                              5. Bullet Inventory
                            </th>
                            <th style={{ backgroundColor: '#1F3864', color: '#ffffff' }} className="py-2">
                              Action
                            </th>
                          </tr>
                          {/* Column labels */}
                          <tr style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}>
                            <th style={{ width: '40px' }}>#</th>
                            <th style={{ minWidth: '130px' }}>Date *</th>
                            <th style={{ minWidth: '160px' }}>Machine No. *</th>
                            <th style={{ minWidth: '100px' }}>Group No.</th>
                            <th style={{ minWidth: '180px' }}>Site Engineer *</th>
                            <th style={{ minWidth: '180px' }}>Operator Name *</th>
                            <th style={{ minWidth: '180px' }}>Helper Name</th>
                            <th style={{ minWidth: '120px' }}>Shift Time</th>

                            <th style={{ minWidth: '100px' }}>Open Reading</th>
                            <th style={{ minWidth: '100px' }}>Closing Reading</th>
                            <th style={{ minWidth: '100px' }} className="bg-primary-subtle text-primary">Total Hours</th>

                            <th style={{ minWidth: '90px' }}>Dia (mm)</th>
                            <th style={{ minWidth: '85px' }}>Pile No.</th>
                            <th style={{ minWidth: '95px' }}>Soft Soil (m)</th>
                            <th style={{ minWidth: '95px' }}>Hard Rock (m)</th>
                            <th style={{ minWidth: '100px' }} className="bg-success-subtle text-success">Today Miter</th>
                            <th style={{ minWidth: '100px' }}>Total Miter</th>
                            <th style={{ minWidth: '80px' }}>Today Pile</th>
                            <th style={{ minWidth: '80px' }}>Total Pile</th>

                            <th style={{ minWidth: '100px' }}>Diesel (Lit.)</th>
                            <th style={{ minWidth: '90px' }}>Start %</th>
                            <th style={{ minWidth: '90px' }}>Closing %</th>
                            <th style={{ minWidth: '90px' }}>Use %</th>

                            <th style={{ minWidth: '90px' }}>Bullet Use</th>
                            <th style={{ minWidth: '95px' }}>Stock Bullet</th>

                            <th style={{ width: '45px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(tabData.rotary || []).map((row, index) => (
                            <tr key={index}>
                              <td className="fw-bold text-secondary">{index + 1}</td>
                              <td>
                                <CFormInput
                                  type="date"
                                  value={row.date || projectInfo.date || ''}
                                  onChange={(e) => handleRotaryChange(index, 'date', e.target.value)}
                                  style={{ minWidth: '125px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <div style={{ minWidth: '150px', textAlign: 'left' }}>
                                  <Select
                                    options={machineries}
                                    value={machineries.find(m => String(m.value) === String(row.machine_id)) || (row.machine_no ? { value: row.machine_id, label: row.machine_no } : null)}
                                    onChange={(opt) => {
                                      handleRotaryChange(index, 'machine_id', opt ? opt.value : '');
                                      handleRotaryChange(index, 'machine_no', opt ? opt.label : '');
                                    }}
                                    placeholder="Machine..."
                                    isSearchable
                                    isClearable
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                  />
                                </div>
                              </td>
                              <td>
                                <CFormInput
                                  type="text"
                                  value={row.group_no || ''}
                                  onChange={(e) => handleRotaryChange(index, 'group_no', e.target.value)}
                                  placeholder="RP20"
                                  style={{ minWidth: '85px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <div style={{ minWidth: '170px', textAlign: 'left' }}>
                                  <Select
                                    options={supervisors}
                                    value={supervisors.find(s => String(s.value) === String(row.site_engineer_id)) || (row.site_engineer ? { value: row.site_engineer_id, label: row.site_engineer } : null)}
                                    onChange={(opt) => {
                                      handleRotaryChange(index, 'site_engineer_id', opt ? opt.value : '');
                                      handleRotaryChange(index, 'site_engineer', opt ? opt.label : '');
                                    }}
                                    placeholder="Supervisor/Eng..."
                                    isSearchable
                                    isClearable
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                  />
                                </div>
                              </td>
                              <td>
                                <div style={{ minWidth: '170px', textAlign: 'left' }}>
                                  <Select
                                    options={operators}
                                    value={operators.find(o => String(o.value) === String(row.operator_id)) || (row.operator_name ? { value: row.operator_id, label: row.operator_name } : null)}
                                    onChange={(opt) => {
                                      handleRotaryChange(index, 'operator_id', opt ? opt.value : '');
                                      handleRotaryChange(index, 'operator_name', opt ? opt.label : '');
                                    }}
                                    placeholder="Operator..."
                                    isSearchable
                                    isClearable
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                  />
                                </div>
                              </td>
                              <td>
                                <div style={{ minWidth: '170px', textAlign: 'left' }}>
                                  <Select
                                    options={helpers}
                                    value={helpers.find(h => String(h.value) === String(row.helper_id)) || (row.helper_name ? { value: row.helper_id, label: row.helper_name } : null)}
                                    onChange={(opt) => {
                                      handleRotaryChange(index, 'helper_id', opt ? opt.value : '');
                                      handleRotaryChange(index, 'helper_name', opt ? opt.label : '');
                                    }}
                                    placeholder="Helper..."
                                    isSearchable
                                    isClearable
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                  />
                                </div>
                              </td>
                              <td>
                                <CFormSelect
                                  value={row.shift_time || 'Day'}
                                  onChange={(e) => handleRotaryChange(index, 'shift_time', e.target.value)}
                                  style={{ minWidth: '115px', height: '36px', fontSize: '13px' }}
                                >
                                  <option value="Day">Day</option>
                                  <option value="Night">Night</option>
                                  <option value="Day & Night">Day & Night</option>
                                </CFormSelect>
                              </td>

                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.open_reading_hr ?? ''}
                                  onChange={(e) => handleRotaryNumberChange(index, 'open_reading_hr', e.target.value)}
                                  placeholder="0.0"
                                  style={{ minWidth: '90px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.closing_reading_hr ?? ''}
                                  onChange={(e) => handleRotaryNumberChange(index, 'closing_reading_hr', e.target.value)}
                                  placeholder="0.0"
                                  style={{ minWidth: '90px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td className="bg-primary-subtle">
                                <div className="fw-bold text-primary" style={{ fontSize: '14px' }}>
                                  {row.total_hours != null && row.total_hours !== '' ? row.total_hours : 0}
                                </div>
                              </td>

                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.dia ?? ''}
                                  onChange={(e) => handleRotaryChange(index, 'dia', e.target.value)}
                                  placeholder="1200"
                                  style={{ minWidth: '85px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="text"
                                  value={row.pile_no || ''}
                                  onChange={(e) => handleRotaryChange(index, 'pile_no', e.target.value)}
                                  placeholder="B"
                                  style={{ minWidth: '75px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.soft_soil ?? ''}
                                  onChange={(e) => handleRotaryNumberChange(index, 'soft_soil', e.target.value)}
                                  placeholder="0.0"
                                  style={{ minWidth: '85px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.hard_rock ?? ''}
                                  onChange={(e) => handleRotaryNumberChange(index, 'hard_rock', e.target.value)}
                                  placeholder="0.0"
                                  style={{ minWidth: '85px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td className="bg-success-subtle">
                                <div className="fw-bold text-success" style={{ fontSize: '14px' }}>
                                  {row.today_miter != null && row.today_miter !== '' ? row.today_miter : 0}
                                </div>
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.total_miter ?? ''}
                                  onChange={(e) => handleRotaryChange(index, 'total_miter', e.target.value)}
                                  placeholder="0.0"
                                  style={{ minWidth: '90px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.today_pile ?? 1}
                                  onChange={(e) => handleRotaryChange(index, 'today_pile', e.target.value)}
                                  placeholder="1"
                                  style={{ minWidth: '75px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.total_pile ?? ''}
                                  onChange={(e) => handleRotaryChange(index, 'total_pile', e.target.value)}
                                  placeholder="0"
                                  style={{ minWidth: '75px', height: '36px', fontSize: '13px' }}
                                />
                              </td>

                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.diesel_lit ?? ''}
                                  onChange={(e) => handleRotaryChange(index, 'diesel_lit', e.target.value)}
                                  placeholder="0"
                                  style={{ minWidth: '85px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  max="100"
                                  onKeyDown={blockNegativeKey}
                                  value={row.diesel_start_percent ?? ''}
                                  onChange={(e) => handleRotaryPercentChange(index, 'diesel_start_percent', e.target.value)}
                                  placeholder="%"
                                  style={{ minWidth: '75px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  max="100"
                                  onKeyDown={blockNegativeKey}
                                  value={row.diesel_closing_percent ?? ''}
                                  onChange={(e) => handleRotaryPercentChange(index, 'diesel_closing_percent', e.target.value)}
                                  placeholder="%"
                                  style={{ minWidth: '75px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  max="100"
                                  onKeyDown={blockNegativeKey}
                                  value={row.diesel_use_percent ?? ''}
                                  onChange={(e) => handleRotaryChange(index, 'diesel_use_percent', e.target.value)}
                                  placeholder="%"
                                  style={{ minWidth: '75px', height: '36px', fontSize: '13px' }}
                                />
                              </td>

                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.bullet_use ?? ''}
                                  onChange={(e) => handleRotaryChange(index, 'bullet_use', e.target.value)}
                                  placeholder="0"
                                  style={{ minWidth: '75px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.stock_bullet ?? ''}
                                  onChange={(e) => handleRotaryChange(index, 'stock_bullet', e.target.value)}
                                  placeholder="0"
                                  style={{ minWidth: '75px', height: '36px', fontSize: '13px' }}
                                />
                              </td>

                              <td>
                                {tabData.rotary?.length > 1 && (
                                  <CButton
                                    color="danger"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeRotaryRow(index)}
                                    title="Remove Row"
                                  >
                                    <CIcon icon={cilX} />
                                  </CButton>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light fw-bold" style={{ borderTop: '2px solid #cbd5e1' }}>
                          <tr>
                            <td colSpan={10} className="text-end pe-3 text-uppercase text-secondary">
                              Totals:
                            </td>
                            <td className="bg-primary-subtle text-primary">
                              {rotaryTotals.totalHours} h
                            </td>
                            <td colSpan={4} className="text-end pe-3"></td>
                            <td className="bg-success-subtle text-success">
                              {rotaryTotals.totalMiter} m
                            </td>
                            <td></td>
                            <td style={{ color: '#7c3aed' }}>
                              {rotaryTotals.totalPiles}
                            </td>
                            <td></td>
                            <td className="bg-danger-subtle text-danger">
                              {rotaryTotals.totalDiesel} L
                            </td>
                            <td colSpan={3}></td>
                            <td className="bg-warning-subtle text-warning">
                              {rotaryTotals.totalBullet}
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="mt-3 d-flex justify-content-end">
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        className="d-flex align-items-center fw-semibold px-3"
                        onClick={addRotaryRow}
                        style={{ borderRadius: '6px' }}
                      >
                        <CIcon icon={cilSettings} className="me-1" /> + Add Another Rotary Row
                      </CButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Section */}
              <div className="d-flex justify-content-center gap-3">
                <CButton
                  color={activeTab === 'rotary' ? 'primary' : 'danger'}
                  size="lg"
                  className="px-5 d-flex align-items-center shadow-sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <CIcon icon={cilFile} className="me-2" />
                  {isSubmitting
                    ? (editId ? 'Updating...' : 'Submitting...')
                    : `${editId ? 'Update' : 'Submit'} ${activeTab === 'drilling' ? 'Drilling' : activeTab === 'casting' ? 'Casting' : 'Rotary'} Work Log`}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CContainer>

      {/* Project Selection Modal */}
      <ProjectSelectionModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleProjectChange}
      />
    </div>
  );
};

export default MachineUsageForm;