import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CCard, CCardBody, CCardHeader, CRow, CCol, CForm, CFormLabel, CFormInput,
  CFormSelect, CButton, CContainer, CAlert,
  CInputGroup, CInputGroupText, CBadge,
  CNav, CNavItem, CNavLink
} from '@coreui/react';
import { cilSettings, cilCalculator, cilLocationPin, cilX, cilFile, cilSearch, cilPeople, cilInfo, cilTrash, cilPlus } from '@coreui/icons';
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

const parseHoleSizeString = (str) => {
  if (!str || typeof str !== 'string') return [{ hole_nos: '', hole_depth: '' }];
  const parts = str.split('|').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return [{ hole_nos: '', hole_depth: '' }];

  const parsed = parts.map(part => {
    const match = part.match(/([0-9]+(?:\.[0-9]+)?)\s*[xX*]\s*([0-9]+(?:\.[0-9]+)?)/);
    if (match) {
      return { hole_nos: match[1], hole_depth: match[2] };
    }
    return { hole_nos: '', hole_depth: '', raw: part };
  });

  return parsed.length > 0 ? parsed : [{ hole_nos: '', hole_depth: '' }];
};

const createInitialTataRow = (defaultDate = '', defaultSiteLocation = '') => ({
  date: defaultDate,
  shift: 'Day Shift',
  site_location: defaultSiteLocation || '',
  hole_type: '',
  machine_id: '',
  machine_no: '',
  open_reading: '',
  closing_reading: '',
  today_hours: 0,
  hole_nos: '',
  hole_depth: '',
  hole_size: '',
  extra_sizes: [],
  today_mtr: '',
  total_mtr: '',
  operator_id: '',
  operator_name: '',
  helper_id: '',
  helper_name: '',
  today_diesel_used: '',
  total_diesel_taken: '',
  today_holes: '',
  total_holes: '',
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

  // Tab State: 'drilling' | 'casting' | 'rotary' | 'tata'
  const [activeTab, setActiveTab] = useState(
    targetTab && ['drilling', 'casting', 'rotary', 'tata'].includes(targetTab) ? targetTab : 'drilling'
  );

  // Independent form data per tab
  const [tabData, setTabData] = useState({
    drilling: createInitialSectionState(),
    casting: createInitialSectionState(),
    rotary: [createInitialRotaryRow()],
    tata: [createInitialTataRow()],
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

        let projectObj = data.project;
        if (!projectObj && data.project_id) {
          try {
            const pRes = await getAPICall(`/api/projects/${data.project_id}`);
            const pData = pRes?.data || pRes;
            if (pData) projectObj = pData;
          } catch (e) {}
        }

        const supId = data.supervisor_id ||
          data.supervisor?.id ||
          data.site_engineer_id ||
          projectObj?.supervisor_id ||
          projectObj?.supervisor?.id ||
          '';

        const supName = data.supervisor?.name ||
          data.supervisor_name ||
          data.site_engineer ||
          projectObj?.supervisor?.name ||
          projectObj?.supervisor_name ||
          '';

        if (supId && supName) {
          setSupervisors(prev => {
            if (prev.some(s => String(s.value) === String(supId))) return prev;
            return [...prev, { value: supId, label: supName }];
          });
        }

        setProjectInfo({
          project_id: data.project_id || (projectObj?.id || ''),
          project_name: projectObj?.project_name || data.project?.project_name || data.site_name || '',
          supervisor_id: supId ? String(supId) : '',
          date: data.date || '',
        });

        if (projectObj) {
          setSelectedProjectDetails(projectObj);
          setSearchQuery(projectObj.project_name || '');
        }

        const rotDetails = data.rotary_details || data.rotaryDetails || [];
        const isRot = data.tab_type === 'rotary' || rotDetails.length > 0;
        const tataDetails = data.tata_details || data.tataDetails || [];
        const isTata = data.tab_type === 'tata' || tataDetails.length > 0;
        const isCasting = data.tab_type === 'casting' || targetTab === 'casting' ||
          (data.work_points && data.work_points.some(w => (w.work_type || '').toLowerCase().includes('casting'))) ||
          (data.work_point_detail && data.work_point_detail.some(w => (w.work_type || '').toLowerCase().includes('casting')));
        const finalTab = isTata ? 'tata' : (isRot ? 'rotary' : (isCasting ? 'casting' : (targetTab || 'drilling')));
        setActiveTab(finalTab);

        if (isTata && tataDetails.length > 0) {
          const mappedTata = tataDetails.map(t => {
            const parsedSizes = parseHoleSizeString(t.hole_size);
            const primary = parsedSizes[0] || { hole_nos: '', hole_depth: '' };
            const extra = parsedSizes.slice(1);
            return {
              id: t.id,
              date: t.date || data.date || '',
              shift: t.shift || 'Day Shift',
              site_location: t.site_location || '',
              hole_type: t.hole_type || '',
              machine_id: t.machine_id != null ? Number(t.machine_id) : '',
              machine_no: t.machine_no || t.machine?.machine_name || '',
              open_reading: t.open_reading != null ? t.open_reading : '',
              closing_reading: t.closing_reading != null ? t.closing_reading : '',
              today_hours: t.today_hours != null ? parseFloat(t.today_hours) : 0,
              hole_nos: primary.hole_nos || '',
              hole_depth: primary.hole_depth || '',
              hole_size: t.hole_size || '',
              extra_sizes: extra,
              today_mtr: t.today_mtr != null ? t.today_mtr : '',
              total_mtr: t.total_mtr != null ? t.total_mtr : '',
              operator_id: t.operator_id != null ? Number(t.operator_id) : '',
              operator_name: t.operator_name || t.operator?.name || '',
              helper_id: t.helper_id != null ? Number(t.helper_id) : '',
              helper_name: t.helper_name || t.helper?.name || '',
              today_diesel_used: t.today_diesel_used != null ? t.today_diesel_used : '',
              total_diesel_taken: t.total_diesel_taken != null ? t.total_diesel_taken : '',
              today_holes: t.today_holes != null ? t.today_holes : '',
              total_holes: t.total_holes != null ? t.total_holes : '',
            };
          });

          setTabData(prev => ({
            ...prev,
            tata: mappedTata,
          }));
        } else if (finalTab === 'tata') {
          setTabData(prev => ({
            ...prev,
            tata: [createInitialTataRow(data.date || '', data.project?.project_name || '')],
          }));
        } else if (isRot && rotDetails.length > 0) {
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
  } else if (finalTab === 'casting' || finalTab === 'drilling') {
          const mapWorkDetails = (data.work_points || data.work_point_detail || []).map(w => ({
            operator_id: w.operator_id != null ? Number(w.operator_id) : '',
            workType: w.work_type || '',
            drilling_type: w.drilling_type || '',
            uom: w.uom || '',
            workPoints: w.work_point != null ? w.work_point : '',
            rate: w.rate != null ? w.rate : '',
            total: w.total != null ? Number(w.total) : (Number(w.work_point || 0) * Number(w.rate || 0)),
            diesel: w.diesel ?? '',
            hrs: w.hrs ?? '',
          }));

          const mapSurveys = (data.surveys || data.survey_detail || []).map(s => ({
            operator_id: s.operator_id != null ? Number(s.operator_id) : '',
            survey_type: s.survey_type || '',
            uom: s.uom || '',
            survey_point: s.survey_point != null ? s.survey_point : '',
            rate: s.rate != null ? s.rate : '',
            total: s.total != null ? Number(s.total) : (Number(s.survey_point || 0) * Number(s.rate || 0)),
            diesel: s.diesel ?? '',
            hrs: s.hrs ?? '',
          }));

          const mapMaterials = (data.uses_raw_material || data.raw_material_usage || data.raw_materials || []).map(r => ({
            material_id: r.material_id || null,
            material_type: r.material?.name || r.material_type || r.material_name || '',
            available_qty: parseFloat(r.available_qty) || 0,
            received_qty: r.received_qty != null ? r.received_qty : '',
            qty_used: r.used_qty != null ? r.used_qty : (r.qty_used != null ? r.qty_used : ''),
            balance_qty: parseFloat(r.balance_qty) || 0,
            unit: r.material?.unit || r.unit || 'Ton',
          }));

          const mapMachineReading = (data.machine_reading || data.machine_readings || []).map(m => ({
            oprator_id: m.oprator_id != null ? Number(m.oprator_id) : '',
            machine_id: m.machine_id != null ? Number(m.machine_id) : '',
            machine_start: m.machine_start ?? '',
            machine_end: m.machine_end ?? '',
            actual_machine_hr: m.actual_machine_hr != null ? Number(m.actual_machine_hr) : 0,
            diesel_filled: m.diesel_filled ?? '',
            diesel_used: m.diesel_used ?? '',
            diesel_balance: m.diesel_balance ?? 0,
            diesel_avg: m.diesel_avg ?? 0,
          }));

          const mapCompressorReading = (data.compressor_rpm || []).map(c => ({
            oprator_id: c.oprator_id != null ? Number(c.oprator_id) : '',
            machine_id: c.machine_id != null ? Number(c.machine_id) : '',
            comp_rpm_start: c.comp_rpm_start ?? '',
            comp_rpm_end: c.comp_rpm_end ?? '',
            com_actul_hr: c.com_actul_hr != null ? Number(c.com_actul_hr) : 0,
            diesel_filled: c.diesel_filled ?? '',
            diesel_used: c.diesel_used ?? '',
            diesel_balance: c.diesel_balance ?? 0,
            diesel_avg: c.diesel_avg ?? 0,
          }));

          const sectionData = {
            start_time: data.start_time || '',
            end_time: data.end_time || '',
            break_time: data.break_time || '',
            net_hours: data.net_hours != null ? Number(data.net_hours) : 0,
            casting_team_name: data.casting_team_name || '',
            casting_team_no: data.casting_team_no || '',
            helper_id: data.helper_id != null ? Number(data.helper_id) : '',
            machineReading: mapMachineReading.length > 0 ? mapMachineReading : createInitialSectionState().machineReading,
            compressorReading: mapCompressorReading.length > 0 ? mapCompressorReading : createInitialSectionState().compressorReading,
            workDetails: mapWorkDetails.length > 0 ? mapWorkDetails : createInitialSectionState().workDetails,
            surveys: mapSurveys.length > 0 ? mapSurveys : createInitialSectionState().surveys,
            rawMaterials: mapMaterials.length > 0 ? mapMaterials : createInitialSectionState().rawMaterials,
            totalBill: data.totalBill != null ? Number(data.totalBill) : 0,
        }

          setTabData(prev => ({
            ...prev,
            [finalTab]: sectionData,
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
   * Calculates diesel filled, used, balance and avg across ALL readings
   * in both Machine Usage and Compressor Usage.
   * If the same machinery is used in Machine Usage and Compressor Usage,
   * its total filled and used diesel are combined so that the diesel balance
   * matches properly across all sections.
   */
  const recalculateAllReadings = (tabs, machineriesList) => {
    if (!tabs) return tabs;

    // Collect all rows across all sections to calculate unified totals per machine
    const allRows = [
      ...(tabs.drilling?.machineReading || []),
      ...(tabs.drilling?.compressorReading || []),
      ...(tabs.casting?.machineReading || []),
      ...(tabs.casting?.compressorReading || []),
    ];

    const totalsPerMachine = {};
    allRows.forEach(row => {
      const mId = row.machine_id ? String(row.machine_id) : '';
      if (!mId) return;
      if (!totalsPerMachine[mId]) {
        const found = (machineriesList || []).find(m => String(m.value) === mId);
        totalsPerMachine[mId] = {
          baseBalance: found ? (parseFloat(found.diesel_balance) || 0) : 0,
          totalFilled: 0,
          totalUsed: 0,
        };
      }
      totalsPerMachine[mId].totalFilled += parseFloat(row.diesel_filled) || 0;
      totalsPerMachine[mId].totalUsed += parseFloat(row.diesel_used) || 0;
    });

    const processRow = (row, hrField) => {
      const mId = row.machine_id ? String(row.machine_id) : '';
      const used = parseFloat(row.diesel_used) || 0;
      const hrs = parseFloat(row[hrField]) || 0;

      // Formula: used diesel / Machine HR
      const avg = (hrs > 0 && used > 0) ? parseFloat((used / hrs).toFixed(2)) : 0;

      let bal = 0;
      if (mId) {
        if (totalsPerMachine[mId]) {
          const { baseBalance, totalFilled, totalUsed } = totalsPerMachine[mId];
          bal = parseFloat((baseBalance + totalFilled - totalUsed).toFixed(2));
        } else {
          const found = (machineriesList || []).find(m => String(m.value) === mId);
          bal = found ? (parseFloat(found.diesel_balance) || 0) : 0;
        }
      }

      return {
        ...row,
        diesel_balance: bal,
        diesel_avg: avg,
      };
    };

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

  // Calculate available diesel for a machine excluding current row's diesel_used
  const getAvailableDiesel = (machineId, excludeIndex, excludeSection, tabs) => {
    if (!machineId) return 0;
    const mId = String(machineId);
    const found = machineries.find(m => String(m.value) === mId);
    const baseBalance = found ? (parseFloat(found.diesel_balance) || 0) : 0;

    let totalFilled = 0;
    let otherUsed = 0;

    const allTabs = ['drilling', 'casting'];
    allTabs.forEach(tabKey => {
      const tab = tabs[tabKey];
      if (!tab) return;

      (tab.machineReading || []).forEach((r, idx) => {
        if (String(r.machine_id) === mId) {
          totalFilled += parseFloat(r.diesel_filled) || 0;
          if (!(tabKey === activeTab && excludeSection === 'machine' && idx === excludeIndex)) {
            otherUsed += parseFloat(r.diesel_used) || 0;
          }
        }
      });

      (tab.compressorReading || []).forEach((r, idx) => {
        if (String(r.machine_id) === mId) {
          totalFilled += parseFloat(r.diesel_filled) || 0;
          if (!(tabKey === activeTab && excludeSection === 'compressor' && idx === excludeIndex)) {
            otherUsed += parseFloat(r.diesel_used) || 0;
          }
        }
      });
    });

    return Math.max(0, parseFloat((baseBalance + totalFilled - otherUsed).toFixed(2)));
  };

  // Calculate minimum filled diesel needed so balance never becomes negative
  const getMinRequiredFilled = (machineId, excludeIndex, excludeSection, tabs) => {
    if (!machineId) return 0;
    const mId = String(machineId);
    const found = machineries.find(m => String(m.value) === mId);
    const baseBalance = found ? (parseFloat(found.diesel_balance) || 0) : 0;

    let totalUsed = 0;
    let otherFilled = 0;

    const allTabs = ['drilling', 'casting'];
    allTabs.forEach(tabKey => {
      const tab = tabs[tabKey];
      if (!tab) return;

      (tab.machineReading || []).forEach((r, idx) => {
        if (String(r.machine_id) === mId) {
          totalUsed += parseFloat(r.diesel_used) || 0;
          if (!(tabKey === activeTab && excludeSection === 'machine' && idx === excludeIndex)) {
            otherFilled += parseFloat(r.diesel_filled) || 0;
          }
        }
      });

      (tab.compressorReading || []).forEach((r, idx) => {
        if (String(r.machine_id) === mId) {
          totalUsed += parseFloat(r.diesel_used) || 0;
          if (!(tabKey === activeTab && excludeSection === 'compressor' && idx === excludeIndex)) {
            otherFilled += parseFloat(r.diesel_filled) || 0;
          }
        }
      });
    });

    return Math.max(0, parseFloat((totalUsed - baseBalance - otherFilled).toFixed(2)));
  };

  // Handle Machine Reading Changes
  const handleMachineReadingChange = (index, field, value) => {
    setTabData(prev => {
      const currentTab = prev[activeTab];
      const targetRow = currentTab.machineReading[index];
      const mId = targetRow?.machine_id ? String(targetRow.machine_id) : '';
      const mObj = machineries.find(m => String(m.value) === mId);
      const mName = mObj?.label || 'Selected Machine';

      let finalValue = value;

      if (field === 'diesel_used' && mId && value !== '') {
        const numUsed = parseFloat(value);
        if (!isNaN(numUsed)) {
          const maxAvailable = getAvailableDiesel(mId, index, 'machine', prev);
          if (numUsed > maxAvailable) {
            showToast("danger", `Diesel balance cannot be negative! Maximum available diesel for "${mName}" is ${maxAvailable} L.`);
            finalValue = maxAvailable > 0 ? String(maxAvailable) : '';
          }
        }
      } else if (field === 'diesel_filled' && mId && value !== '') {
        const numFilled = parseFloat(value);
        if (!isNaN(numFilled)) {
          const minRequired = getMinRequiredFilled(mId, index, 'machine', prev);
          if (numFilled < minRequired) {
            showToast("danger", `Cannot reduce diesel filled below ${minRequired} L because diesel is already used. Diesel balance cannot be negative.`);
            finalValue = String(minRequired);
          }
        }
      }

      const updatedMR = currentTab.machineReading.map((r, i) => {
        if (i !== index) return r;
        const next = { ...r, [field]: finalValue };
        if (field === 'machine_start' || field === 'machine_end') {
          next.actual_machine_hr = calculateMachineHours(next.machine_start, next.machine_end);
        }
        if (field === 'machine_id' && next.diesel_used && next.machine_id) {
          const newMId = String(next.machine_id);
          const newMObj = machineries.find(m => String(m.value) === newMId);
          const maxAvail = getAvailableDiesel(newMId, index, 'machine', prev);
          if (parseFloat(next.diesel_used) > maxAvail) {
            showToast("danger", `Diesel balance cannot be negative! "${newMObj?.label || 'Machine'}" only has ${maxAvail} L available. Diesel used adjusted.`);
            next.diesel_used = maxAvail > 0 ? String(maxAvail) : '';
          }
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
      const targetRow = currentTab.compressorReading[index];
      const mId = targetRow?.machine_id ? String(targetRow.machine_id) : '';
      const mObj = machineries.find(m => String(m.value) === mId);
      const mName = mObj?.label || 'Selected Machine';

      let finalValue = value;

      if (field === 'diesel_used' && mId && value !== '') {
        const numUsed = parseFloat(value);
        if (!isNaN(numUsed)) {
          const maxAvailable = getAvailableDiesel(mId, index, 'compressor', prev);
          if (numUsed > maxAvailable) {
            showToast("danger", `Diesel balance cannot be negative! Maximum available diesel for "${mName}" is ${maxAvailable} L.`);
            finalValue = maxAvailable > 0 ? String(maxAvailable) : '';
          }
        }
      } else if (field === 'diesel_filled' && mId && value !== '') {
        const numFilled = parseFloat(value);
        if (!isNaN(numFilled)) {
          const minRequired = getMinRequiredFilled(mId, index, 'compressor', prev);
          if (numFilled < minRequired) {
            showToast("danger", `Cannot reduce diesel filled below ${minRequired} L because diesel is already used. Diesel balance cannot be negative.`);
            finalValue = String(minRequired);
          }
        }
      }

      const updatedCR = currentTab.compressorReading.map((r, i) => {
        if (i !== index) return r;
        const next = { ...r, [field]: finalValue };
        if (field === 'comp_rpm_start' || field === 'comp_rpm_end') {
          next.com_actul_hr = calculateMachineHours(next.comp_rpm_start, next.comp_rpm_end);
        }
        if (field === 'machine_id' && next.diesel_used && next.machine_id) {
          const newMId = String(next.machine_id);
          const newMObj = machineries.find(m => String(m.value) === newMId);
          const maxAvail = getAvailableDiesel(newMId, index, 'compressor', prev);
          if (parseFloat(next.diesel_used) > maxAvail) {
            showToast("danger", `Diesel balance cannot be negative! "${newMObj?.label || 'Machine'}" only has ${maxAvail} L available. Diesel used adjusted.`);
            next.diesel_used = maxAvail > 0 ? String(maxAvail) : '';
          }
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

  // TATA Row Handlers
  const handleTataChange = (index, field, value) => {
    const positiveOnlyFields = [
      'today_mtr', 'total_mtr', 'today_diesel_used', 'total_diesel_taken', 'today_holes', 'total_holes'
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
      const rows = [...(prev.tata || [createInitialTataRow()])];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, tata: rows };
    });
  };

  const handleTataNumberChange = (index, field, value) => {
    if (value !== '' && value != null) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        value = Math.max(0, num);
      }
    }
    setTabData(prev => {
      const rows = [...(prev.tata || [createInitialTataRow()])];
      const updated = { ...rows[index], [field]: value };

      if (field === 'open_reading' || field === 'closing_reading') {
        const open = Math.max(0, parseFloat(field === 'open_reading' ? value : updated.open_reading) || 0);
        const close = Math.max(0, parseFloat(field === 'closing_reading' ? value : updated.closing_reading) || 0);
        if (close >= open) {
          updated.today_hours = parseFloat((close - open).toFixed(2));
        } else {
          updated.today_hours = 0;
        }
      }

      rows[index] = updated;
      return { ...prev, tata: rows };
    });
  };

  const handleTataHoleSizeChange = (index, field, value) => {
    if (value !== '' && value != null) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        value = Math.max(0, num);
      }
    }
    setTabData(prev => {
      const rows = [...(prev.tata || [createInitialTataRow()])];
      const row = { ...rows[index], [field]: value };

      const nos = row.hole_nos !== '' && row.hole_nos != null ? parseFloat(row.hole_nos) : null;
      const depth = row.hole_depth !== '' && row.hole_depth != null ? parseFloat(row.hole_depth) : null;

      let totalMtr = 0;
      let totalHoles = 0;
      let parts = [];

      if (nos != null && nos > 0) {
        totalHoles += nos;
        if (depth != null && depth > 0) {
          totalMtr += nos * depth;
          parts.push(`${nos}X${depth}`);
        } else {
          parts.push(`${nos}`);
        }
      }

      if (Array.isArray(row.extra_sizes)) {
        row.extra_sizes.forEach(ex => {
          const en = ex.hole_nos !== '' && ex.hole_nos != null ? parseFloat(ex.hole_nos) : null;
          const ed = ex.hole_depth !== '' && ex.hole_depth != null ? parseFloat(ex.hole_depth) : null;
          if (en != null && en > 0) {
            totalHoles += en;
            if (ed != null && ed > 0) {
              totalMtr += en * ed;
              parts.push(`${en}X${ed}`);
            } else {
              parts.push(`${en}`);
            }
          }
        });
      }

      if (totalMtr > 0) {
        row.today_mtr = parseFloat(totalMtr.toFixed(2));
      } else if (nos == null && depth == null) {
        row.today_mtr = '';
      }

      if (totalHoles > 0) {
        row.today_holes = totalHoles;
      } else if (nos == null) {
        row.today_holes = '';
      }

      row.hole_size = parts.join(' | ');

      rows[index] = row;
      return { ...prev, tata: rows };
    });
  };

  const addTataExtraSize = (rowIndex) => {
    setTabData(prev => {
      const rows = [...(prev.tata || [createInitialTataRow()])];
      const row = { ...rows[rowIndex] };
      const extra_sizes = Array.isArray(row.extra_sizes) ? [...row.extra_sizes] : [];
      extra_sizes.push({ hole_nos: '', hole_depth: '' });
      row.extra_sizes = extra_sizes;
      rows[rowIndex] = row;
      return { ...prev, tata: rows };
    });
  };

  const removeTataExtraSize = (rowIndex, extraIndex) => {
    setTabData(prev => {
      const rows = [...(prev.tata || [createInitialTataRow()])];
      const row = { ...rows[rowIndex] };
      const extra_sizes = (row.extra_sizes || []).filter((_, idx) => idx !== extraIndex);
      row.extra_sizes = extra_sizes;

      const nos = row.hole_nos !== '' && row.hole_nos != null ? parseFloat(row.hole_nos) : null;
      const depth = row.hole_depth !== '' && row.hole_depth != null ? parseFloat(row.hole_depth) : null;
      let totalMtr = 0;
      let totalHoles = 0;
      let parts = [];
      if (nos != null && nos > 0) {
        totalHoles += nos;
        if (depth != null && depth > 0) {
          totalMtr += nos * depth;
          parts.push(`${nos}X${depth}`);
        } else {
          parts.push(`${nos}`);
        }
      }
      extra_sizes.forEach(ex => {
        const en = ex.hole_nos !== '' && ex.hole_nos != null ? parseFloat(ex.hole_nos) : null;
        const ed = ex.hole_depth !== '' && ex.hole_depth != null ? parseFloat(ex.hole_depth) : null;
        if (en != null && en > 0) {
          totalHoles += en;
          if (ed != null && ed > 0) {
            totalMtr += en * ed;
            parts.push(`${en}X${ed}`);
          }
        }
      });
      row.today_mtr = totalMtr > 0 ? parseFloat(totalMtr.toFixed(2)) : (row.today_mtr || '');
      row.today_holes = totalHoles > 0 ? totalHoles : (row.today_holes || '');
      row.hole_size = parts.join(' | ');

      rows[rowIndex] = row;
      return { ...prev, tata: rows };
    });
  };

  const handleTataExtraSizeChange = (rowIndex, extraIndex, field, value) => {
    if (value !== '' && value != null) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        value = Math.max(0, num);
      }
    }
    setTabData(prev => {
      const rows = [...(prev.tata || [createInitialTataRow()])];
      const row = { ...rows[rowIndex] };
      const extra_sizes = Array.isArray(row.extra_sizes) ? [...row.extra_sizes] : [];
      extra_sizes[extraIndex] = { ...extra_sizes[extraIndex], [field]: value };
      row.extra_sizes = extra_sizes;

      const nos = row.hole_nos !== '' && row.hole_nos != null ? parseFloat(row.hole_nos) : null;
      const depth = row.hole_depth !== '' && row.hole_depth != null ? parseFloat(row.hole_depth) : null;
      let totalMtr = 0;
      let totalHoles = 0;
      let parts = [];
      if (nos != null && nos > 0) {
        totalHoles += nos;
        if (depth != null && depth > 0) {
          totalMtr += nos * depth;
          parts.push(`${nos}X${depth}`);
        } else {
          parts.push(`${nos}`);
        }
      }
      extra_sizes.forEach(ex => {
        const en = ex.hole_nos !== '' && ex.hole_nos != null ? parseFloat(ex.hole_nos) : null;
        const ed = ex.hole_depth !== '' && ex.hole_depth != null ? parseFloat(ex.hole_depth) : null;
        if (en != null && en > 0) {
          totalHoles += en;
          if (ed != null && ed > 0) {
            totalMtr += en * ed;
            parts.push(`${en}X${ed}`);
          } else {
            parts.push(`${en}`);
          }
        }
      });
      if (totalMtr > 0) {
        row.today_mtr = parseFloat(totalMtr.toFixed(2));
      }
      if (totalHoles > 0) {
        row.today_holes = totalHoles;
      }
      row.hole_size = parts.join(' | ');

      rows[rowIndex] = row;
      return { ...prev, tata: rows };
    });
  };

  const addTataRow = () => {
    setTabData(prev => ({
      ...prev,
      tata: [
        ...(prev.tata || []),
        createInitialTataRow(
          projectInfo.date || '',
          projectInfo.project_name || ''
        )
      ]
    }));
  };

  const removeTataRow = (index) => {
    setTabData(prev => {
      const rows = [...(prev.tata || [])];
      if (rows.length > 1) {
        rows.splice(index, 1);
        return { ...prev, tata: rows };
      }
      return prev;
    });
  };

  const tataTotals = useMemo(() => {
    const rows = tabData.tata || [];
    let totalHours = 0;
    let totalMtr = 0;
    let totalHoles = 0;
    let totalDieselUsed = 0;
    let totalDieselTaken = 0;
    let latestTotalMtr = 0;
    let latestTotalHoles = 0;

    rows.forEach(r => {
      totalHours += parseFloat(r.today_hours) || 0;
      totalMtr += parseFloat(r.today_mtr) || 0;
      totalHoles += parseFloat(r.today_holes) || 0;
      totalDieselUsed += parseFloat(r.today_diesel_used) || 0;
      totalDieselTaken += parseFloat(r.total_diesel_taken) || 0;
      if (r.total_mtr !== '' && r.total_mtr != null) latestTotalMtr = parseFloat(r.total_mtr) || 0;
      if (r.total_holes !== '' && r.total_holes != null) latestTotalHoles = parseFloat(r.total_holes) || 0;
    });

    return {
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalMtr: parseFloat(totalMtr.toFixed(2)),
      totalHoles: parseFloat(totalHoles.toFixed(2)),
      totalDieselUsed: parseFloat(totalDieselUsed.toFixed(2)),
      totalDieselTaken: parseFloat(totalDieselTaken.toFixed(2)),
      latestTotalMtr,
      latestTotalHoles,
    };
  }, [tabData.tata]);

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

    if (tabKey === 'tata') {
      const rows = tabData.tata || [];
      if (rows.length === 0) {
        showToast("danger", "Please add at least one TATA Work row.");
        return false;
      }

      const validRows = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const hasSome = r.machine_id || r.operator_id || r.site_location || r.hole_type || r.open_reading || r.closing_reading || r.today_mtr || r.today_diesel_used || r.today_holes;
        if (!hasSome && rows.length > 1) {
          continue;
        }
        if (!r.operator_id && !r.operator_name) {
          showToast("danger", `TATA Work Row ${i + 1}: Please select an Operator.`);
          return false;
        }

        const checkFields = [
          { key: 'open_reading', label: 'Open Reading' },
          { key: 'closing_reading', label: 'Closing Reading' },
          { key: 'today_mtr', label: 'Today Mtr' },
          { key: 'total_mtr', label: 'Total Mtr' },
          { key: 'today_diesel_used', label: 'Today Diesel Used' },
          { key: 'total_diesel_taken', label: 'Total Diesel Taken' },
          { key: 'today_holes', label: 'Today Holes' },
          { key: 'total_holes', label: 'Total Holes' },
        ];

        for (const cf of checkFields) {
          const val = r[cf.key];
          if (val !== '' && val != null && parseFloat(val) < 0) {
            showToast("danger", `TATA Work Row ${i + 1}: ${cf.label} cannot be negative. Only positive values are allowed.`);
            return false;
          }
        }

        const openReading = r.open_reading !== '' && r.open_reading != null ? Math.max(0, parseFloat(r.open_reading)) : null;
        const closingReading = r.closing_reading !== '' && r.closing_reading != null ? Math.max(0, parseFloat(r.closing_reading)) : null;
        const totHr = (openReading != null && closingReading != null && closingReading >= openReading)
          ? parseFloat((closingReading - openReading).toFixed(2))
          : (r.today_hours !== '' && r.today_hours != null ? Math.max(0, parseFloat(r.today_hours)) : null);

        let holeSizeStr = r.hole_size || '';
        if (!holeSizeStr && r.hole_nos && r.hole_depth) {
          holeSizeStr = `${r.hole_nos}X${r.hole_depth}`;
        }
        let calcTodayMtr = r.today_mtr !== '' && r.today_mtr != null ? Math.max(0, parseFloat(r.today_mtr)) : null;
        if (calcTodayMtr == null && r.hole_nos && r.hole_depth) {
          calcTodayMtr = parseFloat((parseFloat(r.hole_nos) * parseFloat(r.hole_depth)).toFixed(2));
        }
        let calcTodayHoles = r.today_holes !== '' && r.today_holes != null ? Math.max(0, parseFloat(r.today_holes)) : null;
        if (calcTodayHoles == null && r.hole_nos) {
          calcTodayHoles = parseFloat(r.hole_nos);
        }

        validRows.push({
          date: r.date || projectInfo.date,
          shift: r.shift || 'Day Shift',
          site_location: r.site_location || projectInfo.project_name || '',
          hole_type: r.hole_type || '',
          machine_id: r.machine_id || null,
          machine_no: r.machine_no || (machineries.find(m => String(m.value) === String(r.machine_id))?.label || ''),
          open_reading: openReading,
          closing_reading: closingReading,
          today_hours: totHr,
          hole_size: holeSizeStr,
          today_mtr: calcTodayMtr,
          total_mtr: r.total_mtr !== '' && r.total_mtr != null ? Math.max(0, parseFloat(r.total_mtr)) : null,
          operator_id: r.operator_id || null,
          operator_name: r.operator_name || (operators.find(o => String(o.value) === String(r.operator_id))?.label || ''),
          helper_id: r.helper_id || null,
          helper_name: r.helper_name || (helpers.find(h => String(h.value) === String(r.helper_id))?.label || ''),
          today_diesel_used: r.today_diesel_used !== '' && r.today_diesel_used != null ? Math.max(0, parseFloat(r.today_diesel_used)) : null,
          total_diesel_taken: r.total_diesel_taken !== '' && r.total_diesel_taken != null ? Math.max(0, parseFloat(r.total_diesel_taken)) : null,
          today_holes: calcTodayHoles,
          total_holes: r.total_holes !== '' && r.total_holes != null ? Math.max(0, parseFloat(r.total_holes)) : null,
        });
      }

      if (validRows.length === 0) {
        showToast("danger", "Please fill in TATA Work details.");
        return false;
      }

      const payload = {
        project_id: projectInfo.project_id,
        supervisor_id: projectInfo.supervisor_id || null,
        date: projectInfo.date,
        tab_type: 'tata',
        tata_details: validRows,
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

    // Machine Reading Validation (Skipped for Casting tab)
    if (tabKey !== 'casting') {
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

    // Negative Balance Check (Skipped for Casting tab)
    if (tabKey !== 'casting') {
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
      helper_id: (tabKey === 'drilling' || tabKey === 'casting') ? (currentTab.helper_id || null) : null,
      casting_team_name: (tabKey === 'drilling' || tabKey === 'casting') ? (currentTab.casting_team_name || null) : null,
      casting_team_no: (tabKey === 'drilling' || tabKey === 'casting') ? (currentTab.casting_team_no || null) : null,
      work_points: validWorkPoints,
      surveys: validSurveys,
      machineReading: tabKey === 'casting' ? [] : validMachineReadings,
      compressor_rpm: tabKey === 'casting' ? [] : validCompressorReadings,
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
        const title = activeTab === 'drilling' ? 'Drilling' : activeTab === 'casting' ? 'Casting' : activeTab === 'rotary' ? 'Rotary' : 'TATA';
        setSuccessMessage(`${title} work log ${editId ? 'updated' : 'submitted'} successfully!`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        navigate('/infraDetailsShowTable');
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
    if (tabKey === 'tata') {
      const rows = tabData.tata || [];
      return rows.some(r => r.machine_id || r.operator_id || r.site_location || r.hole_type || r.open_reading || r.closing_reading || r.today_mtr || r.today_diesel_used || r.today_holes);
    }
    if (tabKey === 'rotary') {
      const rows = tabData.rotary || [];
      return rows.some(r => r.machine_id || r.operator_id || r.group_no || r.pile_no || r.open_reading_hr || r.closing_reading_hr || r.soft_soil || r.hard_rock || r.diesel_lit);
    }
    const tab = tabData[tabKey];
    if (!tab) return false;
    const hasMR = tabKey !== 'casting' && tab.machineReading.some(r => r.machine_id || r.machine_start || r.machine_end || r.diesel_used || r.diesel_filled);
    const hasCR = tabKey !== 'casting' && tab.compressorReading.some(r => r.machine_id || r.comp_rpm_start || r.comp_rpm_end || r.diesel_used || r.diesel_filled);
    const hasWD = tab.workDetails.some(w => w.workType || w.workPoints || w.rate);
    const hasSD = tab.surveys.some(s => s.survey_type || s.survey_point || s.rate);
    const hasRM = tab.rawMaterials.some(m => m.material_type || m.qty_used);
    const hasCastingTeam = (tabKey === 'drilling' || tabKey === 'casting') && (tab.casting_team_name || tab.casting_team_no || tab.helper_id);
    return hasMR || hasCR || hasWD || hasSD || hasRM || hasCastingTeam;
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
                            label: selectedProjectDetails?.supervisor?.name || selectedProjectDetails?.supervisor_name || 'Selected Supervisor'
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

                  <CNavItem>
                    <CNavLink
                      active={activeTab === 'tata'}
                      onClick={() => setActiveTab('tata')}
                      style={{
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '15px',
                        padding: '9px 26px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        backgroundColor: activeTab === 'tata' ? '#0d9488' : undefined,
                        borderColor: activeTab === 'tata' ? '#0d9488' : undefined,
                        color: activeTab === 'tata' ? '#ffffff' : undefined,
                      }}
                      className={activeTab === 'tata' ? 'text-white shadow-sm' : 'text-secondary bg-white border'}
                    >
                      <CIcon icon={cilFile} className="me-2" />
                      TATA Work
                      {tabHasData('tata') && (
                        <span
                          className="ms-2 badge rounded-pill"
                          style={{
                            fontSize: '10px',
                            backgroundColor: activeTab === 'tata' ? '#ffffff' : '#0d9488',
                            color: activeTab === 'tata' ? '#0f766e' : '#ffffff',
                          }}
                        >
                          ●
                        </span>
                      )}
                    </CNavLink>
                  </CNavItem>
                </CNav>
              </div>

              {/* Tab Header Badge */}
              <div className="mb-3 d-flex align-items-center justify-content-between">
                <span
                  className="badge px-3 py-2 fs-6 text-uppercase"
                  style={{
                    letterSpacing: '0.5px',
                    backgroundColor: activeTab === 'tata' ? '#0f766e' : '#212529',
                    color: '#ffffff',
                  }}
                >
                  Current Section: {activeTab === 'drilling' ? 'Drilling Log' : activeTab === 'casting' ? 'Casting Log' : activeTab === 'rotary' ? 'Rotary Log' : 'TATA Work Log'}
                </span>
                <span className="text-muted small">
                  Diesel Avg formula: <strong>Diesel Used / Machine HR</strong>
                </span>
              </div>

              {(activeTab === 'drilling' || activeTab === 'casting') && (
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

              {/* Casting Team Section (Drilling & Casting Tabs) */}
              {(activeTab === 'drilling' || activeTab === 'casting') && (
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
              {activeTab !== 'casting' && (
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
                            className={`bg-light fw-bold ${parseFloat(reading.diesel_balance) < 0 ? 'text-danger' : 'text-success'}`}
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
              )}

              {/* Compressor RPM */}
              {activeTab !== 'casting' && (
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
                          className={`bg-light fw-bold ${parseFloat(rpmReading.diesel_balance) < 0 ? 'text-danger' : 'text-success'}`}
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
              )}

                            {/* Work Details Section */}
              <div
                className="mb-4 rounded-3 p-3 p-md-4 shadow-sm"
                style={{
                  backgroundColor: '#fffdf5',
                  border: '1.5px solid #fde68a',
                  borderLeft: '5px solid #f59e0b',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded me-2 shadow-sm"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#fef3c7',
                        color: '#d97706',
                        borderRadius: '8px',
                      }}
                    >
                      <CIcon icon={cilCalculator} size="sm" />
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold" style={{ color: '#b45309', fontSize: '18px' }}>
                        4. Work Details ({activeTab === 'drilling' ? 'Drilling' : 'Casting'})
                      </h5>
                      <span className="text-secondary small">
                        Define work points, rate per point, work hours, and diesel consumption
                      </span>
                    </div>
                  </div>
                  <CButton
                    style={{
                      backgroundColor: '#f59e0b',
                      borderColor: '#f59e0b',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '13px',
                    }}
                    className="d-flex align-items-center shadow-sm px-3 py-2"
                    onClick={addWorkDetail}
                  >
                    <CIcon icon={cilPlus} className="me-1" /> + Add Work Row
                  </CButton>
                </div>

                {/* List of Work Detail Items */}
                <div className="d-flex flex-column gap-3">
                  {currentTab.workDetails.map((work, index) => {
                    const lineTotal = Number(work.total || 0);
                    return (
                      <div
                        key={index}
                        className="rounded-3 p-3 bg-white"
                        style={{
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        }}
                      >
                        {/* Header of Item Row */}
                        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="badge fw-semibold"
                              style={{
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                fontSize: '12px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                              }}
                            >
                              #{index + 1} Work Detail
                            </span>
                            {work.workType && (
                              <span className="text-secondary small fw-semibold">
                                {work.workType} {work.drilling_type ? `• ${work.drilling_type}` : ''} {work.uom ? `(${work.uom})` : ''}
                              </span>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            <span className="fw-bold text-success" style={{ fontSize: '15px' }}>
                              Total: ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {currentTab.workDetails.length > 1 && (
                              <CButton
                                color="danger"
                                variant="ghost"
                                size="sm"
                                className="p-1 text-danger"
                                onClick={() => removeWorkDetail(index)}
                                title="Remove this row"
                                style={{ borderRadius: '6px' }}
                              >
                                <CIcon icon={cilTrash} size="sm" />
                              </CButton>
                            )}
                          </div>
                        </div>

                        {/* Row 1: Identification & Selects */}
                        <CRow className="g-3 mb-2">
                          <CCol xs={12} sm={6} md={activeTab === 'drilling' ? 3 : 4}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Operator <span className="text-danger">*</span>
                            </CFormLabel>
                            <Select
                              options={operators}
                              isSearchable
                              placeholder="Select Operator..."
                              value={operators.find((op) => op.value === work.operator_id) || null}
                              onChange={(selected) =>
                                handleWorkDetailChange(index, "operator_id", selected ? selected.value : "")
                              }
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  minHeight: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  borderColor: '#cbd5e1',
                                  fontSize: '13px',
                                }),
                              }}
                            />
                          </CCol>

                          <CCol xs={12} sm={6} md={activeTab === 'drilling' ? 3 : 4}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Work Type <span className="text-danger">*</span>
                            </CFormLabel>
                            <CFormSelect
                              value={work.workType}
                              onChange={(e) => handleWorkDetailChange(index, "workType", e.target.value)}
                              style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#cbd5e1' }}
                            >
                              <option value="">Select Work Type</option>
                              {workTypes.map((type) => (
                                <option key={type.id} value={type.name}>
                                  {type.name}
                                </option>
                              ))}
                            </CFormSelect>
                          </CCol>

                          {activeTab === 'drilling' && (
                            <CCol xs={12} sm={6} md={3}>
                              <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                                Drilling Type (Optional)
                              </CFormLabel>
                              <CFormSelect
                                value={work.drilling_type || ""}
                                onChange={(e) => handleWorkDetailChange(index, "drilling_type", e.target.value)}
                                style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#cbd5e1' }}
                              >
                                <option value="">Select Drilling Type</option>
                                <option value="Hard">Hard</option>
                                <option value="Very Hard">Very Hard</option>
                                <option value="Medium">Medium</option>
                                <option value="Soft">Soft</option>
                              </CFormSelect>
                            </CCol>
                          )}

                          <CCol xs={12} sm={6} md={activeTab === 'drilling' ? 3 : 4}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              UOM
                            </CFormLabel>
                            <CFormSelect
                              value={work.uom}
                              onChange={(e) => handleWorkDetailChange(index, "uom", e.target.value)}
                              style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#cbd5e1' }}
                            >
                              <option value="">Select UOM</option>
                              {uoms.map((type) => (
                                <option key={type.id} value={type.name}>
                                  {type.name}
                                </option>
                              ))}
                            </CFormSelect>
                          </CCol>
                        </CRow>

                        {/* Row 2: Quantities, Rates & Metrics */}
                        <CRow className="g-3 align-items-end">
                          <CCol xs={6} sm={4} md={2}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Points / Qty
                            </CFormLabel>
                            <CFormInput
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={work.workPoints === 0 ? "" : work.workPoints}
                              placeholder="0"
                              style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#cbd5e1', textAlign: 'center' }}
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

                          <CCol xs={6} sm={4} md={2}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Rate (₹)
                            </CFormLabel>
                            <CInputGroup>
                              <CInputGroupText style={{ height: '40px', borderRadius: '8px 0 0 8px', fontSize: '13px', backgroundColor: '#f8fafc' }}>
                                ₹
                              </CInputGroupText>
                              <CFormInput
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={work.rate === 0 ? "" : work.rate}
                                placeholder="0"
                                style={{ height: '40px', borderRadius: '0 8px 8px 0', fontSize: '13px', borderColor: '#cbd5e1' }}
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

                          <CCol xs={6} sm={4} md={2}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Subtotal
                            </CFormLabel>
                            <CFormInput
                              value={`₹ ${lineTotal.toFixed(2)}`}
                              readOnly
                              className="bg-success-subtle text-success fw-bold text-center"
                              style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#86efac' }}
                            />
                          </CCol>

                          <CCol xs={6} sm={6} md={3}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Work Hours (Hrs)
                            </CFormLabel>
                            <CFormInput
                              type="number"
                              min="0"
                              step="any"
                              value={work.hrs}
                              placeholder="0.00"
                              style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#cbd5e1' }}
                              onChange={(e) => {
                                if (e.target.value >= 0) {
                                  handleWorkDetailChange(index, "hrs", e.target.value);
                                }
                              }}
                            />
                          </CCol>

                          <CCol xs={12} sm={6} md={3}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Diesel Consumed (L)
                            </CFormLabel>
                            <CFormInput
                              type="number"
                              min="0"
                              step="any"
                              value={work.diesel}
                              placeholder="0.00"
                              style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#cbd5e1' }}
                              onChange={(e) => {
                                if (e.target.value >= 0) {
                                  handleWorkDetailChange(index, "diesel", e.target.value);
                                }
                              }}
                            />
                          </CCol>
                        </CRow>
                      </div>
                    );
                  })}
                </div>

                {/* Work Details Summary Footer */}
                <div
                  className="mt-3 p-2 px-3 rounded-2 d-flex justify-content-between align-items-center flex-wrap gap-2"
                  style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}
                >
                  <span className="small fw-semibold text-dark">
                    Work Rows: <span className="text-primary">{currentTab.workDetails.length}</span> | Total Points: <span className="text-primary">{currentTab.workDetails.reduce((sum, w) => sum + (Number(w.workPoints) || 0), 0)}</span> | Total Hours: <span className="text-primary">{currentTab.workDetails.reduce((sum, w) => sum + (parseFloat(w.hrs) || 0), 0).toFixed(2)} hrs</span> | Total Diesel: <span className="text-primary">{currentTab.workDetails.reduce((sum, w) => sum + (parseFloat(w.diesel) || 0), 0).toFixed(2)} L</span>
                  </span>
                  <span className="fw-bold text-success" style={{ fontSize: '14px' }}>
                    Work Amount: ₹{currentTab.workDetails.reduce((sum, w) => sum + (Number(w.total) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Survey Details Section */}
              <div
                className="mb-4 rounded-3 p-3 p-md-4 shadow-sm"
                style={{
                  backgroundColor: '#f0fdfa',
                  border: '1.5px solid #99f6e4',
                  borderLeft: '5px solid #0d9488',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded me-2 shadow-sm"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#ccfbf1',
                        color: '#0f766e',
                        borderRadius: '8px',
                      }}
                    >
                      <CIcon icon={cilLocationPin} size="sm" />
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold" style={{ color: '#0f766e', fontSize: '18px' }}>
                        5. Survey Details ({activeTab === 'drilling' ? 'Drilling' : 'Casting'})
                      </h5>
                      <span className="text-secondary small">
                        Track land and progress survey activities, points, and survey team hours
                      </span>
                    </div>
                  </div>
                  <CButton
                    style={{
                      backgroundColor: '#0d9488',
                      borderColor: '#0d9488',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '13px',
                    }}
                    className="d-flex align-items-center shadow-sm px-3 py-2"
                    onClick={addSurvey}
                  >
                    <CIcon icon={cilPlus} className="me-1" /> + Add Survey Row
                  </CButton>
                </div>

                {/* List of Survey Items */}
                <div className="d-flex flex-column gap-3">
                  {currentTab.surveys.map((survey, index) => {
                    const lineTotal = Number(survey.total || 0);
                    return (
                      <div
                        key={index}
                        className="rounded-3 p-3 bg-white"
                        style={{
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        }}
                      >
                        {/* Header of Item Row */}
                        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="badge fw-semibold"
                              style={{
                                backgroundColor: '#ccfbf1',
                                color: '#0f766e',
                                fontSize: '12px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                              }}
                            >
                              #{index + 1} Survey Detail
                            </span>
                            {survey.survey_type && (
                              <span className="text-secondary small fw-semibold">
                                {survey.survey_type} {survey.uom ? `(${survey.uom})` : ''}
                              </span>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            <span className="fw-bold text-success" style={{ fontSize: '15px' }}>
                              Total: ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {currentTab.surveys.length > 1 && (
                              <CButton
                                color="danger"
                                variant="ghost"
                                size="sm"
                                className="p-1 text-danger"
                                onClick={() => removeSurvey(index)}
                                title="Remove this row"
                                style={{ borderRadius: '6px' }}
                              >
                                <CIcon icon={cilTrash} size="sm" />
                              </CButton>
                            )}
                          </div>
                        </div>

                        {/* Row 1: Identification */}
                        <CRow className="g-3 mb-2">
                          <CCol xs={12} sm={6} md={4}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Operator <span className="text-danger">*</span>
                            </CFormLabel>
                            <Select
                              options={operators}
                              isSearchable
                              placeholder="Select Operator..."
                              value={operators.find((op) => op.value === survey.operator_id) || null}
                              onChange={(selected) =>
                                handleSurveyChange(index, "operator_id", selected ? selected.value : "")
                              }
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  minHeight: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  borderColor: '#cbd5e1',
                                  fontSize: '13px',
                                }),
                              }}
                            />
                          </CCol>

                          <CCol xs={12} sm={6} md={4}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Survey Type <span className="text-danger">*</span>
                            </CFormLabel>
                            <CFormSelect
                              value={survey.survey_type}
                              onChange={(e) => handleSurveyChange(index, "survey_type", e.target.value)}
                              style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#cbd5e1' }}
                            >
                              <option value="">Select Survey Type</option>
                              {surveyTypes.map((type) => (
                                <option key={type.id} value={type.name}>
                                  {type.name}
                                </option>
                              ))}
                            </CFormSelect>
                          </CCol>

                          <CCol xs={12} sm={6} md={4}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              UOM
                            </CFormLabel>
                            <CFormSelect
                              value={survey.uom}
                              onChange={(e) => handleSurveyChange(index, "uom", e.target.value)}
                              style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#cbd5e1' }}
                            >
                              <option value="">Select UOM</option>
                              {uoms.map((type) => (
                                <option key={type.id} value={type.name}>
                                  {type.name}
                                </option>
                              ))}
                            </CFormSelect>
                          </CCol>
                        </CRow>

                        {/* Row 2: Metrics */}
                        <CRow className="g-3 align-items-end">
                          <CCol xs={6} sm={4} md={2}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Points
                            </CFormLabel>
                            <CFormInput
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={survey.survey_point === 0 ? "" : survey.survey_point}
                              placeholder="0"
                              style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#cbd5e1', textAlign: 'center' }}
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

                          <CCol xs={6} sm={4} md={2}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Rate (₹)
                            </CFormLabel>
                            <CInputGroup>
                              <CInputGroupText style={{ height: '40px', borderRadius: '8px 0 0 8px', fontSize: '13px', backgroundColor: '#f8fafc' }}>
                                ₹
                              </CInputGroupText>
                              <CFormInput
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={survey.rate === 0 ? "" : survey.rate}
                                placeholder="0"
                                style={{ height: '40px', borderRadius: '0 8px 8px 0', fontSize: '13px', borderColor: '#cbd5e1' }}
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

                          <CCol xs={6} sm={4} md={2}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Subtotal
                            </CFormLabel>
                            <CFormInput
                              value={`₹ ${lineTotal.toFixed(2)}`}
                              readOnly
                              className="bg-info-subtle text-info fw-bold text-center"
                              style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#7dd3fc' }}
                            />
                          </CCol>

                          <CCol xs={6} sm={6} md={3}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Hours (Hrs)
                            </CFormLabel>
                            <CFormInput
                              type="number"
                              min="0"
                              step="any"
                              value={survey.hrs}
                              placeholder="0.00"
                              style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#cbd5e1' }}
                              onChange={(e) => {
                                if (e.target.value >= 0) {
                                  handleSurveyChange(index, "hrs", e.target.value);
                                }
                              }}
                            />
                          </CCol>

                          <CCol xs={12} sm={6} md={3}>
                            <CFormLabel className="fw-semibold text-secondary mb-1" style={{ fontSize: '13px' }}>
                              Diesel Consumed (L)
                            </CFormLabel>
                            <CFormInput
                              type="number"
                              min="0"
                              step="any"
                              value={survey.diesel}
                              placeholder="0.00"
                              style={{ height: '40px', borderRadius: '8px', fontSize: '13px', borderColor: '#cbd5e1' }}
                              onChange={(e) => {
                                if (e.target.value >= 0) {
                                  handleSurveyChange(index, "diesel", e.target.value);
                                }
                              }}
                            />
                          </CCol>
                        </CRow>
                      </div>
                    );
                  })}
                </div>

                {/* Survey Details Summary Footer */}
                <div
                  className="mt-3 p-2 px-3 rounded-2 d-flex justify-content-between align-items-center flex-wrap gap-2"
                  style={{ backgroundColor: '#ccfbf1', border: '1px solid #99f6e4' }}
                >
                  <span className="small fw-semibold text-dark">
                    Survey Rows: <span className="text-teal">{currentTab.surveys.length}</span> | Total Points: <span className="text-teal">{currentTab.surveys.reduce((sum, s) => sum + (Number(s.survey_point) || 0), 0)}</span> | Total Hours: <span className="text-teal">{currentTab.surveys.reduce((sum, s) => sum + (parseFloat(s.hrs) || 0), 0).toFixed(2)} hrs</span> | Total Diesel: <span className="text-teal">{currentTab.surveys.reduce((sum, s) => sum + (parseFloat(s.diesel) || 0), 0).toFixed(2)} L</span>
                  </span>
                  <span className="fw-bold text-success" style={{ fontSize: '14px' }}>
                    Survey Amount: ₹{currentTab.surveys.reduce((sum, s) => sum + (Number(s.total) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

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

              {/* 3.3 TATA Work Tab Content */}
              {activeTab === 'tata' && (
                <div className="mb-4">
                  <div
                    className="p-3 p-md-4 rounded-3"
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Header Banner */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
                      <div>
                        <h5 className="fw-bold mb-1" style={{ color: '#0f766e', letterSpacing: '-0.3px' }}>
                          DESHMUKH INFRA SOLUTION LLP — DAILY DRILLING PROGRESS REPORT
                        </h5>
                        <div className="text-muted small">
                          Site: <strong>{projectInfo.project_name || 'All Sites'}</strong> | Shift Progress Log (TATA Work)
                        </div>
                      </div>
                      <CButton
                        style={{ borderColor: '#0d9488', color: '#0f766e', borderRadius: '6px' }}
                        variant="outline"
                        size="sm"
                        className="d-flex align-items-center fw-semibold px-3"
                        onClick={addTataRow}
                      >
                        <CIcon icon={cilSettings} className="me-1" /> + Add Another Row
                      </CButton>
                    </div>

                    {/* KPI Summary Cards */}
                    <CRow className="g-2 mb-3">
                      <CCol md={2} sm={4} xs={6}>
                        <div className="bg-white p-2 rounded-2 border text-center shadow-xs">
                          <div className="text-muted small text-uppercase" style={{ fontSize: '11px' }}>Shift Entries</div>
                          <div className="fs-5 fw-bold text-dark">{tabData.tata?.length || 0}</div>
                        </div>
                      </CCol>
                      <CCol md={2} sm={4} xs={6}>
                        <div className="bg-white p-2 rounded-2 border text-center shadow-xs">
                          <div className="text-muted small text-uppercase" style={{ fontSize: '11px' }}>Today Hours</div>
                          <div className="fs-5 fw-bold text-primary">{tataTotals.totalHours} hrs</div>
                        </div>
                      </CCol>
                      <CCol md={2} sm={4} xs={6}>
                        <div className="bg-white p-2 rounded-2 border text-center shadow-xs">
                          <div className="text-muted small text-uppercase" style={{ fontSize: '11px' }}>Today Meters</div>
                          <div className="fs-5 fw-bold text-success">{tataTotals.totalMtr} m</div>
                        </div>
                      </CCol>
                      <CCol md={2} sm={4} xs={6}>
                        <div className="bg-white p-2 rounded-2 border text-center shadow-xs">
                          <div className="text-muted small text-uppercase" style={{ fontSize: '11px' }}>Today Holes</div>
                          <div className="fs-5 fw-bold" style={{ color: '#7c3aed' }}>{tataTotals.totalHoles}</div>
                        </div>
                      </CCol>
                      <CCol md={2} sm={4} xs={6}>
                        <div className="bg-white p-2 rounded-2 border text-center shadow-xs">
                          <div className="text-muted small text-uppercase" style={{ fontSize: '11px' }}>Diesel Used</div>
                          <div className="fs-5 fw-bold text-danger">{tataTotals.totalDieselUsed} L</div>
                        </div>
                      </CCol>
                      <CCol md={2} sm={4} xs={6}>
                        <div className="bg-white p-2 rounded-2 border text-center shadow-xs">
                          <div className="text-muted small text-uppercase" style={{ fontSize: '11px' }}>Diesel Taken</div>
                          <div className="fs-5 fw-bold text-info">{tataTotals.totalDieselTaken} L</div>
                        </div>
                      </CCol>
                    </CRow>

                    {/* TATA Work Data Table */}
                    <div className="table-responsive bg-white rounded-3 border shadow-sm" style={{ maxHeight: '72vh' }}>
                      <table className="table table-bordered table-hover align-middle mb-0 text-center" style={{ fontSize: '13px' }}>
                        <thead className="table-light sticky-top shadow-sm" style={{ zIndex: 10 }}>
                          <tr style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>
                            <th style={{ width: '40px', backgroundColor: '#0f766e', color: '#fff' }}>S.No.</th>
                            <th style={{ minWidth: '130px', backgroundColor: '#0f766e', color: '#fff' }}>Date *</th>
                            <th style={{ minWidth: '120px', backgroundColor: '#0f766e', color: '#fff' }}>Shift</th>
                            <th style={{ minWidth: '180px', backgroundColor: '#0f766e', color: '#fff' }}>Site / Location</th>
                            <th style={{ minWidth: '140px', backgroundColor: '#0f766e', color: '#fff' }}>Hole Type</th>
                            <th style={{ minWidth: '160px', backgroundColor: '#0f766e', color: '#fff' }}>Machine No. *</th>
                            <th style={{ minWidth: '110px', backgroundColor: '#115e59', color: '#fff' }}>Open Reading (m)</th>
                            <th style={{ minWidth: '110px', backgroundColor: '#115e59', color: '#fff' }}>Closing Reading (m)</th>
                            <th style={{ minWidth: '110px', backgroundColor: '#115e59', color: '#fff' }}>Today Hours (hrs)</th>
                            <th style={{ minWidth: '190px', backgroundColor: '#0f766e', color: '#fff' }}>Hole size (Nos × Depth m)</th>
                            <th style={{ minWidth: '100px', backgroundColor: '#0f766e', color: '#fff' }}>Today Mtr (m)</th>
                            <th style={{ minWidth: '110px', backgroundColor: '#0f766e', color: '#fff' }}>Total Mtr (Cum.)</th>
                            <th style={{ minWidth: '170px', backgroundColor: '#0f766e', color: '#fff' }}>Operator Name *</th>
                            <th style={{ minWidth: '170px', backgroundColor: '#0f766e', color: '#fff' }}>Helper Name</th>
                            <th style={{ minWidth: '120px', backgroundColor: '#115e59', color: '#fff' }}>Today Diesel Used (ltr)</th>
                            <th style={{ minWidth: '120px', backgroundColor: '#115e59', color: '#fff' }}>Total Diesel Taken (Cum.)</th>
                            <th style={{ minWidth: '100px', backgroundColor: '#0f766e', color: '#fff' }}>Today Holes</th>
                            <th style={{ minWidth: '110px', backgroundColor: '#0f766e', color: '#fff' }}>Total Holes (Cum.)</th>
                            <th style={{ width: '45px', backgroundColor: '#0f766e', color: '#fff' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(tabData.tata || []).map((row, index) => (
                            <tr key={index}>
                              <td className="fw-bold text-secondary">{index + 1}</td>
                              <td>
                                <CFormInput
                                  type="date"
                                  value={row.date || projectInfo.date || ''}
                                  onChange={(e) => handleTataChange(index, 'date', e.target.value)}
                                  style={{ minWidth: '125px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormSelect
                                  value={row.shift || 'Day Shift'}
                                  onChange={(e) => handleTataChange(index, 'shift', e.target.value)}
                                  style={{ minWidth: '115px', height: '36px', fontSize: '13px' }}
                                >
                                  <option value="Day Shift">Day Shift</option>
                                  <option value="Night Shift">Night Shift</option>
                                  <option value="Day & Night">Day & Night</option>
                                </CFormSelect>
                              </td>
                              <td>
                                <CFormInput
                                  type="text"
                                  value={row.site_location || ''}
                                  onChange={(e) => handleTataChange(index, 'site_location', e.target.value)}
                                  placeholder="Location / Area..."
                                  style={{ minWidth: '160px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="text"
                                  value={row.hole_type || ''}
                                  onChange={(e) => handleTataChange(index, 'hole_type', e.target.value)}
                                  placeholder="e.g. 90”degree hole"
                                  style={{ minWidth: '130px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <div style={{ minWidth: '150px', textAlign: 'left' }}>
                                  <Select
                                    options={machineries}
                                    value={machineries.find(m => String(m.value) === String(row.machine_id)) || (row.machine_no ? { value: row.machine_id, label: row.machine_no } : null)}
                                    onChange={(opt) => {
                                      handleTataChange(index, 'machine_id', opt ? opt.value : '');
                                      handleTataChange(index, 'machine_no', opt ? opt.label : '');
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
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.open_reading ?? ''}
                                  onChange={(e) => handleTataNumberChange(index, 'open_reading', e.target.value)}
                                  placeholder="0.0"
                                  style={{ minWidth: '95px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.closing_reading ?? ''}
                                  onChange={(e) => handleTataNumberChange(index, 'closing_reading', e.target.value)}
                                  placeholder="0.0"
                                  style={{ minWidth: '95px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td className="bg-primary-subtle">
                                <div className="fw-bold text-primary" style={{ fontSize: '14px' }}>
                                  {row.today_hours != null && row.today_hours !== '' ? row.today_hours : 0}
                                </div>
                              </td>

                              <td>
                                <div className="d-flex flex-column gap-1" style={{ minWidth: '185px' }}>
                                  <div className="d-flex align-items-center gap-1 justify-content-center">
                                    <CFormInput
                                      type="number"
                                      step="any"
                                      min="0"
                                      onKeyDown={blockNegativeKey}
                                      value={row.hole_nos ?? ''}
                                      onChange={(e) => handleTataHoleSizeChange(index, 'hole_nos', e.target.value)}
                                      placeholder="Nos"
                                      title="Number of Holes (e.g. 5, 8, 4)"
                                      style={{ width: '68px', height: '34px', fontSize: '13px', textAlign: 'center', padding: '2px 4px' }}
                                    />
                                    <span className="fw-bold text-muted" style={{ fontSize: '14px', userSelect: 'none' }}>×</span>
                                    <CFormInput
                                      type="number"
                                      step="any"
                                      min="0"
                                      onKeyDown={blockNegativeKey}
                                      value={row.hole_depth ?? ''}
                                      onChange={(e) => handleTataHoleSizeChange(index, 'hole_depth', e.target.value)}
                                      placeholder="Depth m"
                                      title="Depth in meters (e.g. 8, 4.5)"
                                      style={{ width: '75px', height: '34px', fontSize: '13px', textAlign: 'center', padding: '2px 4px' }}
                                    />
                                    <CButton
                                      color="light"
                                      size="sm"
                                      variant="ghost"
                                      className="p-0 text-primary"
                                      title="Add another hole size (e.g. 10X5 | 6X4)"
                                      style={{ width: '24px', height: '24px', lineHeight: '22px', fontSize: '16px', fontWeight: 'bold' }}
                                      onClick={() => addTataExtraSize(index)}
                                    >
                                      +
                                    </CButton>
                                  </div>

                                  {/* Extra size pairs if any */}
                                  {(row.extra_sizes || []).map((ex, exIdx) => (
                                    <div key={exIdx} className="d-flex align-items-center gap-1 justify-content-center mt-1">
                                      <span className="text-muted fw-bold" style={{ fontSize: '11px' }}>+</span>
                                      <CFormInput
                                        type="number"
                                        step="any"
                                        min="0"
                                        onKeyDown={blockNegativeKey}
                                        value={ex.hole_nos ?? ''}
                                        onChange={(e) => handleTataExtraSizeChange(index, exIdx, 'hole_nos', e.target.value)}
                                        placeholder="Nos"
                                        style={{ width: '60px', height: '30px', fontSize: '12px', textAlign: 'center', padding: '2px 4px' }}
                                      />
                                      <span className="fw-bold text-muted" style={{ fontSize: '13px', userSelect: 'none' }}>×</span>
                                      <CFormInput
                                        type="number"
                                        step="any"
                                        min="0"
                                        onKeyDown={blockNegativeKey}
                                        value={ex.hole_depth ?? ''}
                                        onChange={(e) => handleTataExtraSizeChange(index, exIdx, 'hole_depth', e.target.value)}
                                        placeholder="Depth m"
                                        style={{ width: '65px', height: '30px', fontSize: '12px', textAlign: 'center', padding: '2px 4px' }}
                                      />
                                      <CButton
                                        color="light"
                                        size="sm"
                                        variant="ghost"
                                        className="p-0 text-danger"
                                        title="Remove this size"
                                        style={{ width: '20px', height: '20px', lineHeight: '18px', fontSize: '14px', fontWeight: 'bold' }}
                                        onClick={() => removeTataExtraSize(index, exIdx)}
                                      >
                                        ×
                                      </CButton>
                                    </div>
                                  ))}

                                  {row.hole_size && (
                                    <div className="text-muted" style={{ fontSize: '11px', textAlign: 'center' }}>
                                      Size: <span className="fw-semibold text-dark">{row.hole_size}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.today_mtr ?? ''}
                                  onChange={(e) => handleTataChange(index, 'today_mtr', e.target.value)}
                                  placeholder="0.0"
                                  style={{ minWidth: '95px', height: '36px', fontSize: '13px', fontWeight: 'bold', backgroundColor: '#f0fdf4' }}
                                  title="Calculated: Hole Nos × Depth"
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.total_mtr ?? ''}
                                  onChange={(e) => handleTataChange(index, 'total_mtr', e.target.value)}
                                  placeholder="0.0"
                                  style={{ minWidth: '95px', height: '36px', fontSize: '13px' }}
                                />
                              </td>

                              <td>
                                <div style={{ minWidth: '160px', textAlign: 'left' }}>
                                  <Select
                                    options={operators}
                                    value={operators.find(o => String(o.value) === String(row.operator_id)) || (row.operator_name ? { value: row.operator_id, label: row.operator_name } : null)}
                                    onChange={(opt) => {
                                      handleTataChange(index, 'operator_id', opt ? opt.value : '');
                                      handleTataChange(index, 'operator_name', opt ? opt.label : '');
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
                                <div style={{ minWidth: '160px', textAlign: 'left' }}>
                                  <Select
                                    options={helpers}
                                    value={helpers.find(h => String(h.value) === String(row.helper_id)) || (row.helper_name ? { value: row.helper_id, label: row.helper_name } : null)}
                                    onChange={(opt) => {
                                      handleTataChange(index, 'helper_id', opt ? opt.value : '');
                                      handleTataChange(index, 'helper_name', opt ? opt.label : '');
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
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.today_diesel_used ?? ''}
                                  onChange={(e) => handleTataChange(index, 'today_diesel_used', e.target.value)}
                                  placeholder="0"
                                  style={{ minWidth: '95px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.total_diesel_taken ?? ''}
                                  onChange={(e) => handleTataChange(index, 'total_diesel_taken', e.target.value)}
                                  placeholder="0"
                                  style={{ minWidth: '95px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.today_holes ?? ''}
                                  onChange={(e) => handleTataChange(index, 'today_holes', e.target.value)}
                                  placeholder="0"
                                  style={{ minWidth: '85px', height: '36px', fontSize: '13px' }}
                                />
                              </td>
                              <td>
                                <CFormInput
                                  type="number"
                                  step="any"
                                  min="0"
                                  onKeyDown={blockNegativeKey}
                                  value={row.total_holes ?? ''}
                                  onChange={(e) => handleTataChange(index, 'total_holes', e.target.value)}
                                  placeholder="0"
                                  style={{ minWidth: '90px', height: '36px', fontSize: '13px' }}
                                />
                              </td>

                              <td>
                                {tabData.tata?.length > 1 && (
                                  <CButton
                                    color="danger"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTataRow(index)}
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
                            <td colSpan={8} className="text-end pe-3 text-uppercase text-secondary">
                              Totals:
                            </td>
                            <td className="bg-primary-subtle text-primary">
                              {tataTotals.totalHours} hrs
                            </td>
                            <td></td>
                            <td className="bg-success-subtle text-success">
                              {tataTotals.totalMtr} m
                            </td>
                            <td></td>
                            <td colSpan={2}></td>
                            <td className="bg-danger-subtle text-danger">
                              {tataTotals.totalDieselUsed} L
                            </td>
                            <td className="bg-info-subtle text-info">
                              {tataTotals.totalDieselTaken} L
                            </td>
                            <td style={{ color: '#7c3aed' }}>
                              {tataTotals.totalHoles}
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="mt-3 d-flex justify-content-end">
                      <CButton
                        color="dark"
                        variant="outline"
                        size="sm"
                        className="d-flex align-items-center fw-semibold px-3"
                        onClick={addTataRow}
                        style={{ borderRadius: '6px' }}
                      >
                        <CIcon icon={cilSettings} className="me-1" /> + Add Another TATA Work Row
                      </CButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Section */}
              <div className="d-flex justify-content-center gap-3">
                <CButton
                  style={activeTab === 'tata' ? { backgroundColor: '#0d9488', borderColor: '#0d9488', color: '#ffffff' } : {}}
                  color={activeTab === 'rotary' ? 'primary' : activeTab === 'tata' ? 'success' : 'danger'}
                  size="lg"
                  className="px-5 d-flex align-items-center shadow-sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <CIcon icon={cilFile} className="me-2" />
                  {isSubmitting
                    ? (editId ? 'Updating...' : 'Submitting...')
                    : `${editId ? 'Update' : 'Submit'} ${activeTab === 'drilling' ? 'Drilling' : activeTab === 'casting' ? 'Casting' : activeTab === 'rotary' ? 'Rotary' : 'TATA'} Work Log`}
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