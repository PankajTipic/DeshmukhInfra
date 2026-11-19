import React, { useState, useEffect, useMemo } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CSpinner,
  CTabContent,
  CTabPane,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { getAPICall } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext'
import * as XLSX from 'xlsx-js-style'

const getTodayDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '—'
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return dateStr
}

const formatCurrency = (val) => {
  const num = Number(val) || 0
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const MachineReport = () => {
  const { showToast } = useToast()

  // Filter States
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [selectedMachine, setSelectedMachine] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL') // 'ALL' | 'ACTIVE' | 'IDLE'
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'cards'

  // Data States
  const [loading, setLoading] = useState(false)
  const [rawMachines, setRawMachines] = useState([])
  const [rawDrilling, setRawDrilling] = useState([])
  const [rawStock, setRawStock] = useState([])
  const [rawExpenses, setRawExpenses] = useState([])
  const [projectsList, setProjectsList] = useState([])

  // Modal State
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [activeModalMachine, setActiveModalMachine] = useState(null)
  const [modalActiveTab, setModalActiveTab] = useState(1)

  // Fetch initial master lists once
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [machRes, projRes] = await Promise.all([
          getAPICall('/api/machineries'),
          getAPICall('/api/myProjects'),
        ])

        const machinesData = Array.isArray(machRes?.data)
          ? machRes.data
          : Array.isArray(machRes)
          ? machRes
          : []
        setRawMachines(machinesData)

        const projectsData = Array.isArray(projRes?.data)
          ? projRes.data
          : Array.isArray(projRes)
          ? projRes
          : []
        setProjectsList(projectsData)
      } catch (err) {
        console.error('Error fetching master lists for machine report:', err)
      }
    }
    fetchMasters()
  }, [])

  // Fetch date-specific logs
  const fetchDateData = async (date) => {
    if (!date) return
    setLoading(true)
    try {
      const [drillRes, stockRes, expRes] = await Promise.all([
        getAPICall(`/api/drilling?start_date=${date}&end_date=${date}`),
        getAPICall('/api/machinery/stock').catch(() => []),
        getAPICall(`/api/expense?startDate=${date}&endDate=${date}&perPage=500`).catch(() => []),
      ])

      const drillingRecords = Array.isArray(drillRes?.data)
        ? drillRes.data
        : Array.isArray(drillRes)
        ? drillRes
        : []
      setRawDrilling(drillingRecords)

      const stockItems = Array.isArray(stockRes?.data)
        ? stockRes.data
        : Array.isArray(stockRes)
        ? stockRes
        : []
      setRawStock(stockItems)

      const expensesData = Array.isArray(expRes?.data)
        ? expRes.data
        : Array.isArray(expRes)
        ? expRes
        : []
      setRawExpenses(expensesData)
    } catch (err) {
      console.error('Error loading machine report date data:', err)
      showToast('danger', 'Failed to load report data for ' + formatDateDisplay(date))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDateData(selectedDate)
  }, [selectedDate])

  // Machine aggregation logic
  const aggregatedReport = useMemo(() => {
    return rawMachines.map((mach) => {
      const machIdStr = String(mach.id)
      const machNameClean = (mach.machine_name || '').trim().toLowerCase()

      // 1. Find matching drilling / worklog records
      const matchingDrilling = rawDrilling.filter((rec) => {
        const mReadings = rec.machine_reading || rec.machineReading || []
        const cRpms = rec.compressor_rpm || rec.compressorRpm || []
        const rDetails = rec.rotary_details || rec.rotaryDetails || []

        const inMachine = mReadings.some(
          (m) =>
            String(m.machine_id) === machIdStr ||
            String(m.machinery_id) === machIdStr ||
            (m.machine?.machine_name && m.machine.machine_name.trim().toLowerCase() === machNameClean) ||
            (m.machinery?.machine_name && m.machinery.machine_name.trim().toLowerCase() === machNameClean) ||
            (m.machine_name && m.machine_name.trim().toLowerCase() === machNameClean)
        )

        const inComp = cRpms.some(
          (c) =>
            String(c.machine_id) === machIdStr ||
            String(c.machinery_id) === machIdStr ||
            (c.machine?.machine_name && c.machine.machine_name.trim().toLowerCase() === machNameClean) ||
            (c.machinery?.machine_name && c.machinery.machine_name.trim().toLowerCase() === machNameClean) ||
            (c.machine_name && c.machine_name.trim().toLowerCase() === machNameClean)
        )

        const inRotary = rDetails.some(
          (r) =>
            String(r.machine_id) === machIdStr ||
            (r.machine?.machine_name && r.machine.machine_name.trim().toLowerCase() === machNameClean) ||
            (r.machine_no && r.machine_no.trim().toLowerCase() === machNameClean)
        )

        const directMatch =
          String(rec.machine_id) === machIdStr ||
          String(rec.machinery_id) === machIdStr ||
          (rec.machine_name && rec.machine_name.trim().toLowerCase() === machNameClean)

        return inMachine || inComp || inRotary || directMatch
      })

      const isActive = matchingDrilling.length > 0

      // Collect Sites & Supervisors
      const siteNames = new Set()
      const supervisorNames = new Set()
      const operatorNames = new Set()
      const activeProjectIds = new Set()

      // Metric Accumulators
      let machineStartMeter = null
      let machineEndMeter = null
      let totalMachineHours = 0
      let compStartRpm = null
      let compEndRpm = null
      let totalCompHours = 0

      let totalDieselFilled = 0
      let totalDieselUsed = 0
      let lastDieselBalance = null
      let dieselAvgSum = 0
      let dieselAvgCount = 0

      // Work Output Accumulators
      const workSummaries = []
      const detailedWorkLogs = []
      const detailedReadings = []

      matchingDrilling.forEach((rec) => {
        if (rec.project?.project_name) siteNames.add(rec.project.project_name)
        if (rec.project?.id) activeProjectIds.add(String(rec.project.id))
        if (rec.project_id) activeProjectIds.add(String(rec.project_id))

        const sup = rec.supervisor || rec.project?.supervisor?.name
        if (sup) supervisorNames.add(sup)

        if (rec.operator?.name) operatorNames.add(rec.operator.name)

        const mReadings = rec.machine_reading || rec.machineReading || []
        const cRpms = rec.compressor_rpm || rec.compressorRpm || []
        const rDetails = rec.rotary_details || rec.rotaryDetails || []

        // Extract machine readings matching this machine
        mReadings.forEach((mr) => {
          const match =
            String(mr.machine_id) === machIdStr ||
            String(mr.machinery_id) === machIdStr ||
            (mr.machine?.machine_name && mr.machine.machine_name.trim().toLowerCase() === machNameClean) ||
            (mr.machine_name && mr.machine_name.trim().toLowerCase() === machNameClean)

          if (match) {
            if (mr.operator?.name) operatorNames.add(mr.operator.name)
            if (machineStartMeter === null && mr.machine_start != null && mr.machine_start !== '') {
              machineStartMeter = Number(mr.machine_start)
            }
            if (mr.machine_end != null && mr.machine_end !== '') {
              machineEndMeter = Number(mr.machine_end)
            }
            totalMachineHours += Number(mr.actual_machine_hr) || 0
            totalDieselFilled += Number(mr.diesel_filled) || 0
            totalDieselUsed += Number(mr.diesel_used) || 0
            if (mr.diesel_balance != null && mr.diesel_balance !== '') {
              lastDieselBalance = Number(mr.diesel_balance)
            }
            if (mr.diesel_avg != null && mr.diesel_avg !== '') {
              dieselAvgSum += Number(mr.diesel_avg)
              dieselAvgCount++
            }

            detailedReadings.push({
              type: 'Machine Reading',
              site: rec.project?.project_name || '—',
              operator: mr.operator?.name || rec.operator?.name || '—',
              start: mr.machine_start ?? '—',
              end: mr.machine_end ?? '—',
              hours: mr.actual_machine_hr ?? '—',
              dieselFilled: mr.diesel_filled ?? 0,
              dieselUsed: mr.diesel_used ?? 0,
              dieselBalance: mr.diesel_balance ?? '—',
              dieselAvg: mr.diesel_avg ?? '—',
            })
          }
        })

        // Extract compressor readings matching this machine
        cRpms.forEach((cr) => {
          const match =
            String(cr.machine_id) === machIdStr ||
            String(cr.machinery_id) === machIdStr ||
            (cr.machine?.machine_name && cr.machine.machine_name.trim().toLowerCase() === machNameClean) ||
            (cr.machine_name && cr.machine_name.trim().toLowerCase() === machNameClean)

          if (match) {
            if (cr.operator?.name) operatorNames.add(cr.operator.name)
            if (compStartRpm === null && cr.comp_rpm_start != null && cr.comp_rpm_start !== '') {
              compStartRpm = Number(cr.comp_rpm_start)
            }
            if (cr.comp_rpm_end != null && cr.comp_rpm_end !== '') {
              compEndRpm = Number(cr.comp_rpm_end)
            }
            totalCompHours += Number(cr.com_actul_hr) || 0
            totalDieselFilled += Number(cr.diesel_filled) || 0
            totalDieselUsed += Number(cr.diesel_used) || 0
            if (cr.diesel_balance != null && cr.diesel_balance !== '') {
              lastDieselBalance = Number(cr.diesel_balance)
            }
            if (cr.diesel_avg != null && cr.diesel_avg !== '') {
              dieselAvgSum += Number(cr.diesel_avg)
              dieselAvgCount++
            }

            detailedReadings.push({
              type: 'Compressor RPM',
              site: rec.project?.project_name || '—',
              operator: cr.operator?.name || rec.operator?.name || '—',
              start: cr.comp_rpm_start ?? '—',
              end: cr.comp_rpm_end ?? '—',
              hours: cr.com_actul_hr ?? '—',
              dieselFilled: cr.diesel_filled ?? 0,
              dieselUsed: cr.diesel_used ?? 0,
              dieselBalance: cr.diesel_balance ?? '—',
              dieselAvg: cr.diesel_avg ?? '—',
            })
          }
        })

        // Extract rotary details matching this machine
        rDetails.forEach((rot) => {
          const match =
            String(rot.machine_id) === machIdStr ||
            (rot.machine?.machine_name && rot.machine.machine_name.trim().toLowerCase() === machNameClean) ||
            (rot.machine_no && rot.machine_no.trim().toLowerCase() === machNameClean)

          if (match) {
            if (rot.operator_name || rot.operator?.name) {
              operatorNames.add(rot.operator_name || rot.operator?.name)
            }
            if (rot.site_engineer || rot.engineer?.name) {
              supervisorNames.add(rot.site_engineer || rot.engineer?.name)
            }
            if (machineStartMeter === null && rot.open_reading_hr != null) {
              machineStartMeter = Number(rot.open_reading_hr)
            }
            if (rot.closing_reading_hr != null) {
              machineEndMeter = Number(rot.closing_reading_hr)
            }
            totalMachineHours += Number(rot.total_hours) || 0
            totalDieselUsed += Number(rot.diesel_lit) || 0

            workSummaries.push(
              `Rotary: ${rot.today_miter || 0}m${rot.pile_no ? ` (Pile ${rot.pile_no})` : ''}`
            )

            detailedWorkLogs.push({
              type: 'Rotary Drilling',
              site: rec.project?.project_name || '—',
              description: `Pile ${rot.pile_no || '—'}, Depth: ${rot.today_miter || 0}m`,
              points: `${rot.today_miter || 0} m`,
              rate: '—',
              amount: 0,
              hours: rot.total_hours || '—',
              diesel: rot.diesel_lit || '—',
            })
          }
        })

        // Collect work point details
        const wPoints = rec.work_point_detail || []
        wPoints.forEach((w) => {
          const title = `${w.work_type || 'Work'}${w.drilling_type ? ` (${w.drilling_type})` : ''}: ${w.work_point || 0} ${w.uom || 'pts'}`
          workSummaries.push(title)
          detailedWorkLogs.push({
            type: w.work_type || 'Work Point',
            site: rec.project?.project_name || '—',
            description: w.drilling_type || 'General Work',
            points: `${w.work_point || 0} ${w.uom || ''}`,
            rate: w.rate ? `₹${w.rate}` : '—',
            amount: Number(w.total) || 0,
            hours: w.hrs || '—',
            diesel: w.diesel || '—',
          })
        })

        // Collect survey details
        const sDetails = rec.survey_detail || []
        sDetails.forEach((s) => {
          workSummaries.push(`Survey (${s.survey_type || 'General'}): ${s.survey_point || 0} ${s.uom || 'pts'}`)
          detailedWorkLogs.push({
            type: `Survey - ${s.survey_type || 'General'}`,
            site: rec.project?.project_name || '—',
            description: 'Survey Activity',
            points: `${s.survey_point || 0} ${s.uom || ''}`,
            rate: s.rate ? `₹${s.rate}` : '—',
            amount: Number(s.total) || 0,
            hours: s.hrs || '—',
            diesel: s.diesel || '—',
          })
        })
      })

      // 2. Correlate Stock items allocated to this machine or its active project sites
      const assignedStock = rawStock.filter((s) => {
        const byMach = String(s.machineId) === machIdStr
        const byProject = activeProjectIds.size > 0 && activeProjectIds.has(String(s.projectId))
        return byMach || byProject
      })

      const stockAlertCount = assignedStock.filter(
        (s) => Number(s.currentQty) <= Number(s.minQty)
      ).length

      // 3. Correlate Today's Expenses for this site/machine
      const siteExpenses = rawExpenses.filter((e) => {
        const byProject = activeProjectIds.size > 0 && activeProjectIds.has(String(e.project_id))
        const desc = (e.description || '').toLowerCase()
        const party = (e.party_name || '').toLowerCase()
        const byName = desc.includes(machNameClean) || party.includes(machNameClean)
        return byProject || byName
      })

      const totalExpenseAmount = siteExpenses.reduce(
        (sum, e) => sum + (Number(e.total_amount) || Number(e.total_price) || 0),
        0
      )

      // Fallback diesel balance to machine registered stock if none logged today
      const finalDieselBalance =
        lastDieselBalance !== null ? lastDieselBalance : Number(mach.diesel_balance) || 0
      const finalDieselAvg =
        dieselAvgCount > 0 ? (dieselAvgSum / dieselAvgCount).toFixed(2) : totalMachineHours > 0 && totalDieselUsed > 0 ? (totalDieselUsed / totalMachineHours).toFixed(2) : '0'

      return {
        id: mach.id,
        machineName: mach.machine_name || 'Unnamed Machine',
        regNumber: mach.reg_number || '—',
        ownershipType: mach.ownership_type || 'Own',
        registeredDieselBalance: Number(mach.diesel_balance) || 0,
        isActive,
        statusLabel: isActive ? 'Active On Site' : 'Idle / Standby',
        sitesList: Array.from(siteNames),
        primarySite: Array.from(siteNames).join(', ') || 'Not Assigned',
        supervisorsList: Array.from(supervisorNames),
        operatorsList: Array.from(operatorNames),
        activeProjectIds: Array.from(activeProjectIds),

        // Readings & Hours
        machineStartMeter: machineStartMeter ?? '—',
        machineEndMeter: machineEndMeter ?? '—',
        totalMachineHours: Number(totalMachineHours.toFixed(2)),
        compStartRpm: compStartRpm ?? '—',
        compEndRpm: compEndRpm ?? '—',
        totalCompHours: Number(totalCompHours.toFixed(2)),

        // Diesel
        totalDieselFilled: Number(totalDieselFilled.toFixed(2)),
        totalDieselUsed: Number(totalDieselUsed.toFixed(2)),
        finalDieselBalance: Number(finalDieselBalance.toFixed(2)),
        finalDieselAvg,

        // Work summaries
        workSummaries,
        detailedWorkLogs,
        detailedReadings,

        // Stock & Expense
        assignedStock,
        stockAlertCount,
        siteExpenses,
        totalExpenseAmount,
      }
    })
  }, [rawMachines, rawDrilling, rawStock, rawExpenses])

  // Filtered List based on User Controls
  const filteredReport = useMemo(() => {
    return aggregatedReport.filter((item) => {
      // Machine Filter
      if (selectedMachine && String(item.id) !== String(selectedMachine)) {
        return false
      }

      // Project / Site Filter
      if (selectedProject) {
        if (!item.activeProjectIds.includes(String(selectedProject))) {
          return false
        }
      }

      // Status Filter
      if (selectedStatus === 'ACTIVE' && !item.isActive) return false
      if (selectedStatus === 'IDLE' && item.isActive) return false

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchName = item.machineName.toLowerCase().includes(query)
        const matchReg = item.regNumber.toLowerCase().includes(query)
        const matchSite = item.primarySite.toLowerCase().includes(query)
        const matchOp = item.operatorsList.some((op) => op.toLowerCase().includes(query))
        const matchSup = item.supervisorsList.some((sp) => sp.toLowerCase().includes(query))
        if (!matchName && !matchReg && !matchSite && !matchOp && !matchSup) {
          return false
        }
      }

      return true
    })
  }, [aggregatedReport, selectedMachine, selectedProject, selectedStatus, searchQuery])

  // Top KPIs
  const kpis = useMemo(() => {
    const total = aggregatedReport.length
    const active = aggregatedReport.filter((m) => m.isActive).length
    const idle = total - active
    const totalMachHrs = aggregatedReport.reduce((sum, m) => sum + m.totalMachineHours, 0)
    const totalCompHrs = aggregatedReport.reduce((sum, m) => sum + m.totalCompHours, 0)
    const totalDiesel = aggregatedReport.reduce((sum, m) => sum + m.totalDieselUsed, 0)
    const totalExpenses = aggregatedReport.reduce((sum, m) => sum + m.totalExpenseAmount, 0)

    return {
      total,
      active,
      idle,
      totalMachHrs: totalMachHrs.toFixed(2),
      totalCompHrs: totalCompHrs.toFixed(2),
      totalDiesel: totalDiesel.toFixed(2),
      totalExpenses,
    }
  }, [aggregatedReport])

  // Open Full Machine Details Modal
  const handleOpenDetails = (machine) => {
    setActiveModalMachine(machine)
    setModalActiveTab(1)
    setDetailModalVisible(true)
  }

  // Excel Export Handler using xlsx-js-style
  const handleExportExcel = () => {
    if (filteredReport.length === 0) {
      showToast('warning', 'No machine records available to export')
      return
    }

    try {
      const wb = XLSX.utils.book_new()

      // Header Styles
      const titleStyle = {
        font: { bold: true, sz: 14, color: { rgb: '1E3A8A' } },
        alignment: { horizontal: 'left', vertical: 'center' },
      }
      const subTitleStyle = {
        font: { italic: true, sz: 10, color: { rgb: '475569' } },
      }
      const tableHeaderStyle = {
        font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1E40AF' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: '93C5FD' } },
          bottom: { style: 'thin', color: { rgb: '93C5FD' } },
          left: { style: 'thin', color: { rgb: '93C5FD' } },
          right: { style: 'thin', color: { rgb: '93C5FD' } },
        },
      }
      const dataCellStyle = {
        font: { sz: 9 },
        alignment: { vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
          left: { style: 'thin', color: { rgb: 'E2E8F0' } },
          right: { style: 'thin', color: { rgb: 'E2E8F0' } },
        },
      }
      const dataCenterStyle = {
        ...dataCellStyle,
        alignment: { horizontal: 'center', vertical: 'center' },
      }
      const dataRightStyle = {
        ...dataCellStyle,
        alignment: { horizontal: 'right', vertical: 'center' },
      }
      const activeStatusStyle = {
        ...dataCenterStyle,
        font: { bold: true, color: { rgb: '15803D' } },
        fill: { fgColor: { rgb: 'DCFCE7' } },
      }
      const idleStatusStyle = {
        ...dataCenterStyle,
        font: { bold: true, color: { rgb: 'B45309' } },
        fill: { fgColor: { rgb: 'FEF3C7' } },
      }

      // Build Sheet 1 Data
      const wsData = [
        [{ v: 'MACHINE REPORT — DAILY FLEET & SITE OPERATIONS', s: titleStyle }],
        [{ v: `Report Date: ${formatDateDisplay(selectedDate)} | Generated On: ${new Date().toLocaleString('en-IN')}`, s: subTitleStyle }],
        [{ v: `Summary: Total Machines: ${kpis.total} | Active: ${kpis.active} | Idle: ${kpis.idle} | Fleet Hours: ${kpis.totalMachHrs}h | Diesel Used: ${kpis.totalDiesel} L | Total Expenses: ₹${kpis.totalExpenses.toLocaleString('en-IN')}`, s: subTitleStyle }],
        [], // blank row
      ]

      const tableHeaders = [
        'Sr No',
        'Machine Name',
        'Reg Number',
        'Ownership',
        'Status',
        'Current Site / Project',
        'Supervisor',
        'Operator(s)',
        'Machine Start',
        'Machine End',
        'Machine Hrs',
        'Comp Start RPM',
        'Comp End RPM',
        'Comp Hrs',
        'Diesel Filled (L)',
        'Diesel Used (L)',
        'Diesel Balance (L)',
        'Diesel Avg (L/h)',
        'Work Output Summary',
        'Assigned Stock Qty',
        'Site Expense (₹)',
      ]

      wsData.push(tableHeaders.map((h) => ({ v: h, s: tableHeaderStyle })))

      filteredReport.forEach((item, idx) => {
        const row = [
          { v: idx + 1, s: dataCenterStyle },
          { v: item.machineName, s: dataCellStyle },
          { v: item.regNumber, s: dataCenterStyle },
          { v: item.ownershipType, s: dataCenterStyle },
          { v: item.statusLabel, s: item.isActive ? activeStatusStyle : idleStatusStyle },
          { v: item.primarySite, s: dataCellStyle },
          { v: item.supervisorsList.join(', ') || '—', s: dataCellStyle },
          { v: item.operatorsList.join(', ') || '—', s: dataCellStyle },
          { v: item.machineStartMeter, s: dataCenterStyle },
          { v: item.machineEndMeter, s: dataCenterStyle },
          { v: item.totalMachineHours, s: dataRightStyle },
          { v: item.compStartRpm, s: dataCenterStyle },
          { v: item.compEndRpm, s: dataCenterStyle },
          { v: item.totalCompHours, s: dataRightStyle },
          { v: item.totalDieselFilled, s: dataRightStyle },
          { v: item.totalDieselUsed, s: dataRightStyle },
          { v: item.finalDieselBalance, s: dataRightStyle },
          { v: item.finalDieselAvg, s: dataRightStyle },
          { v: item.workSummaries.join('; ') || 'No Logs', s: dataCellStyle },
          { v: item.assignedStock.length, s: dataCenterStyle },
          { v: item.totalExpenseAmount, s: dataRightStyle },
        ]
        wsData.push(row)
      })

      const ws = XLSX.utils.aoa_to_sheet(wsData)
      ws['!cols'] = [
        { wch: 6 },
        { wch: 18 },
        { wch: 14 },
        { wch: 11 },
        { wch: 15 },
        { wch: 22 },
        { wch: 18 },
        { wch: 18 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 },
        { wch: 10 },
        { wch: 14 },
        { wch: 14 },
        { wch: 15 },
        { wch: 14 },
        { wch: 32 },
        { wch: 15 },
        { wch: 16 },
      ]

      XLSX.utils.book_append_sheet(wb, ws, 'Fleet Activity')

      // Sheet 2: Stock & Expense Logs
      const ws2Data = [
        [{ v: 'MACHINE STOCK & EXPENSE BREAKDOWN', s: titleStyle }],
        [{ v: `Report Date: ${formatDateDisplay(selectedDate)}`, s: subTitleStyle }],
        [],
        [
          { v: 'Machine Name', s: tableHeaderStyle },
          { v: 'Type', s: tableHeaderStyle },
          { v: 'Item / Category / Description', s: tableHeaderStyle },
          { v: 'Quantity / Value', s: tableHeaderStyle },
          { v: 'Unit / Payment Mode', s: tableHeaderStyle },
          { v: 'Site / Remarks', s: tableHeaderStyle },
        ],
      ]

      filteredReport.forEach((item) => {
        // Stock Items
        item.assignedStock.forEach((st) => {
          ws2Data.push([
            { v: item.machineName, s: dataCellStyle },
            { v: 'Assigned Stock', s: dataCenterStyle },
            { v: `${st.itemName || 'Stock Item'} (${st.category || 'General'})`, s: dataCellStyle },
            { v: st.currentQty ?? 0, s: dataRightStyle },
            { v: st.unit || 'NOS', s: dataCenterStyle },
            { v: `Initial: ${st.initialQty || 0} | Min: ${st.minQty || 0}`, s: dataCellStyle },
          ])
        })

        // Expense Items
        item.siteExpenses.forEach((exp) => {
          ws2Data.push([
            { v: item.machineName, s: dataCellStyle },
            { v: 'Site Expense', s: dataCenterStyle },
            { v: `${exp.expense_type?.name || 'Expense'} - ${exp.party_name || 'Vendor'}`, s: dataCellStyle },
            { v: Number(exp.total_amount || exp.total_price || 0), s: dataRightStyle },
            { v: exp.payment_mode || 'Cash', s: dataCenterStyle },
            { v: exp.description || exp.project?.project_name || '—', s: dataCellStyle },
          ])
        })
      })

      const ws2 = XLSX.utils.aoa_to_sheet(ws2Data)
      ws2['!cols'] = [
        { wch: 18 },
        { wch: 15 },
        { wch: 30 },
        { wch: 15 },
        { wch: 18 },
        { wch: 35 },
      ]
      XLSX.utils.book_append_sheet(wb, ws2, 'Stock & Expenses')

      const filename = `Machine_Report_${selectedDate}.xlsx`
      XLSX.writeFile(wb, filename)
      showToast('success', `Exported ${filename} successfully!`)
    } catch (err) {
      console.error('Error generating Excel:', err)
      showToast('danger', 'Failed to generate Excel file')
    }
  }

  return (
    <div className="machine-report-container pb-5">
      {/* ─── PAGE HEADER & FILTER BAR ─── */}
      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h4 className="mb-0 text-primary fw-bold d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.4rem' }}>🚜</span>
              Machine Report
            </h4>
            <small className="text-muted">
              Fleet operations, site deployment, meter readings, diesel stock & expense summary for{' '}
              <strong className="text-dark">{formatDateDisplay(selectedDate)}</strong>
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <CButton
              color={viewMode === 'table' ? 'primary' : 'light'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="fw-semibold"
            >
              📋 Table View
            </CButton>
            <CButton
              color={viewMode === 'cards' ? 'primary' : 'light'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="fw-semibold"
            >
              🗂️ Cards View
            </CButton>
            <CButton
              color="success"
              size="sm"
              className="text-white fw-bold d-flex align-items-center gap-1 shadow-sm"
              onClick={handleExportExcel}
              disabled={loading || filteredReport.length === 0}
            >
              📥 Download Excel
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody className="bg-light bg-opacity-50 py-3">
          <CRow className="g-2 align-items-end">
            {/* Date Picker */}
            <CCol xs={12} sm={6} md={3} lg={2}>
              <label className="form-label small fw-bold text-secondary mb-1">Select Date</label>
              <CFormInput
                type="date"
                size="sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white shadow-none"
              />
            </CCol>

            {/* Quick Today / Yesterday */}
            <CCol xs={12} sm={6} md={2} lg={2} className="d-flex gap-1">
              <CButton
                color="secondary"
                variant={selectedDate === getTodayDate() ? 'solid' : 'outline'}
                size="sm"
                className="w-50"
                onClick={() => setSelectedDate(getTodayDate())}
              >
                Today
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                className="w-50"
                onClick={() => {
                  const y = new Date()
                  y.setDate(y.getDate() - 1)
                  setSelectedDate(y.toISOString().split('T')[0])
                }}
              >
                Yesterday
              </CButton>
            </CCol>

            {/* Machine Filter */}
            <CCol xs={12} sm={6} md={3} lg={2}>
              <label className="form-label small fw-bold text-secondary mb-1">Filter Machine</label>
              <CFormSelect
                size="sm"
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="bg-white shadow-none"
              >
                <option value="">-- All Machines ({rawMachines.length}) --</option>
                {rawMachines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.machine_name} {m.reg_number ? `(${m.reg_number})` : ''}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Site / Project Filter */}
            <CCol xs={12} sm={6} md={3} lg={2}>
              <label className="form-label small fw-bold text-secondary mb-1">Filter Site / Project</label>
              <CFormSelect
                size="sm"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-white shadow-none"
              >
                <option value="">-- All Projects --</option>
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Status Filter */}
            <CCol xs={6} sm={4} md={2} lg={2}>
              <label className="form-label small fw-bold text-secondary mb-1">Operational Status</label>
              <CFormSelect
                size="sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white shadow-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active on Site</option>
                <option value="IDLE">Idle / Standby</option>
              </CFormSelect>
            </CCol>

            {/* Quick Text Search & Refresh */}
            <CCol xs={6} sm={8} md={4} lg={2} className="d-flex gap-1">
              <div className="flex-grow-1">
                <label className="form-label small fw-bold text-secondary mb-1">Search Fleet</label>
                <CFormInput
                  type="text"
                  size="sm"
                  placeholder="Machine, Reg, Operator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white shadow-none"
                />
              </div>
              <div className="d-flex align-items-end">
                <CButton
                  color="light"
                  size="sm"
                  title="Refresh Data"
                  onClick={() => fetchDateData(selectedDate)}
                  disabled={loading}
                >
                  🔄
                </CButton>
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* ─── SUMMARY KPI CARDS ─── */}
      <CRow className="g-3 mb-4">
        {/* Total Machines */}
        <CCol xs={6} sm={4} md={2}>
          <div
            className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-primary h-100"
            style={{ borderLeftWidth: '5px !important' }}
          >
            <div className="text-secondary small fw-semibold text-uppercase">Total Fleet</div>
            <div className="fs-4 fw-bold text-primary mt-1">{kpis.total}</div>
            <div className="small text-muted">Registered Units</div>
          </div>
        </CCol>

        {/* Active Machines */}
        <CCol xs={6} sm={4} md={2}>
          <div
            className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-success h-100"
            style={{ borderLeftWidth: '5px !important' }}
          >
            <div className="text-secondary small fw-semibold text-uppercase">Active On Site</div>
            <div className="fs-4 fw-bold text-success mt-1">{kpis.active}</div>
            <div className="small text-muted">{kpis.idle} Idle / Standby</div>
          </div>
        </CCol>

        {/* Machine Hours */}
        <CCol xs={6} sm={4} md={2}>
          <div
            className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-info h-100"
            style={{ borderLeftWidth: '5px !important' }}
          >
            <div className="text-secondary small fw-semibold text-uppercase">Machine Hours</div>
            <div className="fs-4 fw-bold text-info mt-1">{kpis.totalMachHrs} <span className="fs-6">hrs</span></div>
            <div className="small text-muted">Logged Running Time</div>
          </div>
        </CCol>

        {/* Compressor Hours */}
        <CCol xs={6} sm={4} md={2}>
          <div
            className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-warning h-100"
            style={{ borderLeftWidth: '5px !important' }}
          >
            <div className="text-secondary small fw-semibold text-uppercase">Compressor Hours</div>
            <div className="fs-4 fw-bold text-warning mt-1">{kpis.totalCompHrs} <span className="fs-6">hrs</span></div>
            <div className="small text-muted">RPM Operating Time</div>
          </div>
        </CCol>

        {/* Diesel Consumed */}
        <CCol xs={6} sm={4} md={2}>
          <div
            className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-danger h-100"
            style={{ borderLeftWidth: '5px !important' }}
          >
            <div className="text-secondary small fw-semibold text-uppercase">Diesel Used</div>
            <div className="fs-4 fw-bold text-danger mt-1">{kpis.totalDiesel} <span className="fs-6">L</span></div>
            <div className="small text-muted">Fleet Consumption</div>
          </div>
        </CCol>

        {/* Site Expenses */}
        <CCol xs={6} sm={4} md={2}>
          <div
            className="p-3 bg-white rounded-3 shadow-sm border-start border-4 border-dark h-100"
            style={{ borderLeftWidth: '5px !important' }}
          >
            <div className="text-secondary small fw-semibold text-uppercase">Today Expenses</div>
            <div className="fs-4 fw-bold text-dark mt-1">₹{Number(kpis.totalExpenses).toLocaleString('en-IN')}</div>
            <div className="small text-muted">Active Site Incurred</div>
          </div>
        </CCol>
      </CRow>

      {/* ─── LOADING SPINNER ─── */}
      {loading && (
        <div className="text-center py-5">
          <CSpinner color="primary" />
          <div className="mt-2 text-muted fw-semibold">Loading machine activities for {formatDateDisplay(selectedDate)}...</div>
        </div>
      )}

      {/* ─── MAIN CONTENT VIEW (TABLE OR CARDS) ─── */}
      {!loading && filteredReport.length === 0 && (
        <CCard className="shadow-sm border-0 text-center py-5">
          <CCardBody>
            <div style={{ fontSize: '3rem' }}>🚜</div>
            <h5 className="mt-3 text-secondary">No Machines Found Matching Filters</h5>
            <p className="text-muted small">
              Try adjusting the machine dropdown, project filter, operational status, or date.
            </p>
            <CButton
              color="primary"
              size="sm"
              onClick={() => {
                setSelectedMachine('')
                setSelectedProject('')
                setSelectedStatus('ALL')
                setSearchQuery('')
              }}
            >
              Reset Filters
            </CButton>
          </CCardBody>
        </CCard>
      )}

      {!loading && filteredReport.length > 0 && viewMode === 'table' && (
        <CCard className="shadow-sm border-0 overflow-hidden">
          <div className="table-responsive">
            <CTable align="middle" hover responsive className="mb-0 border">
              <CTableHead className="bg-light text-secondary small text-uppercase fw-bold">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '40px' }} className="text-center">#</CTableHeaderCell>
                  <CTableHeaderCell>Machine Details</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
                  <CTableHeaderCell>Site & Crew</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Machine Meter</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Compressor RPM</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Fuel / Diesel (L)</CTableHeaderCell>
                  <CTableHeaderCell>Work Done Today</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Stock & Expense</CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ width: '90px' }}>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody className="small">
                {filteredReport.map((m, idx) => (
                  <CTableRow key={m.id} className={m.isActive ? 'table-row-active' : 'bg-light bg-opacity-25'}>
                    {/* Index */}
                    <CTableDataCell className="text-center fw-bold text-muted">{idx + 1}</CTableDataCell>

                    {/* Machine Details */}
                    <CTableDataCell>
                      <div className="fw-bold text-primary fs-6">{m.machineName}</div>
                      <div className="d-flex align-items-center gap-1 mt-1">
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                          {m.regNumber}
                        </span>
                        <span className="badge bg-info bg-opacity-10 text-info border">
                          {m.ownershipType}
                        </span>
                      </div>
                    </CTableDataCell>

                    {/* Status Badge */}
                    <CTableDataCell className="text-center">
                      {m.isActive ? (
                        <CBadge color="success" className="p-2 fw-semibold">
                          🟢 Active on Site
                        </CBadge>
                      ) : (
                        <CBadge color="secondary" className="p-2 fw-semibold">
                          ⚪ Idle / Standby
                        </CBadge>
                      )}
                    </CTableDataCell>

                    {/* Site & Crew */}
                    <CTableDataCell>
                      <div className="fw-bold text-dark">{m.primarySite}</div>
                      <div className="text-muted small mt-1">
                        <div>
                          <strong>Supervisor:</strong> {m.supervisorsList.join(', ') || '—'}
                        </div>
                        <div>
                          <strong>Operator:</strong> {m.operatorsList.join(', ') || '—'}
                        </div>
                      </div>
                    </CTableDataCell>

                    {/* Machine Meter */}
                    <CTableDataCell className="text-center">
                      <div className="fw-bold text-dark">
                        {m.machineStartMeter} → {m.machineEndMeter}
                      </div>
                      <div className="badge bg-primary bg-opacity-10 text-primary mt-1">
                        Net: {m.totalMachineHours} hrs
                      </div>
                    </CTableDataCell>

                    {/* Compressor Meter */}
                    <CTableDataCell className="text-center">
                      <div className="fw-bold text-dark">
                        {m.compStartRpm} → {m.compEndRpm}
                      </div>
                      <div className="badge bg-warning bg-opacity-10 text-dark mt-1">
                        Net: {m.totalCompHours} hrs
                      </div>
                    </CTableDataCell>

                    {/* Diesel Details */}
                    <CTableDataCell className="text-center">
                      <div className="d-flex justify-content-between px-2 text-muted">
                        <span>Filled:</span>
                        <strong className="text-success">{m.totalDieselFilled} L</strong>
                      </div>
                      <div className="d-flex justify-content-between px-2 text-muted">
                        <span>Used:</span>
                        <strong className="text-danger">{m.totalDieselUsed} L</strong>
                      </div>
                      <div className="d-flex justify-content-between px-2 text-muted border-top mt-1 pt-1">
                        <span>Balance:</span>
                        <strong className="text-primary">{m.finalDieselBalance} L</strong>
                      </div>
                      <div className="small text-muted mt-1">Avg: {m.finalDieselAvg} L/h</div>
                    </CTableDataCell>

                    {/* Work Summary */}
                    <CTableDataCell style={{ maxWidth: '240px' }}>
                      {m.workSummaries.length > 0 ? (
                        <ul className="list-unstyled mb-0 small">
                          {m.workSummaries.slice(0, 3).map((w, wIdx) => (
                            <li key={wIdx} className="text-truncate">
                              • {w}
                            </li>
                          ))}
                          {m.workSummaries.length > 3 && (
                            <li className="text-muted fst-italic">
                              +{m.workSummaries.length - 3} more work items...
                            </li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-muted fst-italic">No work logged</span>
                      )}
                    </CTableDataCell>

                    {/* Stock & Expenses */}
                    <CTableDataCell className="text-center">
                      <div>
                        <span className="badge bg-secondary bg-opacity-25 text-dark">
                          Stock: {m.assignedStock.length} items
                        </span>
                        {m.stockAlertCount > 0 && (
                          <span className="badge bg-danger ms-1" title="Low stock alert">
                            ⚠️ {m.stockAlertCount}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 fw-bold text-dark">
                        Exp: {formatCurrency(m.totalExpenseAmount)}
                      </div>
                    </CTableDataCell>

                    {/* Action */}
                    <CTableDataCell className="text-center">
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetails(m)}
                        title="View Complete Machine Details"
                        className="fw-semibold px-2 py-1"
                      >
                        Details
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </CCard>
      )}

      {/* ─── CARDS VIEW ─── */}
      {!loading && filteredReport.length > 0 && viewMode === 'cards' && (
        <CRow className="g-3">
          {filteredReport.map((m) => (
            <CCol key={m.id} xs={12} md={6} lg={4}>
              <CCard className="h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                {/* Card Header */}
                <div
                  className={`p-3 border-bottom d-flex justify-content-between align-items-center ${
                    m.isActive ? 'bg-primary bg-opacity-10' : 'bg-light'
                  }`}
                >
                  <div>
                    <h5 className="mb-0 fw-bold text-dark">{m.machineName}</h5>
                    <div className="small text-muted mt-1">
                      <span className="fw-semibold">{m.regNumber}</span> • {m.ownershipType}
                    </div>
                  </div>
                  <div>
                    {m.isActive ? (
                      <CBadge color="success">🟢 Active</CBadge>
                    ) : (
                      <CBadge color="secondary">⚪ Idle</CBadge>
                    )}
                  </div>
                </div>

                <CCardBody className="p-3 small">
                  {/* Site & Personnel */}
                  <div className="mb-3 pb-2 border-bottom">
                    <div className="text-secondary small fw-bold text-uppercase">Site Deployment</div>
                    <div className="fw-bold text-primary fs-6 mt-1">{m.primarySite}</div>
                    <div className="text-muted mt-1">
                      <div>
                        <strong>Supervisor:</strong> {m.supervisorsList.join(', ') || '—'}
                      </div>
                      <div>
                        <strong>Operator:</strong> {m.operatorsList.join(', ') || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Readings & Hours */}
                  <div className="row g-2 mb-3 pb-2 border-bottom">
                    <div className="col-6">
                      <div className="text-muted small fw-semibold">Machine Hours</div>
                      <div className="fw-bold text-dark fs-6 mt-1">{m.totalMachineHours} hrs</div>
                      <div className="small text-muted">
                        {m.machineStartMeter} → {m.machineEndMeter}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted small fw-semibold">Compressor Hours</div>
                      <div className="fw-bold text-dark fs-6 mt-1">{m.totalCompHours} hrs</div>
                      <div className="small text-muted">
                        {m.compStartRpm} → {m.compEndRpm}
                      </div>
                    </div>
                  </div>

                  {/* Fuel / Diesel Grid */}
                  <div className="mb-3 pb-2 border-bottom bg-light bg-opacity-50 p-2 rounded">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-secondary fw-semibold">Diesel Filled:</span>
                      <strong className="text-success">+{m.totalDieselFilled} L</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-secondary fw-semibold">Diesel Consumed:</span>
                      <strong className="text-danger">-{m.totalDieselUsed} L</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center border-top pt-1">
                      <span className="text-secondary fw-bold">Diesel Balance:</span>
                      <strong className="text-primary fs-6">{m.finalDieselBalance} L</strong>
                    </div>
                  </div>

                  {/* Work Output & Stock/Expenses */}
                  <div className="mb-3">
                    <div className="text-secondary small fw-bold text-uppercase mb-1">Today's Work</div>
                    {m.workSummaries.length > 0 ? (
                      <div className="text-dark">
                        {m.workSummaries.slice(0, 2).map((w, idx) => (
                          <div key={idx} className="text-truncate">
                            • {w}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted fst-italic">No work logged today</div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <div className="small text-muted">
                      <strong>Stock:</strong> {m.assignedStock.length} items |{' '}
                      <strong>Exp:</strong> {formatCurrency(m.totalExpenseAmount)}
                    </div>
                    <CButton
                      color="primary"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetails(m)}
                      className="fw-bold"
                    >
                      View Details →
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      )}

      {/* ─── FULL MACHINE DETAILS MODAL ─── */}
      <CModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        size="xl"
        backdrop="static"
      >
        {activeModalMachine && (
          <>
            <CModalHeader className="bg-light py-3">
              <CModalTitle className="d-flex align-items-center gap-2">
                <span className="fs-5">🚜</span>
                <div>
                  <div className="fw-bold fs-5 text-primary">{activeModalMachine.machineName}</div>
                  <div className="small text-muted fw-normal">
                    Reg: <strong>{activeModalMachine.regNumber}</strong> | Ownership:{' '}
                    <strong>{activeModalMachine.ownershipType}</strong> | Date:{' '}
                    <strong>{formatDateDisplay(selectedDate)}</strong>
                  </div>
                </div>
              </CModalTitle>
            </CModalHeader>

            <CModalBody className="p-4">
              {/* Modal Nav Tabs */}
              <CNav variant="tabs" className="mb-3">
                <CNavItem>
                  <CNavLink
                    active={modalActiveTab === 1}
                    onClick={() => setModalActiveTab(1)}
                    style={{ cursor: 'pointer' }}
                    className="fw-semibold"
                  >
                    📍 Site Operations & Work
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={modalActiveTab === 2}
                    onClick={() => setModalActiveTab(2)}
                    style={{ cursor: 'pointer' }}
                    className="fw-semibold"
                  >
                    ⏱️ Meter & Fuel Readings
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={modalActiveTab === 3}
                    onClick={() => setModalActiveTab(3)}
                    style={{ cursor: 'pointer' }}
                    className="fw-semibold"
                  >
                    📦 Assigned Stock ({activeModalMachine.assignedStock.length})
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={modalActiveTab === 4}
                    onClick={() => setModalActiveTab(4)}
                    style={{ cursor: 'pointer' }}
                    className="fw-semibold"
                  >
                    💰 Site Expenses ({activeModalMachine.siteExpenses.length})
                  </CNavLink>
                </CNavItem>
              </CNav>

              <CTabContent>
                {/* TAB 1: Site Operations & Work */}
                <CTabPane visible={modalActiveTab === 1}>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded border">
                        <div className="text-secondary small fw-bold text-uppercase">Site / Project</div>
                        <div className="fs-6 fw-bold text-dark mt-1">
                          {activeModalMachine.primarySite}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded border">
                        <div className="text-secondary small fw-bold text-uppercase">Supervisor(s)</div>
                        <div className="fs-6 fw-bold text-dark mt-1">
                          {activeModalMachine.supervisorsList.join(', ') || '—'}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded border">
                        <div className="text-secondary small fw-bold text-uppercase">Operator(s)</div>
                        <div className="fs-6 fw-bold text-dark mt-1">
                          {activeModalMachine.operatorsList.join(', ') || '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <h6 className="fw-bold text-secondary mb-2">Work Points & Outputs Completed Today</h6>
                  {activeModalMachine.detailedWorkLogs.length > 0 ? (
                    <div className="table-responsive border rounded">
                      <CTable hover align="middle" className="mb-0 small">
                        <CTableHead className="bg-light text-secondary">
                          <CTableRow>
                            <CTableHeaderCell>#</CTableHeaderCell>
                            <CTableHeaderCell>Type</CTableHeaderCell>
                            <CTableHeaderCell>Details</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Points / Depth</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Rate</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Amount</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Hours</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Diesel (L)</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {activeModalMachine.detailedWorkLogs.map((item, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell className="text-muted">{idx + 1}</CTableDataCell>
                              <CTableDataCell className="fw-bold">{item.type}</CTableDataCell>
                              <CTableDataCell>{item.description}</CTableDataCell>
                              <CTableDataCell className="text-center fw-bold">{item.points}</CTableDataCell>
                              <CTableDataCell className="text-center">{item.rate}</CTableDataCell>
                              <CTableDataCell className="text-end fw-bold">
                                {formatCurrency(item.amount)}
                              </CTableDataCell>
                              <CTableDataCell className="text-center">{item.hours}</CTableDataCell>
                              <CTableDataCell className="text-center">{item.diesel}</CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  ) : (
                    <div className="alert alert-light border text-center text-muted small py-4">
                      No work point or survey log found for this machine on {formatDateDisplay(selectedDate)}.
                    </div>
                  )}
                </CTabPane>

                {/* TAB 2: Meter & Fuel Readings */}
                <CTabPane visible={modalActiveTab === 2}>
                  <div className="row g-3 mb-4">
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded border text-center">
                        <div className="small text-secondary fw-semibold">Machine Running Hours</div>
                        <div className="fs-4 fw-bold text-primary mt-1">
                          {activeModalMachine.totalMachineHours} hrs
                        </div>
                        <div className="small text-muted">
                          Start: {activeModalMachine.machineStartMeter} | End: {activeModalMachine.machineEndMeter}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded border text-center">
                        <div className="small text-secondary fw-semibold">Compressor Hours</div>
                        <div className="fs-4 fw-bold text-warning mt-1">
                          {activeModalMachine.totalCompHours} hrs
                        </div>
                        <div className="small text-muted">
                          Start: {activeModalMachine.compStartRpm} | End: {activeModalMachine.compEndRpm}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded border text-center">
                        <div className="small text-secondary fw-semibold">Diesel Consumed</div>
                        <div className="fs-4 fw-bold text-danger mt-1">
                          {activeModalMachine.totalDieselUsed} L
                        </div>
                        <div className="small text-muted">
                          Filled Today: +{activeModalMachine.totalDieselFilled} L
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded border text-center">
                        <div className="small text-secondary fw-semibold">Current Fuel Balance</div>
                        <div className="fs-4 fw-bold text-success mt-1">
                          {activeModalMachine.finalDieselBalance} L
                        </div>
                        <div className="small text-muted">Avg: {activeModalMachine.finalDieselAvg} L/h</div>
                      </div>
                    </div>
                  </div>

                  <h6 className="fw-bold text-secondary mb-2">Individual Shift & Meter Logs</h6>
                  {activeModalMachine.detailedReadings.length > 0 ? (
                    <div className="table-responsive border rounded">
                      <CTable hover align="middle" className="mb-0 small">
                        <CTableHead className="bg-light text-secondary">
                          <CTableRow>
                            <CTableHeaderCell>Reading Type</CTableHeaderCell>
                            <CTableHeaderCell>Site</CTableHeaderCell>
                            <CTableHeaderCell>Operator</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Start</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">End</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Net Hours</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Filled (L)</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Used (L)</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Balance (L)</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Avg (L/h)</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {activeModalMachine.detailedReadings.map((r, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell className="fw-bold">{r.type}</CTableDataCell>
                              <CTableDataCell>{r.site}</CTableDataCell>
                              <CTableDataCell>{r.operator}</CTableDataCell>
                              <CTableDataCell className="text-center">{r.start}</CTableDataCell>
                              <CTableDataCell className="text-center">{r.end}</CTableDataCell>
                              <CTableDataCell className="text-center fw-bold">{r.hours}</CTableDataCell>
                              <CTableDataCell className="text-end text-success">+{r.dieselFilled}</CTableDataCell>
                              <CTableDataCell className="text-end text-danger">-{r.dieselUsed}</CTableDataCell>
                              <CTableDataCell className="text-end fw-bold">{r.dieselBalance}</CTableDataCell>
                              <CTableDataCell className="text-center">{r.dieselAvg}</CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  ) : (
                    <div className="alert alert-light border text-center text-muted small py-4">
                      No meter reading logged for this machine on {formatDateDisplay(selectedDate)}.
                    </div>
                  )}
                </CTabPane>

                {/* TAB 3: Assigned Stock & Consumables */}
                <CTabPane visible={modalActiveTab === 3}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-secondary mb-0">
                      Spare Parts, Bits & Consumables Allocated to this Machine / Site
                    </h6>
                    <span className="small text-muted">
                      Total Allocated: {activeModalMachine.assignedStock.length} items
                    </span>
                  </div>

                  {activeModalMachine.assignedStock.length > 0 ? (
                    <div className="table-responsive border rounded">
                      <CTable hover align="middle" className="mb-0 small">
                        <CTableHead className="bg-light text-secondary">
                          <CTableRow>
                            <CTableHeaderCell>#</CTableHeaderCell>
                            <CTableHeaderCell>Item Name</CTableHeaderCell>
                            <CTableHeaderCell>Category</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Current Qty</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Initial Qty</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Min Alert Qty</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Unit</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Unit Price</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Total Valuation</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {activeModalMachine.assignedStock.map((st, idx) => {
                            const isLow = Number(st.currentQty) <= Number(st.minQty)
                            return (
                              <CTableRow key={st.id || idx}>
                                <CTableDataCell className="text-muted">{idx + 1}</CTableDataCell>
                                <CTableDataCell className="fw-bold text-dark">
                                  {st.itemName}
                                  {isLow && (
                                    <span className="badge bg-danger ms-2" title="Low stock">
                                      Low Stock
                                    </span>
                                  )}
                                </CTableDataCell>
                                <CTableDataCell>
                                  <span className="badge bg-light text-dark border">
                                    {st.category || 'Consumable'}
                                  </span>
                                </CTableDataCell>
                                <CTableDataCell
                                  className={`text-center fw-bold ${
                                    isLow ? 'text-danger' : 'text-success'
                                  }`}
                                >
                                  {st.currentQty}
                                </CTableDataCell>
                                <CTableDataCell className="text-center text-muted">
                                  {st.initialQty}
                                </CTableDataCell>
                                <CTableDataCell className="text-center text-muted">
                                  {st.minQty}
                                </CTableDataCell>
                                <CTableDataCell className="text-center">{st.unit || 'NOS'}</CTableDataCell>
                                <CTableDataCell className="text-end">
                                  {formatCurrency(st.price)}
                                </CTableDataCell>
                                <CTableDataCell className="text-end fw-bold">
                                  {formatCurrency(st.totalPrice)}
                                </CTableDataCell>
                              </CTableRow>
                            )
                          })}
                        </CTableBody>
                      </CTable>
                    </div>
                  ) : (
                    <div className="alert alert-light border text-center text-muted small py-4">
                      No stock items or spare parts currently allocated to this machine.
                    </div>
                  )}
                </CTabPane>

                {/* TAB 4: Today's Site Expenses */}
                <CTabPane visible={modalActiveTab === 4}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-secondary mb-0">
                      Expenses Incurred on Site / Machinery on {formatDateDisplay(selectedDate)}
                    </h6>
                    <span className="fw-bold text-dark fs-6">
                      Total: {formatCurrency(activeModalMachine.totalExpenseAmount)}
                    </span>
                  </div>

                  {activeModalMachine.siteExpenses.length > 0 ? (
                    <div className="table-responsive border rounded">
                      <CTable hover align="middle" className="mb-0 small">
                        <CTableHead className="bg-light text-secondary">
                          <CTableRow>
                            <CTableHeaderCell>#</CTableHeaderCell>
                            <CTableHeaderCell>Expense Type</CTableHeaderCell>
                            <CTableHeaderCell>Party / Vendor</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Amount</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Payment Mode</CTableHeaderCell>
                            <CTableHeaderCell>Description</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {activeModalMachine.siteExpenses.map((e, idx) => (
                            <CTableRow key={e.id || idx}>
                              <CTableDataCell className="text-muted">{idx + 1}</CTableDataCell>
                              <CTableDataCell className="fw-bold text-primary">
                                {e.expense_type?.name || 'General Expense'}
                              </CTableDataCell>
                              <CTableDataCell>{e.party_name || '—'}</CTableDataCell>
                              <CTableDataCell className="text-end fw-bold text-dark">
                                {formatCurrency(e.total_amount || e.total_price)}
                              </CTableDataCell>
                              <CTableDataCell className="text-center">
                                <span className="badge bg-light text-secondary border">
                                  {e.payment_mode || 'Cash'}
                                </span>
                              </CTableDataCell>
                              <CTableDataCell className="text-muted">
                                {e.description || e.remarks || '—'}
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  ) : (
                    <div className="alert alert-light border text-center text-muted small py-4">
                      No expenses logged for this machine's site on {formatDateDisplay(selectedDate)}.
                    </div>
                  )}
                </CTabPane>
              </CTabContent>
            </CModalBody>

            <CModalFooter className="bg-light py-2">
              <CButton color="secondary" size="sm" onClick={() => setDetailModalVisible(false)}>
                Close
              </CButton>
            </CModalFooter>
          </>
        )}
      </CModal>
    </div>
  )
}

export default MachineReport
