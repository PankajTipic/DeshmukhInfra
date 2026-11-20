// worklogExportUtils.js
// Standalone export helpers for Work Log Reports, Separate Drilling, Casting & Rotary Reports, and Multi-Site Breakdown.

import * as XLSX from 'xlsx-js-style'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Shared helper to draw the company letterhead and outer page border.
 * Matches the Work Log Report PDF letterhead layout exactly.
 */
const drawCompanyHeader = ({
  doc,
  companyInfo = {},
  host,
  pageWidth,
  pageHeight,
  margin = 12,
  titleText = 'Work Log Report',
}) => {
  const headerTop = margin + 6

  // Outer page border (dark gray)
  doc.setDrawColor(80, 80, 80)
  doc.setLineWidth(0.4)
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2)

  // Company logo (Right aligned)
  const logoSize = 26
  const logoX = pageWidth - margin - logoSize - 6
  const logoY = headerTop

  let logoUrl = null
  if (companyInfo.logo && companyInfo.logo !== 'invoice/empty.png') {
    logoUrl = `${host}/img/${companyInfo.logo}`
  }
  if (logoUrl) {
    try {
      doc.addImage(logoUrl, 'PNG', logoX, logoY, logoSize, logoSize)
    } catch (err) {
      console.warn('Failed to load logo:', err)
      doc.setFillColor(220, 220, 240)
      doc.rect(logoX, logoY, logoSize, logoSize, 'F')
      doc.setFontSize(9)
      doc.setTextColor(100)
      doc.text('LOGO', logoX + 8, logoY + 15)
    }
  } else {
    doc.setFillColor(220, 220, 240)
    doc.rect(logoX, logoY, logoSize, logoSize, 'F')
    doc.setFontSize(9)
    doc.setTextColor(100)
    doc.text('LOGO', logoX + 8, logoY + 15)
  }

  // Company details (Left Aligned)
  const headerTextX = margin + 8

  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 60)
  doc.text(companyInfo.company_name || 'Deshmukh Infra Soft', headerTextX, headerTop + 8)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(70)

  const address = companyInfo.land_mark || 'Urali Kanchan, Pune'
  doc.text(address, headerTextX, headerTop + 14)

  const contactLine = `Phone: ${companyInfo.phone_no || '9173635656'}   |   Email: ${companyInfo.email_id || 'shreyas.gijare.21@gmail.com'}`
  doc.text(contactLine, headerTextX, headerTop + 19)

  const gstLine = `GSTIN: ${companyInfo.gst_number || 'Not Available'}`
  doc.text(gstLine, headerTextX, headerTop + 24)

  const detailY = headerTop + 28

  // Horizontal separator line after header
  doc.setLineWidth(0.6)
  doc.setDrawColor(0, 0, 0)
  doc.line(margin + 6, detailY, pageWidth - margin - 6, detailY)

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text(titleText, pageWidth / 2, detailY + 10, { align: 'center' })

  // Return Y position after title
  return detailY + 18
}

/**
 * Helper to safely extract compressor / machine reading values without dropping 0
 */
const getFieldVal = (row, key1, key2) => {
  const val = row[key1] != null && row[key1] !== '—' ? row[key1] : (row[key2] != null && row[key2] !== '—' ? row[key2] : '')
  return val
}

// ─────────────────────────────────────────────────────────────────
// 1. WORK LOG REPORT EXPORTS (Combined Table)
// ─────────────────────────────────────────────────────────────────

export const downloadWorkLogExcel = ({
  rows = [],
  records = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  surveyType,
  machineryMap = {},
  companyInfo = {},
  fileName = 'WorkLogReport.xlsx',
}) => {
  const T = tableTotals

  /* ---------- palette & styles ---------- */
  const NAVY = '1F3864'
  const HEAD = '344A5E'
  const ZEBRA = 'F6F8FB'
  const TOTAL = 'E2E8F0'
  const GREEN = '008000'
  const INK = '1E2328'
  const MUTED = '6E7680'
  const LINE = 'C8CDD4'

  // Indian digit grouping: 5,09,712.00
  const NUM_FMT = '[>=10000000]##\\,##\\,##\\,##0.00;[>=100000]##\\,##\\,##0.00;##,##0.00'

  const thin = { style: 'thin', color: { rgb: LINE } }
  const border = { top: thin, bottom: thin, left: thin, right: thin }

  const styleFor = ({ fill, bold = false, color = INK, align = 'left', size = 9 } = {}) => ({
    font: { name: 'Calibri', sz: size, bold, color: { rgb: color } },
    fill: fill ? { patternType: 'solid', fgColor: { rgb: fill } } : undefined,
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border,
  })

  /* ---------- value helpers ---------- */
  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const num = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => {
    if (!d) return ''
    try {
      const parts = String(d).split('T')[0].split('-')
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`
      }
      return new Date(d).toLocaleDateString('en-GB')
    } catch {
      return String(d)
    }
  }
  const pick = (row, ...keys) => {
    for (const k of keys) if (!isEmpty(row[k])) return row[k]
    return ''
  }

  /* ---------- dynamic work & survey types detection ---------- */
  let dynamicWorkTypes = []
  if (workType) {
    dynamicWorkTypes = [workType.trim()]
  } else {
    const seenWT = new Set()
    if (records && records.length > 0) {
      records.forEach((rec) => {
        (rec.work_point_detail || []).forEach((w) => {
          const wt = (w.work_type || '').trim()
          if (wt && !seenWT.has(wt)) {
            seenWT.add(wt)
            dynamicWorkTypes.push(wt)
          }
        })
      })
    }
    if (dynamicWorkTypes.length === 0 && rows && rows.length > 0) {
      rows.forEach((r) => {
        let wt = (r.workType || '').trim()
        if (wt && wt !== 'Rotary Work') {
          const baseWt = wt.replace(/\s*\(.*?\)$/, '').trim()
          const finalWt = baseWt || wt
          if (!seenWT.has(finalWt)) {
            seenWT.add(finalWt)
            dynamicWorkTypes.push(finalWt)
          }
        }
      })
    }
  }

  let dynamicSurveyTypes = []
  if (surveyType) {
    dynamicSurveyTypes = [surveyType.trim()]
  } else {
    const seenST = new Set()
    if (records && records.length > 0) {
      records.forEach((rec) => {
        (rec.survey_detail || []).forEach((s) => {
          const st = (s.survey_type || '').trim()
          if (st && !seenST.has(st)) {
            seenST.add(st)
            dynamicSurveyTypes.push(st)
          }
        })
      })
    }
    if (dynamicSurveyTypes.length === 0 && rows && rows.length > 0) {
      rows.forEach((r) => {
        let st = (r.surveyType || '').trim()
        if (st) {
          const baseSt = st.replace(/\s*\(.*?\)$/, '').trim()
          const finalSt = baseSt || st
          if (!seenST.has(finalSt)) {
            seenST.add(finalSt)
            dynamicSurveyTypes.push(finalSt)
          }
        }
      })
    }
  }

  /* ---------- build data rows with pivoted work & survey types ---------- */
  const dynamicTotals = {}
  dynamicWorkTypes.forEach((wt) => {
    dynamicTotals[`point_${wt}`] = 0
    dynamicTotals[`total_${wt}`] = 0
    dynamicTotals[`hrs_${wt}`] = 0
    dynamicTotals[`diesel_${wt}`] = 0
  })

  const dynamicSurveyTotals = {}
  dynamicSurveyTypes.forEach((st) => {
    dynamicSurveyTotals[`point_${st}`] = 0
    dynamicSurveyTotals[`total_${st}`] = 0
    dynamicSurveyTotals[`hrs_${st}`] = 0
    dynamicSurveyTotals[`diesel_${st}`] = 0
  })

  let machineDieselFilledSum = 0
  let machineDieselUsedSum = 0
  let compressorDieselFilledSum = 0
  let compressorDieselUsedSum = 0
  let staticSurveyPointSum = 0
  let staticSurveyTotalSum = 0
  let staticSurveyHrsSum = 0
  let staticSurveyDieselSum = 0
  let materialUsedQtySum = 0
  let grandTotalSum = 0

  let dataRows = []

  if (records && records.length > 0) {
    let globalSrNo = 1
    records.forEach((rec) => {
      let workDetails = rec.work_point_detail || []
      let surveyDetails = rec.survey_detail || []

      if (workType) {
        workDetails = workDetails.filter((w) => (w.work_type || '').toLowerCase() === workType.toLowerCase())
      }
      if (surveyType) {
        surveyDetails = surveyDetails.filter((s) => (s.survey_type || '').toLowerCase() === surveyType.toLowerCase())
      }

      const machineReadings = rec.machine_reading || rec.machineReading || []
      const compressorRpms = rec.compressor_rpm || rec.compressorRpm || []

      const effectiveMachine = machineReadings.length > 0 ? machineReadings : (
        (rec.machine_start != null || rec.machine_end != null || rec.actual_machine_hr != null) ? [{
          machine_start: rec.machine_start,
          machine_end: rec.machine_end,
          actual_machine_hr: rec.actual_machine_hr,
          diesel_filled: rec.machine_diesel_filled,
          diesel_used: rec.machine_diesel_used,
          diesel_balance: rec.machine_diesel_balance,
          diesel_avg: rec.machine_diesel_avg,
          machine: rec.machine,
          machinery: rec.machinery,
          machine_id: rec.machine_id,
          operator: rec.operator,
        }] : []
      )

      const effectiveCompressor = compressorRpms.length > 0 ? compressorRpms : (
        (rec.comp_rpm_start != null || rec.comp_rpm_end != null || rec.com_actul_hr != null) ? [{
          comp_rpm_start: rec.comp_rpm_start,
          comp_rpm_end: rec.comp_rpm_end,
          com_actul_hr: rec.com_actul_hr,
          diesel_filled: rec.comp_diesel_filled,
          diesel_used: rec.comp_diesel_used,
          diesel_balance: rec.comp_diesel_balance,
          diesel_avg: rec.comp_diesel_avg,
          machine: rec.compressor_machine || rec.comp_machine,
          machinery: rec.compressor_machinery,
          machine_id: rec.comp_machine_id,
        }] : []
      )

      const rotDetails = rec.rotary_details || rec.rotaryDetails || []
      const isRotary = rec.tab_type === 'rotary' || rotDetails.length > 0
      const tataDetails = rec.tata_details || rec.tataDetails || []
      const isTata = rec.tab_type === 'tata' || tataDetails.length > 0
      const rawMaterials = rec.uses_raw_material || rec.raw_materials || []

      // Rows for this record: driven by machine and compressor readings, since work & survey are in columns
      const totalRecRows = isRotary
        ? Math.max(rotDetails.length, 1)
        : (isTata ? Math.max(tataDetails.length, 1) : Math.max(effectiveMachine.length, effectiveCompressor.length, rawMaterials.length, 1))

      for (let i = 0; i < totalRecRows; i++) {
        const rowObj = {}

        if (isRotary) {
          const rot = rotDetails[i] || {}
          rowObj.srNo = i === 0 ? globalSrNo : ''
          rowObj.date = rot.date || rec.date
          rowObj.site = rec.project?.project_name || ''
          rowObj.supervisor = rot.site_engineer || rot.engineer?.name || rec.supervisor || rec.project?.supervisor?.name || '—'
          rowObj.operator = rot.operator_name || rot.operator?.name || rec.operator?.name || ''
          rowObj.machineName = rot.machine_no || rot.machine?.machine_name || (machineryMap && machineryMap[String(rot.machine_id)]) || '—'
          rowObj.machineStart = rot.open_reading_hr ?? ''
          rowObj.machineEnd = rot.closing_reading_hr ?? ''
          rowObj.machineHr = rot.total_hours ?? ''
          rowObj.machineDieselFilled = ''
          rowObj.machineDieselUsed = rot.diesel_lit ?? ''
          rowObj.machineDieselBalance = ''
          rowObj.machineDieselAvg = ''

          rowObj.compressorMachineName = '—'
          rowObj.compressorStart = ''
          rowObj.compressorEnd = ''
          rowObj.compressorHr = ''
          rowObj.compressorDieselFilled = ''
          rowObj.compressorDieselUsed = ''
          rowObj.compressorDieselBalance = ''
          rowObj.compressorDieselAvg = ''

          dynamicWorkTypes.forEach((wt) => {
            rowObj[`point_${wt}`] = ''
            rowObj[`rate_${wt}`] = ''
            rowObj[`total_${wt}`] = ''
            rowObj[`hrs_${wt}`] = ''
            rowObj[`diesel_${wt}`] = ''
          })

          dynamicSurveyTypes.forEach((st) => {
            rowObj[`survey_point_${st}`] = ''
            rowObj[`survey_rate_${st}`] = ''
            rowObj[`survey_total_${st}`] = ''
            rowObj[`survey_hrs_${st}`] = ''
            rowObj[`survey_diesel_${st}`] = ''
          })

          rowObj.surveyType = ''
          rowObj.surveyPoint = ''
          rowObj.surveyRate = ''
          rowObj.surveyTotal = ''
          rowObj.surveyHrs = ''
          rowObj.surveyDiesel = ''
          rowObj.rowTotal = 0

          machineDieselUsedSum += (parseFloat(rot.diesel_lit) || 0)
        } else if (isTata) {
          const tata = tataDetails[i] || {}
          rowObj.srNo = i === 0 ? globalSrNo : ''
          rowObj.date = tata.date || rec.date
          rowObj.site = tata.site_location || rec.project?.project_name || ''
          rowObj.supervisor = rec.supervisor || rec.project?.supervisor?.name || '—'
          rowObj.operator = tata.operator_name || tata.operator?.name || rec.operator?.name || ''
          rowObj.machineName = tata.machine_no || tata.machine?.machine_name || (machineryMap && machineryMap[String(tata.machine_id)]) || '—'
          rowObj.machineStart = tata.open_reading ?? ''
          rowObj.machineEnd = tata.closing_reading ?? ''
          rowObj.machineHr = tata.today_hours ?? ''
          rowObj.machineDieselFilled = ''
          rowObj.machineDieselUsed = tata.today_diesel_used ?? ''
          rowObj.machineDieselBalance = ''
          rowObj.machineDieselAvg = ''

          rowObj.compressorMachineName = '—'
          rowObj.compressorStart = ''
          rowObj.compressorEnd = ''
          rowObj.compressorHr = ''
          rowObj.compressorDieselFilled = ''
          rowObj.compressorDieselUsed = ''
          rowObj.compressorDieselBalance = ''
          rowObj.compressorDieselAvg = ''

          dynamicWorkTypes.forEach((wt) => {
            rowObj[`point_${wt}`] = ''
            rowObj[`rate_${wt}`] = ''
            rowObj[`total_${wt}`] = ''
            rowObj[`hrs_${wt}`] = ''
            rowObj[`diesel_${wt}`] = ''
          })

          dynamicSurveyTypes.forEach((st) => {
            rowObj[`survey_point_${st}`] = ''
            rowObj[`survey_rate_${st}`] = ''
            rowObj[`survey_total_${st}`] = ''
            rowObj[`survey_hrs_${st}`] = ''
            rowObj[`survey_diesel_${st}`] = ''
          })

          rowObj.surveyType = ''
          rowObj.surveyPoint = ''
          rowObj.surveyRate = ''
          rowObj.surveyTotal = ''
          rowObj.surveyHrs = ''
          rowObj.surveyDiesel = ''
          rowObj.rowTotal = 0

          machineDieselUsedSum += (parseFloat(tata.today_diesel_used) || 0)
        } else {
          const machine = effectiveMachine[i] || {}
          const compressorRpm = effectiveCompressor[i] || {}

          rowObj.srNo = i === 0 ? globalSrNo : ''
          rowObj.date = rec.date
          rowObj.site = rec.project?.project_name || ''
          rowObj.supervisor = rec.supervisor || rec.project?.supervisor?.name || '—'
          rowObj.operator = machine.operator?.name || rec.operator?.name || ''
          rowObj.machineName = machine.machine?.machine_name || machine.machinery?.machine_name || (machineryMap && machineryMap[String(machine.machine_id)]) || machine.machine_name || (i === 0 ? '—' : '')
          rowObj.machineStart = machine.machine_start ?? ''
          rowObj.machineEnd = machine.machine_end ?? ''
          rowObj.machineHr = machine.actual_machine_hr ?? ''
          rowObj.machineDieselFilled = machine.diesel_filled ?? ''
          rowObj.machineDieselUsed = machine.diesel_used ?? ''
          rowObj.machineDieselBalance = machine.diesel_balance ?? ''
          rowObj.machineDieselAvg = machine.diesel_avg ?? ''

          machineDieselFilledSum += (parseFloat(machine.diesel_filled) || 0)
          machineDieselUsedSum += (parseFloat(machine.diesel_used) || 0)

          rowObj.compressorMachineName = compressorRpm.machine?.machine_name || compressorRpm.machinery?.machine_name || (machineryMap && machineryMap[String(compressorRpm.machine_id)]) || compressorRpm.machine_name || (i === 0 ? '—' : '')
          rowObj.compressorStart = compressorRpm.comp_rpm_start ?? ''
          rowObj.compressorEnd = compressorRpm.comp_rpm_end ?? ''
          rowObj.compressorHr = compressorRpm.com_actul_hr ?? ''
          rowObj.compressorDieselFilled = compressorRpm.diesel_filled ?? ''
          rowObj.compressorDieselUsed = compressorRpm.diesel_used ?? ''
          rowObj.compressorDieselBalance = compressorRpm.diesel_balance ?? ''
          rowObj.compressorDieselAvg = compressorRpm.diesel_avg ?? ''

          compressorDieselFilledSum += (parseFloat(compressorRpm.diesel_filled) || 0)
          compressorDieselUsedSum += (parseFloat(compressorRpm.diesel_used) || 0)

          const mat = rawMaterials[i] || {}
          rowObj.materialName = mat.material?.name || mat.raw_material?.name || mat.material_name || ''
          rowObj.materialUsedQty = mat.used_qty ?? mat.used_quantity ?? ''
          materialUsedQtySum += (parseFloat(mat.used_qty ?? mat.used_quantity) || 0)

          let recordWorkTotal = 0

          // Dynamic work columns - populate on first row of record
          dynamicWorkTypes.forEach((wt) => {
            if (i === 0) {
              const matching = workDetails.filter((w) => (w.work_type || '').trim().toLowerCase() === wt.toLowerCase())
              if (matching.length > 0) {
                const p = matching.reduce((sum, w) => sum + (parseFloat(w.work_point) || 0), 0)
                const tot = matching.reduce((sum, w) => sum + (Number(w.total) || 0), 0)
                const h = matching.reduce((sum, w) => sum + (parseFloat(w.hrs) || 0), 0)
                const d = matching.reduce((sum, w) => sum + (parseFloat(w.diesel) || 0), 0)
                const r = matching.length === 1 ? matching[0].rate : (p > 0 ? (tot / p).toFixed(2) : matching[0].rate)

                const dtList = Array.from(new Set(matching.map((w) => w.drilling_type || w.drillingType).filter(Boolean))).join(', ')
                const uomList = Array.from(new Set(matching.map((w) => w.uom).filter(Boolean))).join(', ')

                rowObj[`drilling_type_${wt}`] = dtList || ''
                rowObj[`uom_${wt}`] = uomList || ''
                rowObj[`point_${wt}`] = p || ''
                rowObj[`rate_${wt}`] = r != null && r !== '' ? r : ''
                rowObj[`total_${wt}`] = tot || ''
                rowObj[`hrs_${wt}`] = h || ''
                rowObj[`diesel_${wt}`] = d || ''

                dynamicTotals[`point_${wt}`] += p
                dynamicTotals[`total_${wt}`] += tot
                dynamicTotals[`hrs_${wt}`] += h
                dynamicTotals[`diesel_${wt}`] += d

                recordWorkTotal += tot
              } else {
                rowObj[`drilling_type_${wt}`] = ''
                rowObj[`uom_${wt}`] = ''
                rowObj[`point_${wt}`] = ''
                rowObj[`rate_${wt}`] = ''
                rowObj[`total_${wt}`] = ''
                rowObj[`hrs_${wt}`] = ''
                rowObj[`diesel_${wt}`] = ''
              }
            } else {
              rowObj[`drilling_type_${wt}`] = ''
              rowObj[`uom_${wt}`] = ''
              rowObj[`point_${wt}`] = ''
              rowObj[`rate_${wt}`] = ''
              rowObj[`total_${wt}`] = ''
              rowObj[`hrs_${wt}`] = ''
              rowObj[`diesel_${wt}`] = ''
            }
          })

          let recordSurveyTotal = 0

          // Dynamic survey columns - populate on first row of record
          if (dynamicSurveyTypes.length > 0) {
            dynamicSurveyTypes.forEach((st) => {
              if (i === 0) {
                const matching = surveyDetails.filter((s) => (s.survey_type || '').trim().toLowerCase() === st.toLowerCase())
                if (matching.length > 0) {
                  const p = matching.reduce((sum, s) => sum + (parseFloat(s.survey_point) || 0), 0)
                  const tot = matching.reduce((sum, s) => sum + (Number(s.total) || 0), 0)
                  const h = matching.reduce((sum, s) => sum + (parseFloat(s.hrs) || 0), 0)
                  const d = matching.reduce((sum, s) => sum + (parseFloat(s.diesel) || 0), 0)
                  const r = matching.length === 1 ? matching[0].rate : (p > 0 ? (tot / p).toFixed(2) : matching[0].rate)

                  rowObj[`survey_point_${st}`] = p || ''
                  rowObj[`survey_rate_${st}`] = r != null && r !== '' ? r : ''
                  rowObj[`survey_total_${st}`] = tot || ''
                  rowObj[`survey_hrs_${st}`] = h || ''
                  rowObj[`survey_diesel_${st}`] = d || ''

                  dynamicSurveyTotals[`point_${st}`] += p
                  dynamicSurveyTotals[`total_${st}`] += tot
                  dynamicSurveyTotals[`hrs_${st}`] += h
                  dynamicSurveyTotals[`diesel_${st}`] += d

                  recordSurveyTotal += tot
                } else {
                  rowObj[`survey_point_${st}`] = ''
                  rowObj[`survey_rate_${st}`] = ''
                  rowObj[`survey_total_${st}`] = ''
                  rowObj[`survey_hrs_${st}`] = ''
                  rowObj[`survey_diesel_${st}`] = ''
                }
              } else {
                rowObj[`survey_point_${st}`] = ''
                rowObj[`survey_rate_${st}`] = ''
                rowObj[`survey_total_${st}`] = ''
                rowObj[`survey_hrs_${st}`] = ''
                rowObj[`survey_diesel_${st}`] = ''
              }
            })
          } else {
            // Fallback for static survey columns if no dynamic survey types
            const survey = surveyDetails[i] || {}
            const sTotal = Number(survey.total) || 0
            rowObj.surveyType = survey.survey_type || ''
            rowObj.surveyPoint = survey.survey_point || ''
            rowObj.surveyRate = survey.rate || ''
            rowObj.surveyTotal = sTotal || ''
            rowObj.surveyHrs = survey.hrs ?? ''
            rowObj.surveyDiesel = survey.diesel ?? ''

            staticSurveyPointSum += (parseFloat(survey.survey_point) || 0)
            staticSurveyTotalSum += sTotal
            staticSurveyHrsSum += (parseFloat(survey.hrs) || 0)
            staticSurveyDieselSum += (parseFloat(survey.diesel) || 0)
            recordSurveyTotal += sTotal
          }

          const rowTot = (i === 0 ? (recordWorkTotal + recordSurveyTotal) : 0)
          rowObj.rowTotal = rowTot || ''
          grandTotalSum += rowTot
        }

        dataRows.push(rowObj)
      }
      globalSrNo++
    })
  } else if (rows && rows.length > 0) {
    // Fallback if records is not provided but rows is
    const grouped = new Map()
    rows.forEach((r) => {
      const key = r.drillingRecordId != null ? String(r.drillingRecordId) : (r.srNo != null ? `sr_${r.srNo}` : `row_${Math.random()}`)
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key).push(r)
    })

    let globalSrNo = 1
    grouped.forEach((rowList) => {
      const baseRow = rowList[0]
      const rowObj = { ...baseRow }
      rowObj.srNo = globalSrNo++

      dynamicWorkTypes.forEach((wt) => {
        rowObj[`drilling_type_${wt}`] = ''
        rowObj[`uom_${wt}`] = ''
        rowObj[`point_${wt}`] = ''
        rowObj[`rate_${wt}`] = ''
        rowObj[`total_${wt}`] = ''
        rowObj[`hrs_${wt}`] = ''
        rowObj[`diesel_${wt}`] = ''
      })

      dynamicSurveyTypes.forEach((st) => {
        rowObj[`survey_point_${st}`] = ''
        rowObj[`survey_rate_${st}`] = ''
        rowObj[`survey_total_${st}`] = ''
        rowObj[`survey_hrs_${st}`] = ''
        rowObj[`survey_diesel_${st}`] = ''
      })

      let recWorkTot = 0
      let recSurveyTot = 0

      rowList.forEach((r) => {
        const wt = (r.workType || '').replace(/\s*\(.*?\)$/, '').trim()
        if (wt && dynamicWorkTypes.includes(wt)) {
          const p = parseFloat(r.workPoint) || 0
          const tot = Number(r.workTotal) || 0
          const h = parseFloat(r.workHrs) || 0
          const d = parseFloat(r.workDiesel) || 0

          const dt = r.drillingType || ''
          const uom = r.uom || ''
          if (dt) {
            const existingDt = rowObj[`drilling_type_${wt}`]
            if (!existingDt) rowObj[`drilling_type_${wt}`] = dt
            else if (!existingDt.split(', ').includes(dt)) rowObj[`drilling_type_${wt}`] += `, ${dt}`
          }
          if (uom) {
            const existingUom = rowObj[`uom_${wt}`]
            if (!existingUom) rowObj[`uom_${wt}`] = uom
            else if (!existingUom.split(', ').includes(uom)) rowObj[`uom_${wt}`] += `, ${uom}`
          }

          rowObj[`point_${wt}`] = (parseFloat(rowObj[`point_${wt}`]) || 0) + p || ''
          rowObj[`rate_${wt}`] = r.workRate || rowObj[`rate_${wt}`] || ''
          rowObj[`total_${wt}`] = (Number(rowObj[`total_${wt}`]) || 0) + tot || ''
          rowObj[`hrs_${wt}`] = (parseFloat(rowObj[`hrs_${wt}`]) || 0) + h || ''
          rowObj[`diesel_${wt}`] = (parseFloat(rowObj[`diesel_${wt}`]) || 0) + d || ''

          dynamicTotals[`point_${wt}`] += p
          dynamicTotals[`total_${wt}`] += tot
          dynamicTotals[`hrs_${wt}`] += h
          dynamicTotals[`diesel_${wt}`] += d
          recWorkTot += tot
        }

        const st = (r.surveyType || '').replace(/\s*\(.*?\)$/, '').trim()
        if (st && dynamicSurveyTypes.includes(st)) {
          const p = parseFloat(r.surveyPoint) || 0
          const tot = Number(r.surveyTotal) || 0
          const h = parseFloat(r.surveyHrs) || 0
          const d = parseFloat(r.surveyDiesel) || 0

          rowObj[`survey_point_${st}`] = (parseFloat(rowObj[`survey_point_${st}`]) || 0) + p || ''
          rowObj[`survey_rate_${st}`] = r.surveyRate || rowObj[`survey_rate_${st}`] || ''
          rowObj[`survey_total_${st}`] = (Number(rowObj[`survey_total_${st}`]) || 0) + tot || ''
          rowObj[`survey_hrs_${st}`] = (parseFloat(rowObj[`survey_hrs_${st}`]) || 0) + h || ''
          rowObj[`survey_diesel_${st}`] = (parseFloat(rowObj[`survey_diesel_${st}`]) || 0) + d || ''

          dynamicSurveyTotals[`point_${st}`] += p
          dynamicSurveyTotals[`total_${st}`] += tot
          dynamicSurveyTotals[`hrs_${st}`] += h
          dynamicSurveyTotals[`diesel_${st}`] += d
          recSurveyTot += tot
        }
      })

      machineDieselFilledSum += (parseFloat(baseRow.machineDieselFilled) || 0)
      machineDieselUsedSum += (parseFloat(baseRow.machineDieselUsed) || 0)
      compressorDieselFilledSum += (parseFloat(baseRow.compressorDieselFilled) || 0)
      compressorDieselUsedSum += (parseFloat(baseRow.compressorDieselUsed) || 0)

      if (dynamicSurveyTypes.length === 0) {
        staticSurveyPointSum += (parseFloat(baseRow.surveyPoint) || 0)
        staticSurveyTotalSum += (Number(baseRow.surveyTotal) || 0)
        staticSurveyHrsSum += (parseFloat(baseRow.surveyHrs) || 0)
        staticSurveyDieselSum += (parseFloat(baseRow.surveyDiesel) || 0)
        recSurveyTot = Number(baseRow.surveyTotal) || 0
      }

      const rowTot = recWorkTot + recSurveyTot
      rowObj.rowTotal = rowTot || ''
      rowObj.materialName = baseRow.materialName || ''
      rowObj.materialUsedQty = baseRow.materialUsedQty || ''
      materialUsedQtySum += (parseFloat(baseRow.materialUsedQty) || 0)
      grandTotalSum += rowTot

      dataRows.push(rowObj)
    })
  }

  /* ---------- column definitions with dynamic work types ---------- */
  const C = (group, header, width, type, get, total, align) => ({
    group, header, width, type, get, total: total || (() => ''), align,
  })

  const cols = [
    C('Entry', 'Sr.No.', 7, 'int', (r) => r.srNo, () => 'TOTAL', 'center'),
    C('Entry', 'Date', 12, 'text', (r) => dateStr(r.date)),
    C('Entry', 'Site', 16, 'text', (r) => txt(r.site)),
    C('Entry', 'Supervisor', 16, 'text', (r) => txt(r.supervisor)),
    C('Entry', 'Operator/Helper', 16, 'text', (r) => txt(r.operator)),
    C('Entry', 'Machine Name', 14, 'text', (r) => txt(r.machineName)),

    C('Machine Diesel', 'Start', 10, 'num', (r) => num(r.machineStart)),
    C('Machine Diesel', 'End', 10, 'num', (r) => num(r.machineEnd)),
    C('Machine Diesel', 'Hours', 9, 'num', (r) => num(r.machineHr)),
    C('Machine Diesel', 'Diesel Filled', 12, 'num', (r) => num(r.machineDieselFilled), () => num(machineDieselFilledSum || T.machineDieselFilled)),
    C('Machine Diesel', 'Diesel Used', 12, 'num', (r) => num(r.machineDieselUsed), () => num(machineDieselUsedSum || T.machineDieselUsed)),
    C('Machine Diesel', 'Balance', 11, 'num', (r) => num(r.machineDieselBalance)),
    C('Machine Diesel', 'Avg', 10, 'num', (r) => num(r.machineDieselAvg)),

    C('Compressor Diesel', 'Machine', 14, 'text', (r) => txt(pick(r, 'compressorMachineName', 'compMachineName'))),
    C('Compressor Diesel', 'Start', 10, 'num', (r) => num(pick(r, 'compressorStart', 'compStart'))),
    C('Compressor Diesel', 'End', 10, 'num', (r) => num(pick(r, 'compressorEnd', 'compEnd'))),
    C('Compressor Diesel', 'Hours', 9, 'num', (r) => num(pick(r, 'compressorHr', 'compHr'))),
    C('Compressor Diesel', 'Diesel Filled', 12, 'num', (r) => num(pick(r, 'compressorDieselFilled', 'compDieselFilled')), () => num(compressorDieselFilledSum || T.compressorDieselFilled)),
    C('Compressor Diesel', 'Diesel Used', 12, 'num', (r) => num(pick(r, 'compressorDieselUsed', 'compDieselUsed')), () => num(compressorDieselUsedSum || T.compressorDieselUsed)),
    C('Compressor Diesel', 'Balance', 11, 'num', (r) => num(pick(r, 'compressorDieselBalance', 'compDieselBalance'))),
    C('Compressor Diesel', 'Avg', 10, 'num', (r) => num(pick(r, 'compressorDieselAvg', 'compDieselAvg'))),
  ]

  // Dynamic Work Types: separate columns per work type
  if (dynamicWorkTypes.length > 0) {
    dynamicWorkTypes.forEach((wt) => {
      cols.push(
        C(wt, 'Drilling Type', 14, 'text', (r) => txt(r[`drilling_type_${wt}`])),
        C(wt, 'UOM', 10, 'text', (r) => txt(r[`uom_${wt}`])),
        C(wt, `${wt} Point`, 13, 'num', (r) => num(r[`point_${wt}`]), () => num(dynamicTotals[`point_${wt}`])),
        C(wt, 'Rate', 10, 'num', (r) => num(r[`rate_${wt}`])),
        C(wt, 'Total work', 13, 'num', (r) => num(r[`total_${wt}`]), () => num(dynamicTotals[`total_${wt}`])),
        C(wt, 'work Hrs', 10, 'num', (r) => num(r[`hrs_${wt}`]), () => num(dynamicTotals[`hrs_${wt}`])),
        C(wt, 'work Disel', 11, 'num', (r) => num(r[`diesel_${wt}`]), () => num(dynamicTotals[`diesel_${wt}`]))
      )
    })
  } else {
    // Fallback if no dynamic work types
    cols.push(
      C('Work', 'Type', 14, 'text', (r) => txt(r.workType)),
      C('Work', 'Drilling Type', 14, 'text', (r) => txt(r.drillingType)),
      C('Work', 'UOM', 10, 'text', (r) => txt(r.uom)),
      C('Work', 'Points', 9, 'num', (r) => num(r.workPoint), () => num(T.workPoint)),
      C('Work', 'Rate', 10, 'num', (r) => num(r.workRate)),
      C('Work', 'Total', 13, 'num', (r) => num(r.workTotal), () => num(T.workTotal)),
      C('Work', 'Hours', 9, 'num', (r) => num(r.workHrs), () => num(T.workHrs)),
      C('Work', 'Diesel', 10, 'num', (r) => num(r.workDiesel), () => num(T.workDiesel))
    )
  }

  // Dynamic Survey Types: 5 separate columns per survey type
  if (dynamicSurveyTypes.length > 0) {
    dynamicSurveyTypes.forEach((st) => {
      cols.push(
        C(st, `${st} Point`, 13, 'num', (r) => num(r[`survey_point_${st}`]), () => num(dynamicSurveyTotals[`point_${st}`])),
        C(st, 'Rate', 10, 'num', (r) => num(r[`survey_rate_${st}`])),
        C(st, 'Total work', 13, 'num', (r) => num(r[`survey_total_${st}`]), () => num(dynamicSurveyTotals[`total_${st}`])),
        C(st, 'work Hrs', 10, 'num', (r) => num(r[`survey_hrs_${st}`]), () => num(dynamicSurveyTotals[`hrs_${st}`])),
        C(st, 'work Disel', 11, 'num', (r) => num(r[`survey_diesel_${st}`]), () => num(dynamicSurveyTotals[`diesel_${st}`]))
      )
    })
  } else {
    // Fallback if no dynamic survey types
    cols.push(
      C('Survey', 'Type', 14, 'text', (r) => txt(r.surveyType)),
      C('Survey', 'Points', 9, 'num', (r) => num(r.surveyPoint), () => num(staticSurveyPointSum || T.surveyPoint)),
      C('Survey', 'Rate', 10, 'num', (r) => num(r.surveyRate)),
      C('Survey', 'Total', 13, 'num', (r) => num(r.surveyTotal), () => num(staticSurveyTotalSum || T.surveyTotal)),
      C('Survey', 'Hours', 9, 'num', (r) => num(r.surveyHrs), () => num(staticSurveyHrsSum || T.surveyHrs)),
      C('Survey', 'Diesel', 10, 'num', (r) => num(r.surveyDiesel), () => num(staticSurveyDieselSum || T.surveyDiesel))
    )
  }

  // Raw Material columns
  cols.push(
    C('Raw Material', 'Material Name', 14, 'text', (r) => txt(r.materialName)),
    C('Raw Material', 'Used Qty', 10, 'num', (r) => num(r.materialUsedQty), () => num(materialUsedQtySum)),
  )

  // Grand Total column
  cols.push(
    C('Grand', 'Grand Total', 14, 'num', (r) => num(r.rowTotal), () => num(grandTotalSum || T.grandTotal))
  )

  const N = cols.length
  const ws = {}
  const merges = []
  let r = 0

  const put = (row, col, value, style, fmt) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    if (value === '' || value === null || value === undefined) {
      ws[addr] = { t: 's', v: '', s: style }
      return
    }
    const t = typeof value === 'number' ? 'n' : 's'
    ws[addr] = { t, v: value, s: style }
    if (t === 'n' && fmt) ws[addr].z = fmt
  }

  const mergeAcross = (row, from, to) => {
    if (to > from) merges.push({ s: { r: row, c: from }, e: { r: row, c: to } })
  }

  /* ---------- title block ---------- */
  const titleStyle = {
    font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: NAVY } },
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  }
  for (let c = 0; c < N; c++) put(r, c, c === 0 ? 'Work Log Report' : '', titleStyle)
  mergeAcross(r, 0, N - 1)
  ws['!rows'] = [{ hpt: 30 }]
  r++

  if (companyInfo.name || companyInfo.company_name) {
    const companyDisplayName = companyInfo.company_name || companyInfo.name
    const subStyle = styleFor({ color: MUTED, size: 10 })
    put(r, 0, companyDisplayName, { ...subStyle, font: { ...subStyle.font, bold: true, color: { rgb: NAVY } } })
    mergeAcross(r, 0, N - 1)
    r++
  }

  /* ---------- applied filters ---------- */
  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)
  if (workType) filters.push(`Work Type: ${workType}`)
  if (surveyType) filters.push(`Survey Type: ${surveyType}`)

  if (filters.length) {
    filters.forEach((f) => {
      put(r, 0, f, styleFor({ color: MUTED, size: 9 }))
      r++
    })
  }
  r++ // spacer row

  /* ---------- group band ---------- */
  const groups = []
  cols.forEach((c, i) => {
    const last = groups[groups.length - 1]
    if (last && last.name === c.group) last.end = i
    else groups.push({ name: c.group, start: i, end: i })
  })
  groups.forEach((g) => {
    for (let c = g.start; c <= g.end; c++) {
      put(r, c, c === g.start ? g.name : '', styleFor({ fill: NAVY, bold: true, color: 'FFFFFF', align: 'center', size: 10 }))
    }
    mergeAcross(r, g.start, g.end)
  })
  r++

  /* ---------- header row ---------- */
  cols.forEach((c, i) => {
    put(r, i, c.header, styleFor({ fill: HEAD, bold: true, color: 'FFFFFF', align: 'center' }))
  })
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][r] = { hpt: 30 }
  r++

  /* ---------- data rows ---------- */
  if (!dataRows.length) {
    put(r, 0, 'No work log entries match the selected filters.', styleFor({ color: MUTED, size: 10 }))
    r++
  } else {
    dataRows.forEach((row, ri) => {
      const fill = ri % 2 === 1 ? ZEBRA : undefined
      cols.forEach((c, i) => {
        const highlight = c.header === 'Total' || c.header === 'Grand Total' || c.header === 'Total work'
        const align = c.align || (c.type === 'text' ? 'left' : 'right')
        put(
          r, i, c.get(row),
          styleFor({ fill, align, bold: highlight, color: highlight ? GREEN : INK }),
          c.type === 'num' ? NUM_FMT : undefined
        )
      })
      r++
    })
  }

  /* ---------- totals row ---------- */
  cols.forEach((c, i) => {
    const align = c.align || (c.type === 'text' ? 'left' : 'right')
    put(r, i, c.total(T), styleFor({ fill: TOTAL, bold: true, align }), c.type === 'num' ? NUM_FMT : undefined)
  })
  r++

  /* ---------- sheet settings ---------- */
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: N - 1 } })
  ws['!merges'] = merges
  ws['!cols'] = cols.map((c) => ({ wch: c.width }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws, 'WorkLogReport')
  XLSX.writeFile(workbook, fileName)
}

export const downloadWorkLogPDF = ({
  rows = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  surveyType,
  companyInfo = {},
  host,
  fileName = 'WorkLogReport.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a3')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  const NAVY = [31, 56, 100]
  const NAVY_LIGHT = [52, 73, 94]
  const INK = [30, 35, 40]
  const MUTED = [110, 118, 128]
  const GREEN = [0, 128, 0]
  const TOTAL_FILL = [226, 232, 240]

  const T = tableTotals

  /* ---------- helpers ---------- */
  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'

  const pick = (row, ...keys) => {
    for (const k of keys) {
      if (!isEmpty(row[k])) return row[k]
    }
    return ''
  }

  const fmt = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n)
      ? ''
      : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')

  /* ---------- column definitions (all 34 original columns) ---------- */
  const C = (g, h, get, total = () => '', align = 'center') => ({ g, h, get, total, align })

  const cols = [
    // Entry
    C('Entry', 'Sr', (r) => r.srNo, () => 'TOTAL'),
    C('Entry', 'Date', (r) => dateStr(r.date)),
    C('Entry', 'Site', (r) => txt(r.site), undefined, 'left'),
    C('Entry', 'Supervisor', (r) => txt(r.supervisor), undefined, 'left'),
    C('Entry', 'Operator', (r) => txt(r.operator), undefined, 'left'),
    C('Entry', 'Machine', (r) => txt(r.machineName), undefined, 'left'),

    // Machine diesel
    C('Machine', 'Start', (r) => fmt(r.machineStart)),
    C('Machine', 'End', (r) => fmt(r.machineEnd)),
    C('Machine', 'Hours', (r) => fmt(r.machineHr)),
    C('Machine', 'Diesel Filled', (r) => fmt(r.machineDieselFilled), () => fmt(T.machineDieselFilled)),
    C('Machine', 'Diesel Used', (r) => fmt(r.machineDieselUsed), () => fmt(T.machineDieselUsed)),
    C('Machine', 'Balance', (r) => fmt(r.machineDieselBalance)),
    C('Machine', 'Avg', (r) => fmt(r.machineDieselAvg)),

    // Compressor diesel
    C('Compressor', 'Name', (r) => txt(pick(r, 'compressorMachineName', 'compMachineName')), undefined, 'left'),
    C('Compressor', 'Start', (r) => fmt(pick(r, 'compressorStart', 'compStart'))),
    C('Compressor', 'End', (r) => fmt(pick(r, 'compressorEnd', 'compEnd'))),
    C('Compressor', 'Hours', (r) => fmt(pick(r, 'compressorHr', 'compHr'))),
    C('Compressor', 'Diesel Filled', (r) => fmt(pick(r, 'compressorDieselFilled', 'compDieselFilled')), () => fmt(T.compressorDieselFilled)),
    C('Compressor', 'Diesel Used', (r) => fmt(pick(r, 'compressorDieselUsed', 'compDieselUsed')), () => fmt(T.compressorDieselUsed)),
    C('Compressor', 'Balance', (r) => fmt(pick(r, 'compressorDieselBalance', 'compDieselBalance'))),
    C('Compressor', 'Avg', (r) => fmt(pick(r, 'compressorDieselAvg', 'compDieselAvg'))),

    // Work
    C('Work', 'Type', (r) => txt(r.workType), undefined, 'left'),
    C('Work', 'Points', (r) => fmt(r.workPoint), () => fmt(T.workPoint)),
    C('Work', 'Rate', (r) => fmt(r.workRate)),
    C('Work', 'Total', (r) => fmt(r.workTotal), () => fmt(T.workTotal)),
    C('Work', 'Hours', (r) => fmt(r.workHrs), () => fmt(T.workHrs)),
    C('Work', 'Diesel', (r) => fmt(r.workDiesel), () => fmt(T.workDiesel)),

    // Survey
    C('Survey', 'Type', (r) => txt(r.surveyType), undefined, 'left'),
    C('Survey', 'Points', (r) => fmt(r.surveyPoint), () => fmt(T.surveyPoint)),
    C('Survey', 'Rate', (r) => fmt(r.surveyRate)),
    C('Survey', 'Total', (r) => fmt(r.surveyTotal), () => fmt(T.surveyTotal)),
    C('Survey', 'Hours', (r) => fmt(r.surveyHrs), () => fmt(T.surveyHrs)),
    C('Survey', 'Diesel', (r) => fmt(r.surveyDiesel), () => fmt(T.surveyDiesel)),

    // Raw Material
    C('Raw Material', 'Material', (r) => txt(r.materialName), undefined, 'left'),
    C('Raw Material', 'Used Qty', (r) => fmt(r.materialUsedQty)),

    // Grand total
    C('Total', 'Grand Total', (r) => fmt(r.rowTotal), () => fmt(T.grandTotal)),
  ]

  /* ---------- header ---------- */
  const drawHeader = () =>
    drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Work Log Report',
    })

  const headerBottomY = drawHeader()
  let y = headerBottomY

  /* ---------- applied filters ---------- */
  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)
  if (workType) filters.push(`Work Type: ${workType}`)
  if (surveyType) filters.push(`Survey Type: ${surveyType}`)

  if (filters.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(`Applied Filters:  ${filters.join('     |     ')}`, margin, y)
    y += 7
  }

  /* ---------- table ---------- */
  if (!rows.length) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No work log entries match the selected filters.', margin, y + 10)
  } else {
    const groupRow = []
    cols.forEach((c) => {
      const last = groupRow[groupRow.length - 1]
      if (last && last.key === c.g) {
        last.colSpan += 1
      } else {
        groupRow.push({ key: c.g, content: c.g, colSpan: 1 })
      }
    })
    const headGroup = groupRow.map(({ content, colSpan }) => ({ content, colSpan }))
    const headLabels = cols.map((c) => c.h)

    const body = rows.map((r) => cols.map((c) => c.get(r)))
    const totalRow = cols.map((c) => c.total(T))
    const allBody = [...body, totalRow]

    const leftCols = cols.reduce((acc, c, i) => {
      if (c.align === 'left') acc[i] = { halign: 'left' }
      return acc
    }, {})

    const grandTotalIndex = cols.length - 1
    const totalsIndex = [
      cols.findIndex((c) => c.h === 'Total' && c.g === 'Work'),
      cols.findIndex((c) => c.h === 'Total' && c.g === 'Survey'),
      grandTotalIndex,
    ]

    doc.autoTable({
      head: [headGroup, headLabels],
      body: allBody,
      startY: y,
      theme: 'grid',
      margin: { top: headerBottomY, left: margin, right: margin, bottom: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 6.8,
        cellPadding: 1,
        halign: 'center',
        valign: 'middle',
        textColor: INK,
        lineColor: [200, 205, 212],
        lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: NAVY_LIGHT,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: leftCols,
      didParseCell: (data) => {
        if (data.section === 'head' && data.row.index === 0) {
          data.cell.styles.fillColor = NAVY
          data.cell.styles.fontSize = 7.5
          return
        }
        if (data.section !== 'body') return

        const isTotalRow = data.row.index === allBody.length - 1
        if (isTotalRow) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = TOTAL_FILL
        } else if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [246, 248, 251]
        }

        if (totalsIndex.includes(data.column.index) && !isTotalRow) {
          data.cell.styles.textColor = GREEN
          data.cell.styles.fontStyle = 'bold'
        }
      },
      addPageContent: () => drawHeader(),
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
    })

    y = doc.lastAutoTable.finalY + 6
  }

  /* ---------- footer with page numbers ---------- */
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-GB')}`,
      margin,
      pageHeight - 6
    )
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, {
      align: 'right',
    })
  }

  doc.save(fileName)
}

// ─────────────────────────────────────────────────────────────────
// 2. SEPARATE DRILLING WORK LOG REPORT EXPORTS
// ─────────────────────────────────────────────────────────────────

export const downloadDrillingExcel = ({
  rows = [],
  records = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  drillingType,
  surveyType,
  machineryMap = {},
  companyInfo = {},
  fileName = 'Drilling_WorkLog_Report.xlsx',
}) => {
  const T = tableTotals

  const NAVY = '1F3864'
  const HEAD = '344A5E'
  const ZEBRA = 'F6F8FB'
  const TOTAL = 'E2E8F0'
  const GREEN = '008000'
  const INK = '1E2328'
  const MUTED = '6E7680'
  const LINE = 'C8CDD4'

  const NUM_FMT = '[>=10000000]##\\,##\\,##\\,##0.00;[>=100000]##\\,##\\,##0.00;##,##0.00'

  const thin = { style: 'thin', color: { rgb: LINE } }
  const border = { top: thin, bottom: thin, left: thin, right: thin }

  const styleFor = ({ fill, bold = false, color = INK, align = 'left', size = 9 } = {}) => ({
    font: { name: 'Calibri', sz: size, bold, color: { rgb: color } },
    fill: fill ? { patternType: 'solid', fgColor: { rgb: fill } } : undefined,
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border,
  })

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const num = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => {
    if (!d) return ''
    try {
      const parts = String(d).split('T')[0].split('-')
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`
      }
      return new Date(d).toLocaleDateString('en-GB')
    } catch {
      return String(d)
    }
  }
  const pick = (row, ...keys) => {
    for (const k of keys) if (!isEmpty(row[k])) return row[k]
    return ''
  }

  /* ---------- dynamic work & survey types detection ---------- */
  let dynamicWorkTypes = []
  if (workType) {
    dynamicWorkTypes = [workType.trim()]
  } else {
    const seenWT = new Set()
    if (records && records.length > 0) {
      records.forEach((rec) => {
        (rec.work_point_detail || []).forEach((w) => {
          if (drillingType && (w.drilling_type || '').toLowerCase() !== drillingType.toLowerCase()) return
          const wt = (w.work_type || '').trim()
          if (wt && !seenWT.has(wt)) {
            seenWT.add(wt)
            dynamicWorkTypes.push(wt)
          }
        })
      })
    }
    if (dynamicWorkTypes.length === 0 && rows && rows.length > 0) {
      rows.forEach((r) => {
        let wt = (r.workType || '').trim()
        if (wt && wt !== 'Rotary Work') {
          const baseWt = wt.replace(/\s*\(.*?\)$/, '').trim()
          const finalWt = baseWt || wt
          if (!seenWT.has(finalWt)) {
            seenWT.add(finalWt)
            dynamicWorkTypes.push(finalWt)
          }
        }
      })
    }
  }

  let dynamicSurveyTypes = []
  if (surveyType) {
    dynamicSurveyTypes = [surveyType.trim()]
  } else {
    const seenST = new Set()
    if (records && records.length > 0) {
      records.forEach((rec) => {
        (rec.survey_detail || []).forEach((s) => {
          const st = (s.survey_type || '').trim()
          if (st && !seenST.has(st)) {
            seenST.add(st)
            dynamicSurveyTypes.push(st)
          }
        })
      })
    }
    if (dynamicSurveyTypes.length === 0 && rows && rows.length > 0) {
      rows.forEach((r) => {
        let st = (r.surveyType || '').trim()
        if (st) {
          const baseSt = st.replace(/\s*\(.*?\)$/, '').trim()
          const finalSt = baseSt || st
          if (!seenST.has(finalSt)) {
            seenST.add(finalSt)
            dynamicSurveyTypes.push(finalSt)
          }
        }
      })
    }
  }

  /* ---------- build data rows with pivoted work & survey types ---------- */
  const dynamicTotals = {}
  dynamicWorkTypes.forEach((wt) => {
    dynamicTotals[`point_${wt}`] = 0
    dynamicTotals[`total_${wt}`] = 0
    dynamicTotals[`hrs_${wt}`] = 0
    dynamicTotals[`diesel_${wt}`] = 0
  })

  const dynamicSurveyTotals = {}
  dynamicSurveyTypes.forEach((st) => {
    dynamicSurveyTotals[`point_${st}`] = 0
    dynamicSurveyTotals[`total_${st}`] = 0
    dynamicSurveyTotals[`hrs_${st}`] = 0
    dynamicSurveyTotals[`diesel_${st}`] = 0
  })

  let machineDieselFilledSum = 0
  let machineDieselUsedSum = 0
  let compressorDieselFilledSum = 0
  let compressorDieselUsedSum = 0
  let staticSurveyPointSum = 0
  let staticSurveyTotalSum = 0
  let staticSurveyHrsSum = 0
  let staticSurveyDieselSum = 0
  let materialUsedQtySum = 0
  let grandTotalSum = 0

  let dataRows = []

  if (records && records.length > 0) {
    let globalSrNo = 1
    records.forEach((rec) => {
      let workDetails = rec.work_point_detail || []
      let surveyDetails = rec.survey_detail || []

      if (drillingType) {
        workDetails = workDetails.filter((w) => (w.drilling_type || '').toLowerCase() === drillingType.toLowerCase())
      }
      if (workType) {
        workDetails = workDetails.filter((w) => (w.work_type || '').toLowerCase() === workType.toLowerCase())
      }
      if (surveyType) {
        surveyDetails = surveyDetails.filter((s) => (s.survey_type || '').toLowerCase() === surveyType.toLowerCase())
      }

      if (drillingType && workDetails.length === 0) return

      const machineReadings = rec.machine_reading || rec.machineReading || []
      const compressorRpms = rec.compressor_rpm || rec.compressorRpm || []

      const effectiveMachine = machineReadings.length > 0 ? machineReadings : (
        (rec.machine_start != null || rec.machine_end != null || rec.actual_machine_hr != null) ? [{
          machine_start: rec.machine_start,
          machine_end: rec.machine_end,
          actual_machine_hr: rec.actual_machine_hr,
          diesel_filled: rec.machine_diesel_filled,
          diesel_used: rec.machine_diesel_used,
          diesel_balance: rec.machine_diesel_balance,
          diesel_avg: rec.machine_diesel_avg,
          machine: rec.machine,
          machinery: rec.machinery,
          machine_id: rec.machine_id,
          operator: rec.operator,
        }] : []
      )

      const effectiveCompressor = compressorRpms.length > 0 ? compressorRpms : (
        (rec.comp_rpm_start != null || rec.comp_rpm_end != null || rec.com_actul_hr != null) ? [{
          comp_rpm_start: rec.comp_rpm_start,
          comp_rpm_end: rec.comp_rpm_end,
          com_actul_hr: rec.com_actul_hr,
          diesel_filled: rec.comp_diesel_filled,
          diesel_used: rec.comp_diesel_used,
          diesel_balance: rec.comp_diesel_balance,
          diesel_avg: rec.comp_diesel_avg,
          machine: rec.compressor_machine || rec.comp_machine,
          machinery: rec.compressor_machinery,
          machine_id: rec.comp_machine_id,
        }] : []
      )

      const rawMaterials = rec.uses_raw_material || rec.raw_materials || []
      const totalRecRows = Math.max(effectiveMachine.length, effectiveCompressor.length, rawMaterials.length, 1)

      for (let i = 0; i < totalRecRows; i++) {
        const machine = effectiveMachine[i] || {}
        const compressorRpm = effectiveCompressor[i] || {}
        const mat = rawMaterials[i] || {}
        const rowObj = {}

        rowObj.srNo = i === 0 ? globalSrNo : ''
        rowObj.date = rec.date
        rowObj.site = rec.project?.project_name || rec.site_name || ''
        rowObj.supervisor = rec.supervisor || rec.project?.supervisor?.name || '—'
        rowObj.operator = machine.operator?.name || rec.operator?.name || ''
        rowObj.timing = rec.start_time && rec.end_time ? `${rec.start_time} - ${rec.end_time}` : (rec.timing || '—')
        rowObj.machineName = machine.machine?.machine_name || machine.machinery?.machine_name || (machineryMap && machineryMap[String(machine.machine_id)]) || machine.machine_name || (i === 0 ? '—' : '')
        rowObj.machineStart = machine.machine_start ?? ''
        rowObj.machineEnd = machine.machine_end ?? ''
        rowObj.machineHr = machine.actual_machine_hr ?? ''
        rowObj.machineDieselFilled = machine.diesel_filled ?? ''
        rowObj.machineDieselUsed = machine.diesel_used ?? ''
        rowObj.machineDieselBalance = machine.diesel_balance ?? ''
        rowObj.machineDieselAvg = machine.diesel_avg ?? ''

        machineDieselFilledSum += (parseFloat(machine.diesel_filled) || 0)
        machineDieselUsedSum += (parseFloat(machine.diesel_used) || 0)

        rowObj.compressorMachineName = compressorRpm.machine?.machine_name || compressorRpm.machinery?.machine_name || (machineryMap && machineryMap[String(compressorRpm.machine_id)]) || compressorRpm.machine_name || (i === 0 ? '—' : '')
        rowObj.compressorStart = compressorRpm.comp_rpm_start ?? ''
        rowObj.compressorEnd = compressorRpm.comp_rpm_end ?? ''
        rowObj.compressorHr = compressorRpm.com_actul_hr ?? ''
        rowObj.compressorDieselFilled = compressorRpm.diesel_filled ?? ''
        rowObj.compressorDieselUsed = compressorRpm.diesel_used ?? ''
        rowObj.compressorDieselBalance = compressorRpm.diesel_balance ?? ''
        rowObj.compressorDieselAvg = compressorRpm.diesel_avg ?? ''

        compressorDieselFilledSum += (parseFloat(compressorRpm.diesel_filled) || 0)
        compressorDieselUsedSum += (parseFloat(compressorRpm.diesel_used) || 0)

        rowObj.materialName = mat.material?.name || mat.raw_material?.name || mat.material_name || ''
        rowObj.materialUsedQty = mat.used_qty ?? mat.used_quantity ?? ''
        materialUsedQtySum += (parseFloat(mat.used_qty ?? mat.used_quantity) || 0)

        let recordWorkTotal = 0

        dynamicWorkTypes.forEach((wt) => {
          if (i === 0) {
            const matching = workDetails.filter((w) => (w.work_type || '').trim().toLowerCase() === wt.toLowerCase())
            if (matching.length > 0) {
              const p = matching.reduce((sum, w) => sum + (parseFloat(w.work_point) || 0), 0)
              const tot = matching.reduce((sum, w) => sum + (Number(w.total) || 0), 0)
              const h = matching.reduce((sum, w) => sum + (parseFloat(w.hrs) || 0), 0)
              const d = matching.reduce((sum, w) => sum + (parseFloat(w.diesel) || 0), 0)
              const r = matching.length === 1 ? matching[0].rate : (p > 0 ? (tot / p).toFixed(2) : matching[0].rate)

              const dtList = Array.from(new Set(matching.map((w) => w.drilling_type || w.drillingType).filter(Boolean))).join(', ')
              const uomList = Array.from(new Set(matching.map((w) => w.uom).filter(Boolean))).join(', ')

              rowObj[`drilling_type_${wt}`] = dtList || ''
              rowObj[`uom_${wt}`] = uomList || ''
              rowObj[`point_${wt}`] = p || ''
              rowObj[`rate_${wt}`] = r != null && r !== '' ? r : ''
              rowObj[`total_${wt}`] = tot || ''
              rowObj[`hrs_${wt}`] = h || ''
              rowObj[`diesel_${wt}`] = d || ''

              dynamicTotals[`point_${wt}`] += p
              dynamicTotals[`total_${wt}`] += tot
              dynamicTotals[`hrs_${wt}`] += h
              dynamicTotals[`diesel_${wt}`] += d

              recordWorkTotal += tot
            } else {
              rowObj[`drilling_type_${wt}`] = ''
              rowObj[`uom_${wt}`] = ''
              rowObj[`point_${wt}`] = ''
              rowObj[`rate_${wt}`] = ''
              rowObj[`total_${wt}`] = ''
              rowObj[`hrs_${wt}`] = ''
              rowObj[`diesel_${wt}`] = ''
            }
          } else {
            rowObj[`drilling_type_${wt}`] = ''
            rowObj[`uom_${wt}`] = ''
            rowObj[`point_${wt}`] = ''
            rowObj[`rate_${wt}`] = ''
            rowObj[`total_${wt}`] = ''
            rowObj[`hrs_${wt}`] = ''
            rowObj[`diesel_${wt}`] = ''
          }
        })

        let recordSurveyTotal = 0
        if (dynamicSurveyTypes.length > 0) {
          dynamicSurveyTypes.forEach((st) => {
            if (i === 0) {
              const matching = surveyDetails.filter((s) => (s.survey_type || '').trim().toLowerCase() === st.toLowerCase())
              if (matching.length > 0) {
                const p = matching.reduce((sum, s) => sum + (parseFloat(s.survey_point) || 0), 0)
                const tot = matching.reduce((sum, s) => sum + (Number(s.total) || 0), 0)
                const h = matching.reduce((sum, s) => sum + (parseFloat(s.hrs) || 0), 0)
                const d = matching.reduce((sum, s) => sum + (parseFloat(s.diesel) || 0), 0)
                const r = matching.length === 1 ? matching[0].rate : (p > 0 ? (tot / p).toFixed(2) : matching[0].rate)

                rowObj[`survey_point_${st}`] = p || ''
                rowObj[`survey_rate_${st}`] = r != null && r !== '' ? r : ''
                rowObj[`survey_total_${st}`] = tot || ''
                rowObj[`survey_hrs_${st}`] = h || ''
                rowObj[`survey_diesel_${st}`] = d || ''

                dynamicSurveyTotals[`point_${st}`] += p
                dynamicSurveyTotals[`total_${st}`] += tot
                dynamicSurveyTotals[`hrs_${st}`] += h
                dynamicSurveyTotals[`diesel_${st}`] += d

                recordSurveyTotal += tot
              } else {
                rowObj[`survey_point_${st}`] = ''
                rowObj[`survey_rate_${st}`] = ''
                rowObj[`survey_total_${st}`] = ''
                rowObj[`survey_hrs_${st}`] = ''
                rowObj[`survey_diesel_${st}`] = ''
              }
            } else {
              rowObj[`survey_point_${st}`] = ''
              rowObj[`survey_rate_${st}`] = ''
              rowObj[`survey_total_${st}`] = ''
              rowObj[`survey_hrs_${st}`] = ''
              rowObj[`survey_diesel_${st}`] = ''
            }
          })
        } else {
          const survey = surveyDetails[i] || {}
          const sTotal = Number(survey.total) || 0
          rowObj.surveyType = survey.survey_type || ''
          rowObj.surveyPoint = survey.survey_point || ''
          rowObj.surveyRate = survey.rate || ''
          rowObj.surveyTotal = sTotal || ''
          rowObj.surveyHrs = survey.hrs ?? ''
          rowObj.surveyDiesel = survey.diesel ?? ''

          staticSurveyPointSum += (parseFloat(survey.survey_point) || 0)
          staticSurveyTotalSum += sTotal
          staticSurveyHrsSum += (parseFloat(survey.hrs) || 0)
          staticSurveyDieselSum += (parseFloat(survey.diesel) || 0)
          recordSurveyTotal += sTotal
        }

        const rowTot = (i === 0 ? (recordWorkTotal + recordSurveyTotal) : 0)
        rowObj.rowTotal = rowTot || ''
        grandTotalSum += rowTot

        dataRows.push(rowObj)
      }
      globalSrNo++
    })
  } else if (rows && rows.length > 0) {
    const grouped = new Map()
    rows.forEach((r) => {
      const key = r.drillingRecordId != null ? String(r.drillingRecordId) : (r.srNo != null ? `sr_${r.srNo}` : `row_${Math.random()}`)
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key).push(r)
    })

    let globalSrNo = 1
    grouped.forEach((rowList) => {
      const baseRow = rowList[0]
      const rowObj = { ...baseRow }
      rowObj.srNo = globalSrNo++

      dynamicWorkTypes.forEach((wt) => {
        rowObj[`drilling_type_${wt}`] = ''
        rowObj[`uom_${wt}`] = ''
        rowObj[`point_${wt}`] = ''
        rowObj[`rate_${wt}`] = ''
        rowObj[`total_${wt}`] = ''
        rowObj[`hrs_${wt}`] = ''
        rowObj[`diesel_${wt}`] = ''
      })

      dynamicSurveyTypes.forEach((st) => {
        rowObj[`survey_point_${st}`] = ''
        rowObj[`survey_rate_${st}`] = ''
        rowObj[`survey_total_${st}`] = ''
        rowObj[`survey_hrs_${st}`] = ''
        rowObj[`survey_diesel_${st}`] = ''
      })

      let recWorkTot = 0
      let recSurveyTot = 0

      rowList.forEach((r) => {
        const wt = (r.workType || '').replace(/\s*\(.*?\)$/, '').trim()
        if (wt && dynamicWorkTypes.includes(wt)) {
          const p = parseFloat(r.workPoint) || 0
          const tot = Number(r.workTotal) || 0
          const h = parseFloat(r.workHrs) || 0
          const d = parseFloat(r.workDiesel) || 0

          const dt = r.drillingType || ''
          const uom = r.uom || ''
          if (dt) {
            const existingDt = rowObj[`drilling_type_${wt}`]
            if (!existingDt) rowObj[`drilling_type_${wt}`] = dt
            else if (!existingDt.split(', ').includes(dt)) rowObj[`drilling_type_${wt}`] += `, ${dt}`
          }
          if (uom) {
            const existingUom = rowObj[`uom_${wt}`]
            if (!existingUom) rowObj[`uom_${wt}`] = uom
            else if (!existingUom.split(', ').includes(uom)) rowObj[`uom_${wt}`] += `, ${uom}`
          }

          rowObj[`point_${wt}`] = (parseFloat(rowObj[`point_${wt}`]) || 0) + p || ''
          rowObj[`rate_${wt}`] = r.workRate || rowObj[`rate_${wt}`] || ''
          rowObj[`total_${wt}`] = (Number(rowObj[`total_${wt}`]) || 0) + tot || ''
          rowObj[`hrs_${wt}`] = (parseFloat(rowObj[`hrs_${wt}`]) || 0) + h || ''
          rowObj[`diesel_${wt}`] = (parseFloat(rowObj[`diesel_${wt}`]) || 0) + d || ''

          dynamicTotals[`point_${wt}`] += p
          dynamicTotals[`total_${wt}`] += tot
          dynamicTotals[`hrs_${wt}`] += h
          dynamicTotals[`diesel_${wt}`] += d
          recWorkTot += tot
        }

        const st = (r.surveyType || '').replace(/\s*\(.*?\)$/, '').trim()
        if (st && dynamicSurveyTypes.includes(st)) {
          const p = parseFloat(r.surveyPoint) || 0
          const tot = Number(r.surveyTotal) || 0
          const h = parseFloat(r.surveyHrs) || 0
          const d = parseFloat(r.surveyDiesel) || 0

          rowObj[`survey_point_${st}`] = (parseFloat(rowObj[`survey_point_${st}`]) || 0) + p || ''
          rowObj[`survey_rate_${st}`] = r.surveyRate || rowObj[`survey_rate_${st}`] || ''
          rowObj[`survey_total_${st}`] = (Number(rowObj[`survey_total_${st}`]) || 0) + tot || ''
          rowObj[`survey_hrs_${st}`] = (parseFloat(rowObj[`survey_hrs_${st}`]) || 0) + h || ''
          rowObj[`survey_diesel_${st}`] = (parseFloat(rowObj[`survey_diesel_${st}`]) || 0) + d || ''

          dynamicSurveyTotals[`point_${st}`] += p
          dynamicSurveyTotals[`total_${st}`] += tot
          dynamicSurveyTotals[`hrs_${st}`] += h
          dynamicSurveyTotals[`diesel_${st}`] += d
          recSurveyTot += tot
        }
      })

      machineDieselFilledSum += (parseFloat(baseRow.machineDieselFilled) || 0)
      machineDieselUsedSum += (parseFloat(baseRow.machineDieselUsed) || 0)
      compressorDieselFilledSum += (parseFloat(baseRow.compressorDieselFilled) || 0)
      compressorDieselUsedSum += (parseFloat(baseRow.compressorDieselUsed) || 0)

      if (dynamicSurveyTypes.length === 0) {
        staticSurveyPointSum += (parseFloat(baseRow.surveyPoint) || 0)
        staticSurveyTotalSum += (Number(baseRow.surveyTotal) || 0)
        staticSurveyHrsSum += (parseFloat(baseRow.surveyHrs) || 0)
        staticSurveyDieselSum += (parseFloat(baseRow.surveyDiesel) || 0)
        recSurveyTot = Number(baseRow.surveyTotal) || 0
      }

      const rowTot = recWorkTot + recSurveyTot
      rowObj.rowTotal = rowTot || ''
      rowObj.materialName = baseRow.materialName || ''
      rowObj.materialUsedQty = baseRow.materialUsedQty || ''
      materialUsedQtySum += (parseFloat(baseRow.materialUsedQty) || 0)
      grandTotalSum += rowTot

      dataRows.push(rowObj)
    })
  }

  const C = (group, header, width, type, get, total, align) => ({
    group, header, width, type, get, total: total || (() => ''), align,
  })

  const cols = [
    C('Entry', 'Sr.No.', 7, 'int', (r) => r.srNo, () => 'TOTAL', 'center'),
    C('Entry', 'Date', 12, 'text', (r) => dateStr(r.date)),
    C('Entry', 'Site', 16, 'text', (r) => txt(r.site)),
    C('Entry', 'Supervisor', 16, 'text', (r) => txt(r.supervisor)),
    C('Entry', 'Operator', 16, 'text', (r) => txt(r.operator)),
    C('Entry', 'Timing', 14, 'text', (r) => (r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : txt(r.timing))),
    C('Entry', 'Machine Name', 14, 'text', (r) => txt(r.machineName)),

    C('Machine Diesel', 'Start', 10, 'num', (r) => num(r.machineStart)),
    C('Machine Diesel', 'End', 10, 'num', (r) => num(r.machineEnd)),
    C('Machine Diesel', 'Hours', 9, 'num', (r) => num(r.machineHr)),
    C('Machine Diesel', 'Diesel Filled', 12, 'num', (r) => num(r.machineDieselFilled), () => num(machineDieselFilledSum || T.machineDieselFilled)),
    C('Machine Diesel', 'Diesel Used', 12, 'num', (r) => num(r.machineDieselUsed), () => num(machineDieselUsedSum || T.machineDieselUsed)),
    C('Machine Diesel', 'Balance', 11, 'num', (r) => num(r.machineDieselBalance)),
    C('Machine Diesel', 'Avg', 10, 'num', (r) => num(r.machineDieselAvg)),

    C('Compressor Diesel', 'Machine', 14, 'text', (r) => txt(pick(r, 'compMachineName', 'compressorMachineName'))),
    C('Compressor Diesel', 'Start', 10, 'num', (r) => num(pick(r, 'compStart', 'compressorStart'))),
    C('Compressor Diesel', 'End', 10, 'num', (r) => num(pick(r, 'compEnd', 'compressorEnd'))),
    C('Compressor Diesel', 'Hours', 9, 'num', (r) => num(pick(r, 'compHr', 'compressorHr'))),
    C('Compressor Diesel', 'Diesel Filled', 12, 'num', (r) => num(pick(r, 'compDieselFilled', 'compressorDieselFilled')), () => num(compressorDieselFilledSum || T.compressorDieselFilled)),
    C('Compressor Diesel', 'Diesel Used', 12, 'num', (r) => num(pick(r, 'compDieselUsed', 'compressorDieselUsed')), () => num(compressorDieselUsedSum || T.compressorDieselUsed)),
    C('Compressor Diesel', 'Balance', 11, 'num', (r) => num(pick(r, 'compDieselBalance', 'compressorDieselBalance'))),
    C('Compressor Diesel', 'Avg', 10, 'num', (r) => num(pick(r, 'compDieselAvg', 'compressorDieselAvg'))),
  ]

  // Dynamic Work Types: separate columns per work type
  if (dynamicWorkTypes.length > 0) {
    dynamicWorkTypes.forEach((wt) => {
      cols.push(
        C(wt, 'Drilling Type', 14, 'text', (r) => txt(r[`drilling_type_${wt}`])),
        C(wt, 'UOM', 10, 'text', (r) => txt(r[`uom_${wt}`])),
        C(wt, `${wt} Point`, 13, 'num', (r) => num(r[`point_${wt}`]), () => num(dynamicTotals[`point_${wt}`])),
        C(wt, 'Rate', 10, 'num', (r) => num(r[`rate_${wt}`])),
        C(wt, 'Total work', 13, 'num', (r) => num(r[`total_${wt}`]), () => num(dynamicTotals[`total_${wt}`])),
        C(wt, 'work Hrs', 10, 'num', (r) => num(r[`hrs_${wt}`]), () => num(dynamicTotals[`hrs_${wt}`])),
        C(wt, 'work Disel', 11, 'num', (r) => num(r[`diesel_${wt}`]), () => num(dynamicTotals[`diesel_${wt}`]))
      )
    })
  } else {
    cols.push(
      C('Work', 'Type', 14, 'text', (r) => txt(r.workType)),
      C('Work', 'Drilling Type', 14, 'text', (r) => txt(r.drillingType)),
      C('Work', 'UOM', 10, 'text', (r) => txt(r.uom)),
      C('Work', 'Points', 9, 'num', (r) => num(r.workPoint), () => num(T.workPoint)),
      C('Work', 'Rate', 10, 'num', (r) => num(r.workRate)),
      C('Work', 'Total', 13, 'num', (r) => num(r.workTotal), () => num(T.workTotal)),
      C('Work', 'Hours', 9, 'num', (r) => num(r.workHrs), () => num(T.workHrs)),
      C('Work', 'Diesel', 10, 'num', (r) => num(r.workDiesel), () => num(T.workDiesel))
    )
  }

  // Dynamic Survey Types: 5 separate columns per survey type
  if (dynamicSurveyTypes.length > 0) {
    dynamicSurveyTypes.forEach((st) => {
      cols.push(
        C(st, `${st} Point`, 13, 'num', (r) => num(r[`survey_point_${st}`]), () => num(dynamicSurveyTotals[`point_${st}`])),
        C(st, 'Rate', 10, 'num', (r) => num(r[`survey_rate_${st}`])),
        C(st, 'Total work', 13, 'num', (r) => num(r[`survey_total_${st}`]), () => num(dynamicSurveyTotals[`total_${st}`])),
        C(st, 'work Hrs', 10, 'num', (r) => num(r[`survey_hrs_${st}`]), () => num(dynamicSurveyTotals[`hrs_${st}`])),
        C(st, 'work Disel', 11, 'num', (r) => num(r[`survey_diesel_${st}`]), () => num(dynamicSurveyTotals[`diesel_${st}`]))
      )
    })
  } else {
    cols.push(
      C('Survey', 'Type', 14, 'text', (r) => txt(r.surveyType)),
      C('Survey', 'Points', 9, 'num', (r) => num(r.surveyPoint), () => num(staticSurveyPointSum || T.surveyPoint)),
      C('Survey', 'Rate', 10, 'num', (r) => num(r.surveyRate)),
      C('Survey', 'Total', 13, 'num', (r) => num(r.surveyTotal), () => num(staticSurveyTotalSum || T.surveyTotal)),
      C('Survey', 'Hours', 9, 'num', (r) => num(r.surveyHrs), () => num(staticSurveyHrsSum || T.surveyHrs)),
      C('Survey', 'Diesel', 10, 'num', (r) => num(r.surveyDiesel), () => num(staticSurveyDieselSum || T.surveyDiesel))
    )
  }

  // Raw Material columns
  cols.push(
    C('Raw Material', 'Material Name', 14, 'text', (r) => txt(r.materialName)),
    C('Raw Material', 'Used Qty', 10, 'num', (r) => num(r.materialUsedQty), () => num(materialUsedQtySum)),
  )

  cols.push(
    C('Grand', 'Grand Total', 14, 'num', (r) => num(r.rowTotal), () => num(grandTotalSum || T.grandTotal))
  )

  const N = cols.length
  const ws = {}
  const merges = []
  let r = 0

  const put = (row, col, value, style, fmt) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    if (value === '' || value === null || value === undefined) {
      ws[addr] = { t: 's', v: '', s: style }
      return
    }
    const t = typeof value === 'number' ? 'n' : 's'
    ws[addr] = { t, v: value, s: style }
    if (t === 'n' && fmt) ws[addr].z = fmt
  }

  const mergeAcross = (row, from, to) => {
    if (to > from) merges.push({ s: { r: row, c: from }, e: { r: row, c: to } })
  }

  const titleStyle = {
    font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: NAVY } },
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  }
  for (let c = 0; c < N; c++) put(r, c, c === 0 ? 'Drilling Work Log Report' : '', titleStyle)
  mergeAcross(r, 0, N - 1)
  ws['!rows'] = [{ hpt: 30 }]
  r++

  if (companyInfo.name || companyInfo.company_name) {
    const companyDisplayName = companyInfo.company_name || companyInfo.name
    const subStyle = styleFor({ color: MUTED, size: 10 })
    put(r, 0, companyDisplayName, { ...subStyle, font: { ...subStyle.font, bold: true, color: { rgb: NAVY } } })
    mergeAcross(r, 0, N - 1)
    r++
  }

  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)
  if (workType) filters.push(`Work Type: ${workType}`)
  if (drillingType) filters.push(`Drilling Type: ${drillingType}`)
  if (surveyType) filters.push(`Survey Type: ${surveyType}`)

  if (filters.length) {
    filters.forEach((f) => {
      put(r, 0, f, styleFor({ color: MUTED, size: 9 }))
      r++
    })
  }
  r++

  const groups = []
  cols.forEach((c, i) => {
    const last = groups[groups.length - 1]
    if (last && last.name === c.group) last.end = i
    else groups.push({ name: c.group, start: i, end: i })
  })
  groups.forEach((g) => {
    for (let c = g.start; c <= g.end; c++) {
      put(r, c, c === g.start ? g.name : '', styleFor({ fill: NAVY, bold: true, color: 'FFFFFF', align: 'center', size: 10 }))
    }
    mergeAcross(r, g.start, g.end)
  })
  r++

  cols.forEach((c, i) => {
    put(r, i, c.header, styleFor({ fill: HEAD, bold: true, color: 'FFFFFF', align: 'center' }))
  })
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][r] = { hpt: 30 }
  r++

  if (!dataRows.length) {
    put(r, 0, 'No drilling work log entries match the selected filters.', styleFor({ color: MUTED, size: 10 }))
    r++
  } else {
    dataRows.forEach((row, ri) => {
      const fill = ri % 2 === 1 ? ZEBRA : undefined
      cols.forEach((c, i) => {
        const highlight = c.header === 'Total' || c.header === 'Grand Total' || c.header === 'Total work'
        const align = c.align || (c.type === 'text' ? 'left' : 'right')
        put(
          r, i, c.get(row),
          styleFor({ fill, align, bold: highlight, color: highlight ? GREEN : INK }),
          c.type === 'num' ? NUM_FMT : undefined
        )
      })
      r++
    })
  }

  cols.forEach((c, i) => {
    const align = c.align || (c.type === 'text' ? 'left' : 'right')
    put(r, i, c.total(T), styleFor({ fill: TOTAL, bold: true, align }), c.type === 'num' ? NUM_FMT : undefined)
  })
  r++

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: N - 1 } })
  ws['!merges'] = merges
  ws['!cols'] = cols.map((c) => ({ wch: c.width }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws, 'Drilling')
  XLSX.writeFile(workbook, fileName)
}

export const downloadDrillingPDF = ({
  rows = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  drillingType,
  companyInfo = {},
  host,
  fileName = 'Drilling_WorkLog_Report.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a3')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  const NAVY = [31, 56, 100]
  const NAVY_LIGHT = [52, 73, 94]
  const INK = [30, 35, 40]
  const MUTED = [110, 118, 128]
  const GREEN = [0, 128, 0]
  const TOTAL_FILL = [226, 232, 240]

  const T = tableTotals

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'

  const pick = (row, ...keys) => {
    for (const k of keys) {
      if (!isEmpty(row[k])) return row[k]
    }
    return ''
  }

  const fmt = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n)
      ? ''
      : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')

  const C = (g, h, get, total = () => '', align = 'center') => ({ g, h, get, total, align })

  const cols = [
    C('Entry', 'Sr', (r) => r.srNo, () => 'TOTAL'),
    C('Entry', 'Date', (r) => dateStr(r.date)),
    C('Entry', 'Site', (r) => txt(r.site), undefined, 'left'),
    C('Entry', 'Supervisor', (r) => txt(r.supervisor), undefined, 'left'),
    C('Entry', 'Operator', (r) => txt(r.operator), undefined, 'left'),
    C('Entry', 'Timing', (r) => (r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : txt(r.timing))),
    C('Entry', 'Machine', (r) => txt(r.machineName), undefined, 'left'),

    C('Machine', 'Start', (r) => fmt(r.machineStart)),
    C('Machine', 'End', (r) => fmt(r.machineEnd)),
    C('Machine', 'Hours', (r) => fmt(r.machineHr)),
    C('Machine', 'Diesel Filled', (r) => fmt(r.machineDieselFilled), () => fmt(T.machineDieselFilled)),
    C('Machine', 'Diesel Used', (r) => fmt(r.machineDieselUsed), () => fmt(T.machineDieselUsed)),
    C('Machine', 'Balance', (r) => fmt(r.machineDieselBalance)),
    C('Machine', 'Avg', (r) => fmt(r.machineDieselAvg)),

    C('Compressor', 'Name', (r) => txt(pick(r, 'compMachineName', 'compressorMachineName')), undefined, 'left'),
    C('Compressor', 'Start', (r) => fmt(pick(r, 'compStart', 'compressorStart'))),
    C('Compressor', 'End', (r) => fmt(pick(r, 'compEnd', 'compressorEnd'))),
    C('Compressor', 'Hours', (r) => fmt(pick(r, 'compHr', 'compressorHr'))),
    C('Compressor', 'Diesel Filled', (r) => fmt(pick(r, 'compDieselFilled', 'compressorDieselFilled')), () => fmt(T.compressorDieselFilled)),
    C('Compressor', 'Diesel Used', (r) => fmt(pick(r, 'compDieselUsed', 'compressorDieselUsed')), () => fmt(T.compressorDieselUsed)),
    C('Compressor', 'Balance', (r) => fmt(pick(r, 'compDieselBalance', 'compressorDieselBalance'))),
    C('Compressor', 'Avg', (r) => fmt(pick(r, 'compDieselAvg', 'compressorDieselAvg'))),

    C('Work', 'Type', (r) => txt(r.workType), undefined, 'left'),
    C('Work', 'Drill Typ', (r) => txt(r.drillingType), undefined, 'left'),
    C('Work', 'Points', (r) => fmt(r.workPoint), () => fmt(T.workPoint)),
    C('Work', 'Rate', (r) => fmt(r.workRate)),
    C('Work', 'Total', (r) => fmt(r.workTotal), () => fmt(T.workTotal)),
    C('Work', 'Hours', (r) => fmt(r.workHrs), () => fmt(T.workHrs)),
    C('Work', 'Diesel', (r) => fmt(r.workDiesel), () => fmt(T.workDiesel)),

    C('Survey', 'Type', (r) => txt(r.surveyType), undefined, 'left'),
    C('Survey', 'Points', (r) => fmt(r.surveyPoint), () => fmt(T.surveyPoint)),
    C('Survey', 'Rate', (r) => fmt(r.surveyRate)),
    C('Survey', 'Total', (r) => fmt(r.surveyTotal), () => fmt(T.surveyTotal)),
    C('Survey', 'Hours', (r) => fmt(r.surveyHrs), () => fmt(T.surveyHrs)),
    C('Survey', 'Diesel', (r) => fmt(r.surveyDiesel), () => fmt(T.surveyDiesel)),

    // Raw Material
    C('Raw Material', 'Material', (r) => txt(r.materialName), undefined, 'left'),
    C('Raw Material', 'Used Qty', (r) => fmt(r.materialUsedQty)),

    C('Total', 'Grand Total', (r) => fmt(r.rowTotal), () => fmt(T.grandTotal)),
  ]

  const drawHeader = () =>
    drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Drilling Work Log Report',
    })

  const headerBottomY = drawHeader()
  let y = headerBottomY

  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)
  if (workType) filters.push(`Work Type: ${workType}`)
  if (drillingType) filters.push(`Drilling Type: ${drillingType}`)

  if (filters.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(`Applied Filters:  ${filters.join('     |     ')}`, margin, y)
    y += 7
  }

  if (!rows.length) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No drilling work log entries match the selected filters.', margin, y + 10)
  } else {
    const groupRow = []
    cols.forEach((c) => {
      const last = groupRow[groupRow.length - 1]
      if (last && last.key === c.g) {
        last.colSpan += 1
      } else {
        groupRow.push({ key: c.g, content: c.g, colSpan: 1 })
      }
    })
    const headGroup = groupRow.map(({ content, colSpan }) => ({ content, colSpan }))
    const headLabels = cols.map((c) => c.h)

    const body = rows.map((r) => cols.map((c) => c.get(r)))
    const totalRow = cols.map((c) => c.total(T))
    const allBody = [...body, totalRow]

    const leftCols = cols.reduce((acc, c, i) => {
      if (c.align === 'left') acc[i] = { halign: 'left' }
      return acc
    }, {})

    const grandTotalIndex = cols.length - 1
    const totalsIndex = [
      cols.findIndex((c) => c.h === 'Total' && c.g === 'Work'),
      cols.findIndex((c) => c.h === 'Total' && c.g === 'Survey'),
      grandTotalIndex,
    ]

    doc.autoTable({
      head: [headGroup, headLabels],
      body: allBody,
      startY: y,
      theme: 'grid',
      margin: { top: headerBottomY, left: margin, right: margin, bottom: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 6.8,
        cellPadding: 1,
        halign: 'center',
        valign: 'middle',
        textColor: INK,
        lineColor: [200, 205, 212],
        lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: NAVY_LIGHT,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: leftCols,
      didParseCell: (data) => {
        if (data.section === 'head' && data.row.index === 0) {
          data.cell.styles.fillColor = NAVY
          data.cell.styles.fontSize = 7.5
          return
        }
        if (data.section !== 'body') return

        const isTotalRow = data.row.index === allBody.length - 1
        if (isTotalRow) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = TOTAL_FILL
        } else if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [246, 248, 251]
        }

        if (totalsIndex.includes(data.column.index) && !isTotalRow) {
          data.cell.styles.textColor = GREEN
          data.cell.styles.fontStyle = 'bold'
        }
      },
      addPageContent: () => drawHeader(),
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
    })

    y = doc.lastAutoTable.finalY + 6
  }

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-GB')}`,
      margin,
      pageHeight - 6
    )
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, {
      align: 'right',
    })
  }

  doc.save(fileName)
}

// ─────────────────────────────────────────────────────────────────
// 3. SEPARATE CASTING WORK LOG REPORT EXPORTS
// ─────────────────────────────────────────────────────────────────

export const downloadCastingExcel = ({
  rows = [],
  records = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  castingTeam,
  machineryMap = {},
  companyInfo = {},
  fileName = 'Casting_WorkLog_Report.xlsx',
}) => {
  const T = tableTotals

  const NAVY = '1F3864'
  const HEAD = '344A5E'
  const ZEBRA = 'F6F8FB'
  const TOTAL = 'E2E8F0'
  const GREEN = '008000'
  const INK = '1E2328'
  const MUTED = '6E7680'
  const LINE = 'C8CDD4'

  const NUM_FMT = '[>=10000000]##\\,##\\,##\\,##0.00;[>=100000]##\\,##\\,##0.00;##,##0.00'

  const thin = { style: 'thin', color: { rgb: LINE } }
  const border = { top: thin, bottom: thin, left: thin, right: thin }

  const styleFor = ({ fill, bold = false, color = INK, align = 'left', size = 9 } = {}) => ({
    font: { name: 'Calibri', sz: size, bold, color: { rgb: color } },
    fill: fill ? { patternType: 'solid', fgColor: { rgb: fill } } : undefined,
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border,
  })

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const num = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => {
    if (!d) return ''
    try {
      const parts = String(d).split('T')[0].split('-')
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`
      }
      return new Date(d).toLocaleDateString('en-GB')
    } catch {
      return String(d)
    }
  }
  const pick = (row, ...keys) => {
    for (const k of keys) if (!isEmpty(row[k])) return row[k]
    return ''
  }

  /* ---------- dynamic work types detection ---------- */
  let dynamicWorkTypes = []
  if (workType) {
    dynamicWorkTypes = [workType.trim()]
  } else {
    const seenWT = new Set()
    if (records && records.length > 0) {
      records.forEach((rec) => {
        (rec.work_point_detail || []).forEach((w) => {
          const wt = (w.work_type || '').trim()
          if (wt && !seenWT.has(wt)) {
            seenWT.add(wt)
            dynamicWorkTypes.push(wt)
          }
        })
      })
    }
    if (dynamicWorkTypes.length === 0 && rows && rows.length > 0) {
      rows.forEach((r) => {
        let wt = (r.workType || '').trim()
        if (wt && wt !== 'Rotary Work') {
          const baseWt = wt.replace(/\s*\(.*?\)$/, '').trim()
          const finalWt = baseWt || wt
          if (!seenWT.has(finalWt)) {
            seenWT.add(finalWt)
            dynamicWorkTypes.push(finalWt)
          }
        }
      })
    }
  }

  /* ---------- build data rows with pivoted work types ---------- */
  const dynamicTotals = {}
  dynamicWorkTypes.forEach((wt) => {
    dynamicTotals[`point_${wt}`] = 0
    dynamicTotals[`total_${wt}`] = 0
    dynamicTotals[`hrs_${wt}`] = 0
  })

  let machineDieselFilledSum = 0
  let machineDieselUsedSum = 0
  let compressorDieselFilledSum = 0
  let compressorDieselUsedSum = 0
  let materialUsedQtySum = 0
  let grandTotalSum = 0

  let dataRows = []

  if (records && records.length > 0) {
    let globalSrNo = 1
    records.forEach((rec) => {
      let workDetails = rec.work_point_detail || []
      const team = (rec.casting_team_name || '').toLowerCase()
      if (castingTeam && !team.includes(castingTeam.toLowerCase())) return

      if (workType) {
        workDetails = workDetails.filter((w) => (w.work_type || '').toLowerCase() === workType.toLowerCase())
      }

      const machineReadings = rec.machine_reading || rec.machineReading || []
      const compressorRpms = rec.compressor_rpm || rec.compressorRpm || []
      const rawMaterials = rec.uses_raw_material || []

      const effectiveMachine = machineReadings.length > 0 ? machineReadings : (
        (rec.machine_start != null || rec.machine_end != null || rec.actual_machine_hr != null) ? [{
          machine_start: rec.machine_start,
          machine_end: rec.machine_end,
          actual_machine_hr: rec.actual_machine_hr,
          diesel_filled: rec.machine_diesel_filled,
          diesel_used: rec.machine_diesel_used,
          diesel_balance: rec.machine_diesel_balance,
          diesel_avg: rec.machine_diesel_avg,
          machine: rec.machine,
          machinery: rec.machinery,
          machine_id: rec.machine_id,
          operator: rec.operator,
        }] : []
      )

      const effectiveCompressor = compressorRpms.length > 0 ? compressorRpms : (
        (rec.comp_rpm_start != null || rec.comp_rpm_end != null || rec.com_actul_hr != null) ? [{
          comp_rpm_start: rec.comp_rpm_start,
          comp_rpm_end: rec.comp_rpm_end,
          com_actul_hr: rec.com_actul_hr,
          diesel_filled: rec.comp_diesel_filled,
          diesel_used: rec.comp_diesel_used,
          diesel_balance: rec.comp_diesel_balance,
          diesel_avg: rec.comp_diesel_avg,
          machine: rec.compressor_machine || rec.comp_machine,
          machinery: rec.compressor_machinery,
          machine_id: rec.comp_machine_id,
        }] : []
      )

      const totalRecRows = Math.max(effectiveMachine.length, effectiveCompressor.length, rawMaterials.length, 1)

      for (let i = 0; i < totalRecRows; i++) {
        const machine = effectiveMachine[i] || {}
        const compressorRpm = effectiveCompressor[i] || {}
        const mat = rawMaterials[i] || {}
        const rowObj = {}

        rowObj.srNo = i === 0 ? globalSrNo : ''
        rowObj.date = rec.date
        rowObj.site = rec.project?.project_name || rec.site_name || ''
        rowObj.supervisor = rec.supervisor || rec.project?.supervisor?.name || '—'
        rowObj.operator = machine.operator?.name || rec.operator?.name || ''
        rowObj.castingTeamName = rec.casting_team_name || '—'
        rowObj.castingTeamNo = rec.casting_team_no || '—'
        rowObj.helperName = rec.helper?.name || rec.helper_name || '—'
        rowObj.timing = rec.start_time && rec.end_time ? `${rec.start_time} - ${rec.end_time}` : (rec.timing || '—')
        rowObj.machineName = machine.machine?.machine_name || machine.machinery?.machine_name || (machineryMap && machineryMap[String(machine.machine_id)]) || machine.machine_name || (i === 0 ? '—' : '')
        rowObj.machineStart = machine.machine_start ?? ''
        rowObj.machineEnd = machine.machine_end ?? ''
        rowObj.machineHr = machine.actual_machine_hr ?? ''
        rowObj.machineDieselFilled = machine.diesel_filled ?? ''
        rowObj.machineDieselUsed = machine.diesel_used ?? ''
        rowObj.machineDieselBalance = machine.diesel_balance ?? ''
        rowObj.machineDieselAvg = machine.diesel_avg ?? ''

        machineDieselFilledSum += (parseFloat(machine.diesel_filled) || 0)
        machineDieselUsedSum += (parseFloat(machine.diesel_used) || 0)

        rowObj.compressorMachineName = compressorRpm.machine?.machine_name || compressorRpm.machinery?.machine_name || (machineryMap && machineryMap[String(compressorRpm.machine_id)]) || compressorRpm.machine_name || (i === 0 ? '—' : '')
        rowObj.compressorStart = compressorRpm.comp_rpm_start ?? ''
        rowObj.compressorEnd = compressorRpm.comp_rpm_end ?? ''
        rowObj.compressorHr = compressorRpm.com_actul_hr ?? ''
        rowObj.compressorDieselFilled = compressorRpm.diesel_filled ?? ''
        rowObj.compressorDieselUsed = compressorRpm.diesel_used ?? ''
        rowObj.compressorDieselBalance = compressorRpm.diesel_balance ?? ''
        rowObj.compressorDieselAvg = compressorRpm.diesel_avg ?? ''

        compressorDieselFilledSum += (parseFloat(compressorRpm.diesel_filled) || 0)
        compressorDieselUsedSum += (parseFloat(compressorRpm.diesel_used) || 0)

        rowObj.materialName = mat.material?.name || mat.raw_material?.name || mat.material_name || ''
        rowObj.materialUsedQty = mat.used_qty ?? mat.used_quantity ?? ''
        materialUsedQtySum += (parseFloat(mat.used_qty ?? mat.used_quantity) || 0)

        let recordWorkTotal = 0

        dynamicWorkTypes.forEach((wt) => {
          if (i === 0) {
            const matching = workDetails.filter((w) => (w.work_type || '').trim().toLowerCase() === wt.toLowerCase())
            if (matching.length > 0) {
              const p = matching.reduce((sum, w) => sum + (parseFloat(w.work_point) || 0), 0)
              const tot = matching.reduce((sum, w) => sum + (Number(w.total) || 0), 0)
              const h = matching.reduce((sum, w) => sum + (parseFloat(w.hrs) || 0), 0)
              const r = matching.length === 1 ? matching[0].rate : (p > 0 ? (tot / p).toFixed(2) : matching[0].rate)

              const dtList = Array.from(new Set(matching.map((w) => w.drilling_type || w.drillingType).filter(Boolean))).join(', ')
              const uomList = Array.from(new Set(matching.map((w) => w.uom).filter(Boolean))).join(', ')

              rowObj[`drilling_type_${wt}`] = dtList || ''
              rowObj[`uom_${wt}`] = uomList || ''
              rowObj[`point_${wt}`] = p || ''
              rowObj[`rate_${wt}`] = r != null && r !== '' ? r : ''
              rowObj[`total_${wt}`] = tot || ''
              rowObj[`hrs_${wt}`] = h || ''

              dynamicTotals[`point_${wt}`] += p
              dynamicTotals[`total_${wt}`] += tot
              dynamicTotals[`hrs_${wt}`] += h

              recordWorkTotal += tot
            } else {
              rowObj[`drilling_type_${wt}`] = ''
              rowObj[`uom_${wt}`] = ''
              rowObj[`point_${wt}`] = ''
              rowObj[`rate_${wt}`] = ''
              rowObj[`total_${wt}`] = ''
              rowObj[`hrs_${wt}`] = ''
            }
          } else {
            rowObj[`drilling_type_${wt}`] = ''
            rowObj[`uom_${wt}`] = ''
            rowObj[`point_${wt}`] = ''
            rowObj[`rate_${wt}`] = ''
            rowObj[`total_${wt}`] = ''
            rowObj[`hrs_${wt}`] = ''
          }
        })

        rowObj.materialName = mat.material?.name || mat.raw_material?.name || mat.material_name || ''
        rowObj.materialUsedQty = mat.used_qty ?? mat.used_quantity ?? ''
        materialUsedQtySum += (parseFloat(mat.used_qty ?? mat.used_quantity) || 0)

        const rowTot = i === 0 ? recordWorkTotal : 0
        rowObj.rowTotal = rowTot || ''
        grandTotalSum += rowTot

        dataRows.push(rowObj)
      }
      globalSrNo++
    })
  } else if (rows && rows.length > 0) {
    const grouped = new Map()
    rows.forEach((r) => {
      const key = r.drillingRecordId != null ? String(r.drillingRecordId) : (r.srNo != null ? `sr_${r.srNo}` : `row_${Math.random()}`)
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key).push(r)
    })

    let globalSrNo = 1
    grouped.forEach((rowList) => {
      const baseRow = rowList[0]
      const rowObj = { ...baseRow }
      rowObj.srNo = globalSrNo++

      dynamicWorkTypes.forEach((wt) => {
        rowObj[`drilling_type_${wt}`] = ''
        rowObj[`uom_${wt}`] = ''
        rowObj[`point_${wt}`] = ''
        rowObj[`rate_${wt}`] = ''
        rowObj[`total_${wt}`] = ''
        rowObj[`hrs_${wt}`] = ''
      })

      let recWorkTot = 0
      rowList.forEach((r) => {
        const wt = (r.workType || '').replace(/\s*\(.*?\)$/, '').trim()
        if (wt && dynamicWorkTypes.includes(wt)) {
          const p = parseFloat(r.workPoint) || 0
          const tot = Number(r.workTotal) || 0
          const h = parseFloat(r.workHrs) || 0

          const dt = r.drillingType || ''
          const uom = r.uom || ''
          if (dt) {
            const existingDt = rowObj[`drilling_type_${wt}`]
            if (!existingDt) rowObj[`drilling_type_${wt}`] = dt
            else if (!existingDt.split(', ').includes(dt)) rowObj[`drilling_type_${wt}`] += `, ${dt}`
          }
          if (uom) {
            const existingUom = rowObj[`uom_${wt}`]
            if (!existingUom) rowObj[`uom_${wt}`] = uom
            else if (!existingUom.split(', ').includes(uom)) rowObj[`uom_${wt}`] += `, ${uom}`
          }

          rowObj[`point_${wt}`] = (parseFloat(rowObj[`point_${wt}`]) || 0) + p || ''
          rowObj[`rate_${wt}`] = r.workRate || rowObj[`rate_${wt}`] || ''
          rowObj[`total_${wt}`] = (Number(rowObj[`total_${wt}`]) || 0) + tot || ''
          rowObj[`hrs_${wt}`] = (parseFloat(rowObj[`hrs_${wt}`]) || 0) + h || ''

          dynamicTotals[`point_${wt}`] += p
          dynamicTotals[`total_${wt}`] += tot
          dynamicTotals[`hrs_${wt}`] += h
          recWorkTot += tot
        }
      })

      machineDieselFilledSum += (parseFloat(baseRow.machineDieselFilled) || 0)
      machineDieselUsedSum += (parseFloat(baseRow.machineDieselUsed) || 0)
      compressorDieselFilledSum += (parseFloat(baseRow.compressorDieselFilled) || 0)
      compressorDieselUsedSum += (parseFloat(baseRow.compressorDieselUsed) || 0)
      materialUsedQtySum += (parseFloat(baseRow.materialUsedQty) || 0)

      rowObj.rowTotal = recWorkTot || ''
      grandTotalSum += recWorkTot

      dataRows.push(rowObj)
    })
  }

  const C = (group, header, width, type, get, total, align) => ({
    group, header, width, type, get, total: total || (() => ''), align,
  })

  const cols = [
    C('Entry', 'Sr.No.', 7, 'int', (r) => r.srNo, () => 'TOTAL', 'center'),
    C('Entry', 'Date', 12, 'text', (r) => dateStr(r.date)),
    C('Entry', 'Site', 16, 'text', (r) => txt(r.site)),
    C('Entry', 'Supervisor', 16, 'text', (r) => txt(r.supervisor)),
    C('Entry', 'Operator', 16, 'text', (r) => txt(r.operator)),
    C('Entry', 'Casting Team Name', 16, 'text', (r) => txt(r.castingTeamName)),
    C('Entry', 'Casting Team No', 14, 'text', (r) => txt(r.castingTeamNo)),
    C('Entry', 'Helper Name', 14, 'text', (r) => txt(r.helperName)),
    C('Entry', 'Timing', 14, 'text', (r) => (r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : txt(r.timing))),
    C('Entry', 'Machine Name', 14, 'text', (r) => txt(r.machineName)),

    C('Machine Diesel', 'Start', 10, 'num', (r) => num(r.machineStart)),
    C('Machine Diesel', 'End', 10, 'num', (r) => num(r.machineEnd)),
    C('Machine Diesel', 'Hours', 9, 'num', (r) => num(r.machineHr)),
    C('Machine Diesel', 'Diesel Filled', 12, 'num', (r) => num(r.machineDieselFilled), () => num(machineDieselFilledSum || T.machineDieselFilled)),
    C('Machine Diesel', 'Diesel Used', 12, 'num', (r) => num(r.machineDieselUsed), () => num(machineDieselUsedSum || T.machineDieselUsed)),
    C('Machine Diesel', 'Balance', 11, 'num', (r) => num(r.machineDieselBalance)),
    C('Machine Diesel', 'Avg', 10, 'num', (r) => num(r.machineDieselAvg)),

    C('Compressor Diesel', 'Machine', 14, 'text', (r) => txt(pick(r, 'compMachineName', 'compressorMachineName'))),
    C('Compressor Diesel', 'Start', 10, 'num', (r) => num(pick(r, 'compStart', 'compressorStart'))),
    C('Compressor Diesel', 'End', 10, 'num', (r) => num(pick(r, 'compEnd', 'compressorEnd'))),
    C('Compressor Diesel', 'Hours', 9, 'num', (r) => num(pick(r, 'compHr', 'compressorHr'))),
    C('Compressor Diesel', 'Diesel Filled', 12, 'num', (r) => num(pick(r, 'compDieselFilled', 'compressorDieselFilled')), () => num(compressorDieselFilledSum || T.compressorDieselFilled)),
    C('Compressor Diesel', 'Diesel Used', 12, 'num', (r) => num(pick(r, 'compDieselUsed', 'compressorDieselUsed')), () => num(compressorDieselUsedSum || T.compressorDieselUsed)),
    C('Compressor Diesel', 'Balance', 11, 'num', (r) => num(pick(r, 'compDieselBalance', 'compressorDieselBalance'))),
    C('Compressor Diesel', 'Avg', 10, 'num', (r) => num(pick(r, 'compDieselAvg', 'compressorDieselAvg'))),
  ]

  if (dynamicWorkTypes.length > 0) {
    dynamicWorkTypes.forEach((wt) => {
      cols.push(
        C(wt, 'Drilling Type', 14, 'text', (r) => txt(r[`drilling_type_${wt}`])),
        C(wt, 'UOM', 10, 'text', (r) => txt(r[`uom_${wt}`])),
        C(wt, `${wt} Point`, 13, 'num', (r) => num(r[`point_${wt}`]), () => num(dynamicTotals[`point_${wt}`])),
        C(wt, 'Rate', 10, 'num', (r) => num(r[`rate_${wt}`])),
        C(wt, 'Total work', 13, 'num', (r) => num(r[`total_${wt}`]), () => num(dynamicTotals[`total_${wt}`])),
        C(wt, 'work Hrs', 10, 'num', (r) => num(r[`hrs_${wt}`]), () => num(dynamicTotals[`hrs_${wt}`]))
      )
    })
  } else {
    cols.push(
      C('Work', 'Type', 14, 'text', (r) => txt(r.workType)),
      C('Work', 'Drilling Type', 14, 'text', (r) => txt(r.drillingType)),
      C('Work', 'UOM', 10, 'text', (r) => txt(r.uom)),
      C('Work', 'Points', 9, 'num', (r) => num(r.workPoint), () => num(T.workPoint)),
      C('Work', 'Rate', 10, 'num', (r) => num(r.workRate)),
      C('Work', 'Total', 13, 'num', (r) => num(r.workTotal), () => num(T.workTotal)),
      C('Work', 'Hours', 9, 'num', (r) => num(r.workHrs), () => num(T.workHrs))
    )
  }

  cols.push(
    C('Raw Material', 'Material Name', 14, 'text', (r) => txt(r.materialName)),
    C('Raw Material', 'Used Qty', 10, 'num', (r) => num(r.materialUsedQty), () => num(materialUsedQtySum)),

    C('Grand', 'Grand Total', 14, 'num', (r) => num(r.rowTotal), () => num(grandTotalSum || T.grandTotal))
  )

  const N = cols.length
  const ws = {}
  const merges = []
  let r = 0

  const put = (row, col, value, style, fmt) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    if (value === '' || value === null || value === undefined) {
      ws[addr] = { t: 's', v: '', s: style }
      return
    }
    const t = typeof value === 'number' ? 'n' : 's'
    ws[addr] = { t, v: value, s: style }
    if (t === 'n' && fmt) ws[addr].z = fmt
  }

  const mergeAcross = (row, from, to) => {
    if (to > from) merges.push({ s: { r: row, c: from }, e: { r: row, c: to } })
  }

  const titleStyle = {
    font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: NAVY } },
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  }
  for (let c = 0; c < N; c++) put(r, c, c === 0 ? 'Casting Work Log Report' : '', titleStyle)
  mergeAcross(r, 0, N - 1)
  ws['!rows'] = [{ hpt: 30 }]
  r++

  if (companyInfo.name || companyInfo.company_name) {
    const companyDisplayName = companyInfo.company_name || companyInfo.name
    const subStyle = styleFor({ color: MUTED, size: 10 })
    put(r, 0, companyDisplayName, { ...subStyle, font: { ...subStyle.font, bold: true, color: { rgb: NAVY } } })
    mergeAcross(r, 0, N - 1)
    r++
  }

  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)
  if (workType) filters.push(`Work Type: ${workType}`)
  if (castingTeam) filters.push(`Casting Team: ${castingTeam}`)

  if (filters.length) {
    filters.forEach((f) => {
      put(r, 0, f, styleFor({ color: MUTED, size: 9 }))
      r++
    })
  }
  r++

  const groups = []
  cols.forEach((c, i) => {
    const last = groups[groups.length - 1]
    if (last && last.name === c.group) last.end = i
    else groups.push({ name: c.group, start: i, end: i })
  })
  groups.forEach((g) => {
    for (let c = g.start; c <= g.end; c++) {
      put(r, c, c === g.start ? g.name : '', styleFor({ fill: NAVY, bold: true, color: 'FFFFFF', align: 'center', size: 10 }))
    }
    mergeAcross(r, g.start, g.end)
  })
  r++

  cols.forEach((c, i) => {
    put(r, i, c.header, styleFor({ fill: HEAD, bold: true, color: 'FFFFFF', align: 'center' }))
  })
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][r] = { hpt: 30 }
  r++

  if (!dataRows.length) {
    put(r, 0, 'No casting work log entries match the selected filters.', styleFor({ color: MUTED, size: 10 }))
    r++
  } else {
    dataRows.forEach((row, ri) => {
      const fill = ri % 2 === 1 ? ZEBRA : undefined
      cols.forEach((c, i) => {
        const highlight = c.header === 'Total' || c.header === 'Grand Total' || c.header === 'Total work'
        const align = c.align || (c.type === 'text' ? 'left' : 'right')
        put(
          r, i, c.get(row),
          styleFor({ fill, align, bold: highlight, color: highlight ? GREEN : INK }),
          c.type === 'num' ? NUM_FMT : undefined
        )
      })
      r++
    })
  }

  cols.forEach((c, i) => {
    const align = c.align || (c.type === 'text' ? 'left' : 'right')
    put(r, i, c.total(T), styleFor({ fill: TOTAL, bold: true, align }), c.type === 'num' ? NUM_FMT : undefined)
  })
  r++

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: N - 1 } })
  ws['!merges'] = merges
  ws['!cols'] = cols.map((c) => ({ wch: c.width }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws, 'Casting')
  XLSX.writeFile(workbook, fileName)
}

export const downloadCastingPDF = ({
  rows = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  workType,
  castingTeam,
  companyInfo = {},
  host,
  fileName = 'Casting_WorkLog_Report.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a3')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  const NAVY = [31, 56, 100]
  const NAVY_LIGHT = [52, 73, 94]
  const INK = [30, 35, 40]
  const MUTED = [110, 118, 128]
  const GREEN = [0, 128, 0]
  const TOTAL_FILL = [226, 232, 240]

  const T = tableTotals

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'

  const pick = (row, ...keys) => {
    for (const k of keys) {
      if (!isEmpty(row[k])) return row[k]
    }
    return ''
  }

  const fmt = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n)
      ? ''
      : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')

  const C = (g, h, get, total = () => '', align = 'center') => ({ g, h, get, total, align })

  const cols = [
    C('Entry', 'Sr', (r) => r.srNo, () => 'TOTAL'),
    C('Entry', 'Date', (r) => dateStr(r.date)),
    C('Entry', 'Site', (r) => txt(r.site), undefined, 'left'),
    C('Entry', 'Supervisor', (r) => txt(r.supervisor), undefined, 'left'),
    C('Entry', 'Operator', (r) => txt(r.operator), undefined, 'left'),
    C('Entry', 'Team', (r) => (r.castingTeamName && r.castingTeamName !== '—' ? `${r.castingTeamName}${r.castingTeamNo && r.castingTeamNo !== '—' ? ` (${r.castingTeamNo})` : ''}` : ''), undefined, 'left'),
    C('Entry', 'Helper', (r) => txt(r.helperName), undefined, 'left'),
    C('Entry', 'Timing', (r) => (r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : txt(r.timing))),
    C('Entry', 'Machine', (r) => txt(r.machineName), undefined, 'left'),

    C('Machine', 'Start', (r) => fmt(r.machineStart)),
    C('Machine', 'End', (r) => fmt(r.machineEnd)),
    C('Machine', 'Hours', (r) => fmt(r.machineHr)),
    C('Machine', 'Diesel Filled', (r) => fmt(r.machineDieselFilled), () => fmt(T.machineDieselFilled)),
    C('Machine', 'Diesel Used', (r) => fmt(r.machineDieselUsed), () => fmt(T.machineDieselUsed)),
    C('Machine', 'Balance', (r) => fmt(r.machineDieselBalance)),
    C('Machine', 'Avg', (r) => fmt(r.machineDieselAvg)),

    C('Compressor', 'Name', (r) => txt(pick(r, 'compMachineName', 'compressorMachineName')), undefined, 'left'),
    C('Compressor', 'Start', (r) => fmt(pick(r, 'compStart', 'compressorStart'))),
    C('Compressor', 'End', (r) => fmt(pick(r, 'compEnd', 'compressorEnd'))),
    C('Compressor', 'Hours', (r) => fmt(pick(r, 'compHr', 'compressorHr'))),
    C('Compressor', 'Diesel Filled', (r) => fmt(pick(r, 'compDieselFilled', 'compressorDieselFilled')), () => fmt(T.compressorDieselFilled)),
    C('Compressor', 'Diesel Used', (r) => fmt(pick(r, 'compDieselUsed', 'compressorDieselUsed')), () => fmt(T.compressorDieselUsed)),
    C('Compressor', 'Balance', (r) => fmt(pick(r, 'compDieselBalance', 'compressorDieselBalance'))),
    C('Compressor', 'Avg', (r) => fmt(pick(r, 'compDieselAvg', 'compressorDieselAvg'))),

    C('Work', 'Type', (r) => txt(r.workType), undefined, 'left'),
    C('Work', 'Points', (r) => fmt(r.workPoint), () => fmt(T.workPoint)),
    C('Work', 'Rate', (r) => fmt(r.workRate)),
    C('Work', 'Total', (r) => fmt(r.workTotal), () => fmt(T.workTotal)),
    C('Work', 'Hours', (r) => fmt(r.workHrs), () => fmt(T.workHrs)),

    C('Raw Material', 'Material', (r) => txt(r.materialName), undefined, 'left'),
    C('Raw Material', 'Used Qty', (r) => fmt(r.materialUsedQty)),

    C('Total', 'Grand Total', (r) => fmt(r.rowTotal), () => fmt(T.grandTotal)),
  ]

  const drawHeader = () =>
    drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Casting Work Log Report',
    })

  const headerBottomY = drawHeader()
  let y = headerBottomY

  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)
  if (workType) filters.push(`Work Type: ${workType}`)
  if (castingTeam) filters.push(`Casting Team: ${castingTeam}`)

  if (filters.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(`Applied Filters:  ${filters.join('     |     ')}`, margin, y)
    y += 7
  }

  if (!rows.length) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No casting work log entries match the selected filters.', margin, y + 10)
  } else {
    const groupRow = []
    cols.forEach((c) => {
      const last = groupRow[groupRow.length - 1]
      if (last && last.key === c.g) {
        last.colSpan += 1
      } else {
        groupRow.push({ key: c.g, content: c.g, colSpan: 1 })
      }
    })
    const headGroup = groupRow.map(({ content, colSpan }) => ({ content, colSpan }))
    const headLabels = cols.map((c) => c.h)

    const body = rows.map((r) => cols.map((c) => c.get(r)))
    const totalRow = cols.map((c) => c.total(T))
    const allBody = [...body, totalRow]

    const leftCols = cols.reduce((acc, c, i) => {
      if (c.align === 'left') acc[i] = { halign: 'left' }
      return acc
    }, {})

    const grandTotalIndex = cols.length - 1
    const totalsIndex = [
      cols.findIndex((c) => c.h === 'Total' && c.g === 'Work'),
      grandTotalIndex,
    ]

    doc.autoTable({
      head: [headGroup, headLabels],
      body: allBody,
      startY: y,
      theme: 'grid',
      margin: { top: headerBottomY, left: margin, right: margin, bottom: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 6.8,
        cellPadding: 1,
        halign: 'center',
        valign: 'middle',
        textColor: INK,
        lineColor: [200, 205, 212],
        lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: NAVY_LIGHT,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: leftCols,
      didParseCell: (data) => {
        if (data.section === 'head' && data.row.index === 0) {
          data.cell.styles.fillColor = NAVY
          data.cell.styles.fontSize = 7.5
          return
        }
        if (data.section !== 'body') return

        const isTotalRow = data.row.index === allBody.length - 1
        if (isTotalRow) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = TOTAL_FILL
        } else if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [246, 248, 251]
        }

        if (totalsIndex.includes(data.column.index) && !isTotalRow) {
          data.cell.styles.textColor = GREEN
          data.cell.styles.fontStyle = 'bold'
        }
      },
      addPageContent: () => drawHeader(),
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
    })

    y = doc.lastAutoTable.finalY + 6
  }

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-GB')}`,
      margin,
      pageHeight - 6
    )
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, {
      align: 'right',
    })
  }

  doc.save(fileName)
}

// ─────────────────────────────────────────────────────────────────
// 4. SEPARATE ROTARY WORK LOG REPORT EXPORTS
// ─────────────────────────────────────────────────────────────────

export const downloadRotaryExcel = ({
  rows = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  companyInfo = {},
  fileName = 'Rotary_WorkLog_Report.xlsx',
}) => {
  const T = tableTotals

  const NAVY = '1F3864'
  const HEAD = '344A5E'
  const ZEBRA = 'F6F8FB'
  const TOTAL = 'E2E8F0'
  const GREEN = '008000'
  const INK = '1E2328'
  const MUTED = '6E7680'
  const LINE = 'C8CDD4'

  const NUM_FMT = '[>=10000000]##\\,##\\,##\\,##0.00;[>=100000]##\\,##\\,##0.00;##,##0.00'

  const thin = { style: 'thin', color: { rgb: LINE } }
  const border = { top: thin, bottom: thin, left: thin, right: thin }

  const styleFor = ({ fill, bold = false, color = INK, align = 'left', size = 9 } = {}) => ({
    font: { name: 'Calibri', sz: size, bold, color: { rgb: color } },
    fill: fill ? { patternType: 'solid', fgColor: { rgb: fill } } : undefined,
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border,
  })

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const num = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')

  const C = (group, header, width, type, get, total, align) => ({
    group, header, width, type, get, total: total || (() => ''), align,
  })

  const cols = [
    C('Entry', 'Sr.No.', 7, 'int', (r) => r.srNo, () => 'TOTAL', 'center'),
    C('Entry', 'Date', 12, 'text', (r) => dateStr(r.date)),
    C('Entry', 'Site Name', 18, 'text', (r) => txt(r.site)),
    C('Entry', 'Machine No.', 14, 'text', (r) => txt(r.machineNo)),
    C('Entry', 'Group No.', 12, 'text', (r) => txt(r.groupNo)),
    C('Entry', 'Site Engineer', 18, 'text', (r) => txt(r.siteEngineer)),
    C('Entry', 'Operator Name', 18, 'text', (r) => txt(r.operator)),
    C('Entry', 'Helper Name', 16, 'text', (r) => txt(r.helper)),
    C('Entry', 'Shift Time', 12, 'text', (r) => txt(r.shiftTime)),

    C('Reading', 'Open Reading hr.', 14, 'num', (r) => num(r.openReading)),
    C('Reading', 'Closing Reading hr.', 14, 'num', (r) => num(r.closingReading)),
    C('Reading', 'Total Hours', 12, 'num', (r) => num(r.totalHours), () => num(T.totalHours)),

    C('Boring / Pile', 'Dia', 10, 'num', (r) => num(r.dia)),
    C('Boring / Pile', 'Pile No.', 10, 'text', (r) => txt(r.pileNo)),
    C('Boring / Pile', 'Soft Soil', 11, 'num', (r) => num(r.softSoil), () => num(T.softSoil)),
    C('Boring / Pile', 'Hard Rock', 11, 'num', (r) => num(r.hardRock), () => num(T.hardRock)),
    C('Boring / Pile', 'Today Miter', 12, 'num', (r) => num(r.todayMiter), () => num(T.todayMiter)),
    C('Boring / Pile', 'Total Miter', 12, 'num', (r) => num(r.totalMiter)),
    C('Boring / Pile', 'Today Pile', 11, 'num', (r) => num(r.todayPile), () => num(T.todayPile)),
    C('Boring / Pile', 'Total Pile', 11, 'num', (r) => num(r.totalPile)),

    C('Diesel', 'Diesel (Lit.)', 12, 'num', (r) => num(r.dieselLit), () => num(T.dieselLit)),
    C('Diesel', 'Diesel Start %', 12, 'num', (r) => num(r.dieselStartPercent)),
    C('Diesel', 'Diesel Closing %', 13, 'num', (r) => num(r.dieselClosingPercent)),
    C('Diesel', 'Diesel Use %', 12, 'num', (r) => num(r.dieselUsePercent)),

    C('Bullet', 'Bullet Use', 11, 'num', (r) => num(r.bulletUse), () => num(T.bulletUse)),
    C('Bullet', 'Stock Bullet', 12, 'num', (r) => num(r.stockBullet)),
  ]

  const N = cols.length
  const ws = {}
  const merges = []
  let r = 0

  const put = (row, col, value, style, fmt) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    if (value === '' || value === null || value === undefined) {
      ws[addr] = { t: 's', v: '', s: style }
      return
    }
    const t = typeof value === 'number' ? 'n' : 's'
    ws[addr] = { t, v: value, s: style }
    if (t === 'n' && fmt) ws[addr].z = fmt
  }

  const mergeAcross = (row, from, to) => {
    if (to > from) merges.push({ s: { r: row, c: from }, e: { r: row, c: to } })
  }

  const titleStyle = {
    font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: NAVY } },
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  }
  for (let c = 0; c < N; c++) put(r, c, c === 0 ? 'Rotary Work Log Report' : '', titleStyle)
  mergeAcross(r, 0, N - 1)
  ws['!rows'] = [{ hpt: 30 }]
  r++

  if (companyInfo.name || companyInfo.company_name) {
    const companyDisplayName = companyInfo.company_name || companyInfo.name
    const subStyle = styleFor({ color: MUTED, size: 10 })
    put(r, 0, companyDisplayName, { ...subStyle, font: { ...subStyle.font, bold: true, color: { rgb: NAVY } } })
    mergeAcross(r, 0, N - 1)
    r++
  }

  const filters = []
  if (startDate && endDate) {
    filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }
  if (projectName) filters.push(`Project: ${projectName}`)

  if (filters.length) {
    filters.forEach((f) => {
      put(r, 0, f, styleFor({ color: MUTED, size: 9 }))
      r++
    })
  }
  r++

  const groups = []
  cols.forEach((c, i) => {
    const last = groups[groups.length - 1]
    if (last && last.name === c.group) last.end = i
    else groups.push({ name: c.group, start: i, end: i })
  })
  groups.forEach((g) => {
    for (let c = g.start; c <= g.end; c++) {
      put(r, c, c === g.start ? g.name : '', styleFor({ fill: NAVY, bold: true, color: 'FFFFFF', align: 'center', size: 10 }))
    }
    mergeAcross(r, g.start, g.end)
  })
  r++

  cols.forEach((c, i) => {
    put(r, i, c.header, styleFor({ fill: HEAD, bold: true, color: 'FFFFFF', align: 'center' }))
  })
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][r] = { hpt: 30 }
  r++

  if (!rows.length) {
    put(r, 0, 'No rotary work log entries match the selected filters.', styleFor({ color: MUTED, size: 10 }))
    r++
  } else {
    rows.forEach((row, ri) => {
      const fill = ri % 2 === 1 ? ZEBRA : undefined
      cols.forEach((c, i) => {
        const highlight = c.header === 'Total Hours' || c.header === 'Today Miter' || c.header === 'Total Miter'
        const align = c.align || (c.type === 'text' ? 'left' : 'right')
        put(
          r, i, c.get(row),
          styleFor({ fill, align, bold: highlight, color: highlight ? GREEN : INK }),
          c.type === 'num' ? NUM_FMT : undefined
        )
      })
      r++
    })
  }

  cols.forEach((c, i) => {
    const align = c.align || (c.type === 'text' ? 'left' : 'right')
    put(r, i, c.total(T), styleFor({ fill: TOTAL, bold: true, align }), c.type === 'num' ? NUM_FMT : undefined)
  })
  r++

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: N - 1 } })
  ws['!merges'] = merges
  ws['!cols'] = cols.map((c) => ({ wch: c.width }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws, 'Rotary')
  XLSX.writeFile(workbook, fileName)
}

export const downloadRotaryPDF = ({
  rows = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  companyInfo = {},
  host,
  fileName = 'Rotary_WorkLog_Report.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a3')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  const NAVY = [31, 56, 100]
  const NAVY_LIGHT = [52, 73, 94]
  const INK = [30, 35, 40]
  const MUTED = [110, 118, 128]
  const GREEN = [0, 128, 0]
  const TOTAL_FILL = [226, 232, 240]

  const T = tableTotals

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const fmt = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')

  const C = (g, h, get, total = () => '', align = 'center') => ({ g, h, get, total, align })

  const cols = [
    C('Entry', 'Sr', (r) => r.srNo, () => 'TOTAL'),
    C('Entry', 'Date', (r) => dateStr(r.date)),
    C('Entry', 'Site Name', (r) => txt(r.site), undefined, 'left'),
    C('Entry', 'Machine No.', (r) => txt(r.machineNo), undefined, 'left'),
    C('Entry', 'Group No.', (r) => txt(r.groupNo), undefined, 'left'),
    C('Entry', 'Site Engineer', (r) => txt(r.siteEngineer), undefined, 'left'),
    C('Entry', 'Operator Name', (r) => txt(r.operator), undefined, 'left'),
    C('Entry', 'Helper Name', (r) => txt(r.helper), undefined, 'left'),
    C('Entry', 'Shift', (r) => txt(r.shiftTime)),

    C('Reading', 'Open Hr', (r) => fmt(r.openReading)),
    C('Reading', 'Close Hr', (r) => fmt(r.closingReading)),
    C('Reading', 'Tot Hrs', (r) => fmt(r.totalHours), () => fmt(T.totalHours)),

    C('Boring', 'Dia', (r) => fmt(r.dia)),
    C('Boring', 'Pile No', (r) => txt(r.pileNo)),
    C('Boring', 'Soft Soil', (r) => fmt(r.softSoil), () => fmt(T.softSoil)),
    C('Boring', 'Hard Rock', (r) => fmt(r.hardRock), () => fmt(T.hardRock)),
    C('Boring', 'Today Mtr', (r) => fmt(r.todayMiter), () => fmt(T.todayMiter)),
    C('Boring', 'Tot Mtr', (r) => fmt(r.totalMiter)),
    C('Boring', 'Today Pile', (r) => fmt(r.todayPile), () => fmt(T.todayPile)),
    C('Boring', 'Tot Pile', (r) => fmt(r.totalPile)),

    C('Diesel', 'Dsl (L)', (r) => fmt(r.dieselLit), () => fmt(T.dieselLit)),
    C('Diesel', 'Start %', (r) => fmt(r.dieselStartPercent)),
    C('Diesel', 'Close %', (r) => fmt(r.dieselClosingPercent)),
    C('Diesel', 'Use %', (r) => fmt(r.dieselUsePercent)),

    C('Bullet', 'Bullet Use', (r) => fmt(r.bulletUse), () => fmt(T.bulletUse)),
    C('Bullet', 'Stock Bullet', (r) => fmt(r.stockBullet)),
  ]

  const drawHeader = () =>
    drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Rotary Work Log Report',
    })

  const headerBottomY = drawHeader()
  let y = headerBottomY

  const filters = []
  if (startDate && endDate) filters.push(`Date Range: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  if (projectName) filters.push(`Project: ${projectName}`)

  if (filters.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(`Applied Filters:  ${filters.join('     |     ')}`, margin, y)
    y += 7
  }

  if (!rows.length) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No rotary work log entries match the selected filters.', margin, y + 10)
  } else {
    const groupRow = []
    cols.forEach((c) => {
      const last = groupRow[groupRow.length - 1]
      if (last && last.key === c.g) last.colSpan += 1
      else groupRow.push({ key: c.g, content: c.g, colSpan: 1 })
    })
    const headGroup = groupRow.map(({ content, colSpan }) => ({ content, colSpan }))
    const headLabels = cols.map((c) => c.h)

    const body = rows.map((r) => cols.map((c) => c.get(r)))
    const totalRow = cols.map((c) => c.total(T))
    const allBody = [...body, totalRow]

    const leftCols = cols.reduce((acc, c, i) => {
      if (c.align === 'left') acc[i] = { halign: 'left' }
      return acc
    }, {})

    const totalsIndex = [
      cols.findIndex((c) => c.h === 'Tot Hrs'),
      cols.findIndex((c) => c.h === 'Today Mtr'),
      cols.findIndex((c) => c.h === 'Dsl (L)'),
    ]

    doc.autoTable({
      head: [headGroup, headLabels],
      body: allBody,
      startY: y,
      theme: 'grid',
      margin: { top: headerBottomY, left: margin, right: margin, bottom: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 6.8,
        cellPadding: 1,
        halign: 'center',
        valign: 'middle',
        textColor: INK,
        lineColor: [200, 205, 212],
        lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: NAVY_LIGHT,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: leftCols,
      didParseCell: (data) => {
        if (data.section === 'head' && data.row.index === 0) {
          data.cell.styles.fillColor = NAVY
          data.cell.styles.fontSize = 7.5
          return
        }
        if (data.section !== 'body') return

        const isTotalRow = data.row.index === allBody.length - 1
        if (isTotalRow) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = TOTAL_FILL
        } else if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [246, 248, 251]
        }

        if (totalsIndex.includes(data.column.index) && !isTotalRow) {
          data.cell.styles.textColor = GREEN
          data.cell.styles.fontStyle = 'bold'
        }
      },
      addPageContent: () => drawHeader(),
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
    })

    y = doc.lastAutoTable.finalY + 6
  }

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')}`, margin, pageHeight - 6)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, { align: 'right' })
  }

  doc.save(fileName)
}

// ─────────────────────────────────────────────────────────────────
// 5. MULTI-SITE BREAKDOWN EXPORTS
// ─────────────────────────────────────────────────────────────────

const flattenMultiSiteData = (multiSiteData) => {
  const flattened = []
  multiSiteData.forEach((site) => {
    const workTypes = site.work_types && site.work_types.length > 0 ? site.work_types : [{}]
    workTypes.forEach((wt, idx) => {
      flattened.push({
        isFirstRow: idx === 0,
        rowSpan: workTypes.length,
        projectName: site.project_name,
        workType: wt.work_type || '—',
        workPoints: wt.work_points != null ? wt.work_points : '—',
        totalHours: wt.total_hours != null ? wt.total_hours : '—',
        totalDiesel: wt.total_diesel != null ? wt.total_diesel : '—',
        workPerHour: wt.work_per_hour != null ? wt.work_per_hour : '—',
        workPerDiesel: wt.work_per_diesel != null ? wt.work_per_diesel : '—',
        siteTotalDone: site.total_done != null ? site.total_done : '—',
        siteTotalHrs: site.total_hrs != null ? site.total_hrs : '—',
        siteTotalFuel: site.total_fuel != null ? site.total_fuel : '—',
        siteAvgYield: site.avg_yield != null ? site.avg_yield : '—',
      })
    })
  })
  return flattened
}

export const downloadMultiSiteExcel = ({
  multiSiteData = [],
  date,
  companyInfo = {},
  fileName = 'MultiSiteBreakdown.xlsx',
}) => {
  const NAVY = '1F3864'
  const HEAD = '344A5E'
  const ZEBRA = 'F6F8FB'
  const TOTAL = 'E2E8F0'
  const GREEN = '008000'
  const INK = '1E2328'
  const MUTED = '6E7680'
  const LINE = 'C8CDD4'
  const NUM_FMT = '[>=10000000]##\\,##\\,##\\,##0.00;[>=100000]##\\,##\\,##0.00;##,##0.00'

  const thin = { style: 'thin', color: { rgb: LINE } }
  const border = { top: thin, bottom: thin, left: thin, right: thin }

  const styleFor = ({ fill, bold = false, color = INK, align = 'left', size = 9 } = {}) => ({
    font: { name: 'Calibri', sz: size, bold, color: { rgb: color } },
    fill: fill ? { patternType: 'solid', fgColor: { rgb: fill } } : undefined,
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border,
  })

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const num = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : 'All')

  const cols = [
    { header: 'Site / Project', width: 22, type: 'text', align: 'left', get: (r) => txt(r.projectName) },
    { header: 'Work Type', width: 16, type: 'text', align: 'left', get: (r) => txt(r.workType) },
    { header: 'Points Done', width: 13, type: 'num', align: 'right', get: (r) => num(r.workPoints) },
    { header: 'Run Hrs', width: 12, type: 'num', align: 'right', get: (r) => num(r.totalHours) },
    { header: 'Fuel (L)', width: 12, type: 'num', align: 'right', get: (r) => num(r.totalDiesel) },
    { header: 'Work / Hr', width: 12, type: 'num', align: 'right', get: (r) => num(r.workPerHour) },
    { header: 'Work / L', width: 12, type: 'num', align: 'right', get: (r) => num(r.workPerDiesel) },
    { header: 'Site Total Points', width: 16, type: 'num', align: 'right', get: (r) => (r.isFirstRow ? num(r.siteTotalDone) : '') },
    { header: 'Site Total Hrs', width: 14, type: 'num', align: 'right', get: (r) => (r.isFirstRow ? num(r.siteTotalHrs) : '') },
    { header: 'Site Total Fuel (L)', width: 16, type: 'num', align: 'right', get: (r) => (r.isFirstRow ? num(r.siteTotalFuel) : '') },
    { header: 'Site Avg Yield', width: 14, type: 'num', align: 'right', get: (r) => (r.isFirstRow ? num(r.siteAvgYield) : '') },
  ]

  const flattened = flattenMultiSiteData(multiSiteData || [])
  const grandPoints = (multiSiteData || []).reduce((s, x) => s + (parseFloat(x.total_done) || 0), 0)
  const grandHrs = (multiSiteData || []).reduce((s, x) => s + (parseFloat(x.total_hrs) || 0), 0)
  const grandFuel = (multiSiteData || []).reduce((s, x) => s + (parseFloat(x.total_fuel) || 0), 0)
  const grandAvgYield = grandHrs > 0 ? (grandPoints / grandHrs) : 0

  const totals = [
    'TOTAL',
    '',
    grandPoints,
    grandHrs,
    grandFuel,
    '',
    '',
    grandPoints,
    grandHrs,
    grandFuel,
    grandAvgYield,
  ]

  const N = cols.length
  const ws = {}
  const merges = []
  let r = 0

  const put = (row, col, value, style, fmt) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    if (value === '' || value === null || value === undefined) {
      ws[addr] = { t: 's', v: '', s: style }
      return
    }
    const t = typeof value === 'number' ? 'n' : 's'
    ws[addr] = { t, v: value, s: style }
    if (t === 'n' && fmt) ws[addr].z = fmt
  }

  const mergeAcross = (row, from, to) => {
    if (to > from) merges.push({ s: { r: row, c: from }, e: { r: row, c: to } })
  }

  const titleStyle = {
    font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: NAVY } },
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  }
  for (let c = 0; c < N; c++) put(r, c, c === 0 ? 'Multi-Site Breakdown Report' : '', titleStyle)
  mergeAcross(r, 0, N - 1)
  ws['!rows'] = [{ hpt: 30 }]
  r++

  if (companyInfo.name || companyInfo.company_name) {
    const companyDisplayName = companyInfo.company_name || companyInfo.name
    const subStyle = styleFor({ color: MUTED, size: 10 })
    put(r, 0, companyDisplayName, { ...subStyle, font: { ...subStyle.font, bold: true, color: { rgb: NAVY } } })
    mergeAcross(r, 0, N - 1)
    r++
  }

  put(r, 0, `Active Day: ${dateStr(date)}   |   Total Sites Active: ${(multiSiteData || []).length}`, styleFor({ color: MUTED, size: 9 }))
  mergeAcross(r, 0, N - 1)
  r++
  r++

  cols.forEach((c, i) => {
    put(r, i, c.header, styleFor({ fill: HEAD, bold: true, color: 'FFFFFF', align: 'center' }))
  })
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][r] = { hpt: 30 }
  r++

  if (!flattened.length) {
    put(r, 0, 'No multi-site data available for the selected date.', styleFor({ color: MUTED, size: 10 }))
    r++
  } else {
    flattened.forEach((row, ri) => {
      const fill = ri % 2 === 1 ? ZEBRA : undefined
      cols.forEach((c, i) => {
        const val = c.get(row)
        put(
          r, i, val,
          styleFor({ fill, align: c.align, bold: false, color: INK }),
          c.type === 'num' && typeof val === 'number' ? NUM_FMT : undefined
        )
      })
      r++
    })
  }

  totals.forEach((val, i) => {
    const isNum = typeof val === 'number'
    put(
      r, i, val,
      styleFor({ fill: TOTAL, bold: true, align: isNum ? 'right' : (i === 0 ? 'center' : 'left'), color: isNum ? GREEN : INK }),
      isNum ? NUM_FMT : undefined
    )
  })
  r++

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: N - 1 } })
  ws['!merges'] = merges
  ws['!cols'] = cols.map((c) => ({ wch: c.width }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws, 'MultiSiteBreakdown')
  XLSX.writeFile(workbook, fileName)
}

export const downloadMultiSitePDF = ({
  multiSiteData = [],
  date,
  companyInfo = {},
  host,
  fileName = 'MultiSiteBreakdown.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  const NAVY = [31, 56, 100]
  const NAVY_LIGHT = [52, 73, 94]
  const INK = [30, 35, 40]
  const MUTED = [110, 118, 128]
  const GREEN = [0, 128, 0]
  const TOTAL_FILL = [226, 232, 240]

  const drawHeader = () => {
    return drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'Multi-Site Breakdown Report',
    })
  }

  const headerBottomY = drawHeader()
  let startY = headerBottomY

  if (!multiSiteData || multiSiteData.length === 0) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...MUTED)
    doc.text('No data available for the selected date.', margin + 8, startY + 10)
    doc.save(fileName)
    return
  }

  const grandPoints = multiSiteData.reduce((s, x) => s + (parseFloat(x.total_done) || 0), 0)
  const grandHrs = multiSiteData.reduce((s, x) => s + (parseFloat(x.total_hrs) || 0), 0)
  const grandFuel = multiSiteData.reduce((s, x) => s + (parseFloat(x.total_fuel) || 0), 0)
  const grandAvgYield = grandHrs > 0 ? (grandPoints / grandHrs).toFixed(2) : '0.00'

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  const dateFormatted = date ? new Date(date).toLocaleDateString('en-GB') : 'All'
  doc.text(
    `Active Day: ${dateFormatted}   |   Total Sites: ${multiSiteData.length}   |   Grand Total Points: ${grandPoints.toFixed(2)}   |   Total Run Hrs: ${grandHrs.toFixed(2)} hrs   |   Total Fuel: ${grandFuel.toFixed(2)} L   |   Fleet Avg Yield: ${grandAvgYield}`,
    margin + 8,
    startY
  )
  startY += 8

  const tableColumn = [
    'Work Type',
    'Points Done',
    'Run Hrs',
    'Fuel (L)',
    'Work/Hr',
    'Work/L',
  ]

  multiSiteData.forEach((site) => {
    if (startY > pageHeight - 55) {
      doc.addPage()
      drawHeader()
      startY = headerBottomY
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...NAVY)
    doc.text(`Site: ${site.project_name || 'Unnamed Site'}`, margin + 8, startY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...MUTED)
    const summaryLine = `Total Points: ${site.total_done ?? 0}   |   Run Hrs: ${site.total_hrs ?? 0} hrs   |   Fuel: ${site.total_fuel ?? 0} L   |   Avg Yield: ${site.avg_yield ?? 0}`
    doc.text(summaryLine, margin + 8, startY + 4.5)
    startY += 8

    const workTypes = site.work_types && site.work_types.length > 0 ? site.work_types : []
    const tableRows = workTypes.map((wt) => [
      wt.work_type || '—',
      wt.work_points != null ? wt.work_points : '—',
      wt.total_hours != null ? `${wt.total_hours} hrs` : '—',
      wt.total_diesel != null ? `${wt.total_diesel} L` : '—',
      wt.work_per_hour != null ? wt.work_per_hour : '—',
      wt.work_per_diesel != null ? wt.work_per_diesel : '—',
    ])

    if (tableRows.length === 0) {
      tableRows.push(['No work log recorded', '—', '—', '—', '—', '—'])
    }

    tableRows.push([
      'SITE TOTAL',
      site.total_done != null ? site.total_done : '—',
      site.total_hrs != null ? `${site.total_hrs} hrs` : '—',
      site.total_fuel != null ? `${site.total_fuel} L` : '—',
      '—',
      site.avg_yield != null ? site.avg_yield : '—',
    ])

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: startY,
      theme: 'grid',
      margin: { left: margin + 8, right: margin + 8, bottom: margin },
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        textColor: INK,
        lineColor: [200, 205, 212],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: NAVY_LIGHT,
        textColor: 255,
        fontSize: 8.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [246, 248, 251],
      },
      didParseCell: (data) => {
        if (['Work/Hr', 'Work/L'].includes(data.column.dataKey)) {
          data.cell.styles.textColor = GREEN
        }
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = TOTAL_FILL
        }
      },
    })

    startY = doc.lastAutoTable.finalY + 8
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-GB')}`,
      margin + 8,
      pageHeight - 6
    )
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 8, pageHeight - 6, {
      align: 'right',
    })
  }

  doc.save(fileName)
}

// ─────────────────────────────────────────────────────────────────
// 6. SEPARATE TATA WORK LOG REPORT EXPORTS
// ─────────────────────────────────────────────────────────────────

export const downloadTataExcel = ({
  rows = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  companyInfo = {},
  fileName = 'TATA_WorkLog_Report.xlsx',
}) => {
  const T = tableTotals

  const NAVY = '1F3864'
  const HEAD = '344A5E'
  const ZEBRA = 'F6F8FB'
  const TOTAL = 'E2E8F0'
  const GREEN = '008000'
  const INK = '1E2328'
  const MUTED = '6E7680'
  const LINE = 'C8CDD4'

  const NUM_FMT = '[>=10000000]##\\,##\\,##\\,##0.00;[>=100000]##\\,##\\,##0.00;##,##0.00'

  const thin = { style: 'thin', color: { rgb: LINE } }
  const border = { top: thin, bottom: thin, left: thin, right: thin }

  const styleFor = ({ fill, bold = false, color = INK, align = 'left', size = 9 } = {}) => ({
    font: { name: 'Calibri', sz: size, bold, color: { rgb: color } },
    fill: fill ? { patternType: 'solid', fgColor: { rgb: fill } } : undefined,
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border,
  })

  const isEmpty = (v) => v === undefined || v === null || v === '' || v === '—'
  const num = (v) => {
    if (isEmpty(v)) return ''
    const n = parseFloat(v)
    return isNaN(n) ? '' : n
  }
  const txt = (v) => (isEmpty(v) ? '' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '')

  const C = (header, width, type, get, total, align) => ({
    header, width, type, get, total: total || (() => ''), align,
  })

  const cols = [
    C('S.No.', 8, 'int', (r) => r.srNo, () => 'TOTAL', 'center'),
    C('Date', 12, 'text', (r) => dateStr(r.date)),
    C('Shift', 12, 'text', (r) => txt(r.shift)),
    C('Site / Location', 24, 'text', (r) => txt(r.siteLocation || r.site)),
    C('Hole Type', 18, 'text', (r) => txt(r.holeType)),
    C('Machine No.', 16, 'text', (r) => txt(r.machineNo)),
    C('Open Reading (m)', 16, 'num', (r) => num(r.openReading)),
    C('Closing Reading (m)', 18, 'num', (r) => num(r.closingReading)),
    C('Today Hours (hrs)', 16, 'num', (r) => num(r.todayHours), () => num(T.todayHours)),
    C('Hole size', 22, 'text', (r) => txt(r.holeSize)),
    C('Today Mtr (m)', 14, 'num', (r) => num(r.todayMtr), () => num(T.todayMtr)),
    C('Total Mtr (Cum.)', 16, 'num', (r) => num(r.totalMtr)),
    C('Operator Name', 16, 'text', (r) => txt(r.operator)),
    C('Helper Name', 16, 'text', (r) => txt(r.helper)),
    C('Today Diesel Used (ltr)', 20, 'num', (r) => num(r.todayDieselUsed), () => num(T.todayDieselUsed)),
    C('Total Diesel Taken (Cum.)', 22, 'num', (r) => num(r.totalDieselTaken), () => num(T.totalDieselTaken)),
    C('Today Holes', 13, 'num', (r) => num(r.todayHoles), () => num(T.todayHoles)),
    C('Total Holes (Cum.)', 16, 'num', (r) => num(r.totalHoles)),
  ]

  const N = cols.length
  const ws = {}
  const merges = []
  let r = 0

  const put = (row, col, value, style, fmt) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    if (value === '' || value === null || value === undefined) {
      ws[addr] = { t: 's', v: '', s: style }
      return
    }
    const t = typeof value === 'number' ? 'n' : 's'
    ws[addr] = { t, v: value, s: style }
    if (t === 'n' && fmt) ws[addr].z = fmt
  }

  const mergeAcross = (row, from, to) => {
    if (to > from) merges.push({ s: { r: row, c: from }, e: { r: row, c: to } })
  }

  const titleStyle = {
    font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: NAVY } },
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
  }
  for (let c = 0; c < N; c++) put(r, c, c === 0 ? 'DESHMUKH INFRA SOLUTION LLP — DAILY DRILLING PROGRESS REPORT (TATA WORK)' : '', titleStyle)
  mergeAcross(r, 0, N - 1)
  ws['!rows'] = [{ hpt: 28 }]
  r++

  const filters = []
  if (projectName) filters.push(`Site / Project: ${projectName}`)
  if (startDate && endDate) {
    filters.push(`Period: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }

  if (filters.length) {
    put(r, 0, filters.join('   |   '), styleFor({ color: MUTED, size: 9 }))
    mergeAcross(r, 0, N - 1)
    r++
  }
  r++

  cols.forEach((c, i) => {
    put(r, i, c.header, styleFor({ fill: NAVY, bold: true, color: 'FFFFFF', align: 'center', size: 10 }))
  })
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][r] = { hpt: 28 }
  r++

  if (!rows.length) {
    put(r, 0, 'No TATA work log entries match the selected filters.', styleFor({ color: MUTED, size: 10 }))
    r++
  } else {
    rows.forEach((row, ri) => {
      const fill = ri % 2 === 1 ? ZEBRA : undefined
      cols.forEach((c, i) => {
        const highlight = c.header === 'Today Hours (hrs)' || c.header === 'Today Mtr (m)' || c.header === 'Today Holes'
        const align = c.align || (c.type === 'text' ? 'left' : 'right')
        put(
          r, i, c.get(row),
          styleFor({ fill, align, bold: highlight, color: highlight ? GREEN : INK }),
          c.type === 'num' ? NUM_FMT : undefined
        )
      })
      r++
    })
  }

  // Totals Row
  cols.forEach((c, i) => {
    const align = c.align || (c.type === 'text' ? 'left' : 'right')
    put(r, i, c.total(T), styleFor({ fill: TOTAL, bold: true, align }), c.type === 'num' ? NUM_FMT : undefined)
  })
  r++
  r++

  // Summary section matching uploaded Excel format
  if (rows.length > 0) {
    const sumHeaderStyle = {
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { patternType: 'solid', fgColor: { rgb: HEAD } },
      alignment: { horizontal: 'left', vertical: 'center' },
    }
    put(r, 0, 'DESHMUKH INFRA SOLUTION LLP — DRILLING PROGRESS SUMMARY', sumHeaderStyle)
    mergeAcross(r, 0, 4)
    r++

    put(r, 0, 'OVERALL TOTALS (ENTIRE PERIOD)', styleFor({ bold: true, size: 10 }))
    mergeAcross(r, 0, 4)
    r++

    const summaryRows = [
      ['Total Shift Entries', rows.length],
      ['Total Drilling Hours (Today Hours, sum)', T.todayHours || 0],
      ['Total Meters Drilled (Today Mtr, sum)', T.todayMtr || 0],
      ['Total Holes Drilled (Today Holes, sum)', T.todayHoles || 0],
      ['Total Diesel Used (Today Diesel, sum, ltr)', T.todayDieselUsed || 0],
      ['Latest Cumulative Total Mtr (last log entry)', rows[rows.length - 1]?.totalMtr || '—'],
      ['Latest Cumulative Total Holes (last log entry)', rows[rows.length - 1]?.totalHoles || '—'],
    ]

    summaryRows.forEach(([lbl, val]) => {
      put(r, 0, lbl, styleFor({ size: 9 }))
      put(r, 1, val, styleFor({ bold: true, size: 9 }))
      r++
    })
    r++

    // Shift-wise breakup
    const shiftMap = {}
    rows.forEach(rw => {
      const sh = rw.shift || 'Day Shift'
      if (!shiftMap[sh]) shiftMap[sh] = { entries: 0, hours: 0, meters: 0, holes: 0 }
      shiftMap[sh].entries += 1
      shiftMap[sh].hours += parseFloat(rw.todayHours) || 0
      shiftMap[sh].meters += parseFloat(rw.todayMtr) || 0
      shiftMap[sh].holes += parseFloat(rw.todayHoles) || 0
    })

    put(r, 0, 'SHIFT-WISE BREAKUP (TODAY VALUES, SUMMED)', styleFor({ bold: true, size: 10 }))
    mergeAcross(r, 0, 4)
    r++

    const shiftHeaders = ['Shift', 'Entries', 'Hours', 'Meters', 'Holes']
    shiftHeaders.forEach((shh, ci) => {
      put(r, ci, shh, styleFor({ fill: TOTAL, bold: true, align: ci === 0 ? 'left' : 'right' }))
    })
    r++

    Object.keys(shiftMap).forEach(shName => {
      const s = shiftMap[shName]
      put(r, 0, shName, styleFor())
      put(r, 1, s.entries, styleFor({ align: 'right' }))
      put(r, 2, parseFloat(s.hours.toFixed(2)), styleFor({ align: 'right' }))
      put(r, 3, parseFloat(s.meters.toFixed(2)), styleFor({ align: 'right' }))
      put(r, 4, parseFloat(s.holes.toFixed(2)), styleFor({ align: 'right' }))
      r++
    })
    r++

    // Operator-wise breakup
    const opMap = {}
    rows.forEach(rw => {
      const op = rw.operator || 'Unknown'
      if (!opMap[op]) opMap[op] = { entries: 0, hours: 0, meters: 0, holes: 0 }
      opMap[op].entries += 1
      opMap[op].hours += parseFloat(rw.todayHours) || 0
      opMap[op].meters += parseFloat(rw.todayMtr) || 0
      opMap[op].holes += parseFloat(rw.todayHoles) || 0
    })

    put(r, 0, 'OPERATOR-WISE BREAKUP (TODAY VALUES, SUMMED)', styleFor({ bold: true, size: 10 }))
    mergeAcross(r, 0, 4)
    r++

    const opHeaders = ['Operator Name (as logged)', 'Shift Entries', 'Hours', 'Meters', 'Holes']
    opHeaders.forEach((oph, ci) => {
      put(r, ci, oph, styleFor({ fill: TOTAL, bold: true, align: ci === 0 ? 'left' : 'right' }))
    })
    r++

    Object.keys(opMap).forEach(opName => {
      const o = opMap[opName]
      put(r, 0, opName, styleFor())
      put(r, 1, o.entries, styleFor({ align: 'right' }))
      put(r, 2, parseFloat(o.hours.toFixed(2)), styleFor({ align: 'right' }))
      put(r, 3, parseFloat(o.meters.toFixed(2)), styleFor({ align: 'right' }))
      put(r, 4, parseFloat(o.holes.toFixed(2)), styleFor({ align: 'right' }))
      r++
    })
  }

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: N - 1 } })
  ws['!merges'] = merges
  ws['!cols'] = cols.map((c) => ({ wch: c.width }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws, 'TATA Work')
  XLSX.writeFile(workbook, fileName)
}

export const downloadTataPDF = ({
  rows = [],
  tableTotals = {},
  startDate,
  endDate,
  projectName,
  companyInfo = {},
  host,
  fileName = 'TATA_WorkLog_Report.pdf',
}) => {
  const doc = new jsPDF('l', 'mm', 'a3')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  const NAVY = [31, 56, 100]
  const NAVY_LIGHT = [52, 73, 94]
  const INK = [30, 35, 40]
  const MUTED = [110, 118, 128]
  const GREEN = [0, 128, 0]
  const TOTAL_FILL = [226, 232, 240]

  const fmt = (v) => {
    if (v === undefined || v === null || v === '' || v === '—') return '—'
    const n = parseFloat(v)
    return isNaN(n) ? String(v) : n.toLocaleString('en-IN')
  }
  const txt = (v) => (v === undefined || v === null || v === '' ? '—' : String(v))
  const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '—')

  const C = (h, get, total, align = 'center') => ({
    h, get, total: total || (() => '—'), align,
  })

  const cols = [
    C('S.No.', (r) => r.srNo, () => 'TOTAL', 'center'),
    C('Date', (r) => dateStr(r.date)),
    C('Shift', (r) => txt(r.shift)),
    C('Site / Location', (r) => txt(r.siteLocation || r.site), undefined, 'left'),
    C('Hole Type', (r) => txt(r.holeType)),
    C('Machine No.', (r) => txt(r.machineNo)),
    C('Open Reading', (r) => fmt(r.openReading)),
    C('Closing Reading', (r) => fmt(r.closingReading)),
    C('Today Hours', (r) => fmt(r.todayHours), () => fmt(tableTotals.todayHours)),
    C('Hole Size', (r) => txt(r.holeSize)),
    C('Today Mtr', (r) => fmt(r.todayMtr), () => fmt(tableTotals.todayMtr)),
    C('Total Mtr', (r) => fmt(r.totalMtr)),
    C('Operator', (r) => txt(r.operator), undefined, 'left'),
    C('Helper', (r) => txt(r.helper), undefined, 'left'),
    C('Diesel Used', (r) => fmt(r.todayDieselUsed), () => fmt(tableTotals.todayDieselUsed)),
    C('Diesel Taken', (r) => fmt(r.totalDieselTaken), () => fmt(tableTotals.totalDieselTaken)),
    C('Today Holes', (r) => fmt(r.todayHoles), () => fmt(tableTotals.todayHoles)),
    C('Total Holes', (r) => fmt(r.totalHoles)),
  ]

  const drawHeader = () =>
    drawCompanyHeader({
      doc,
      companyInfo,
      host,
      pageWidth,
      pageHeight,
      margin,
      titleText: 'DAILY DRILLING PROGRESS REPORT (TATA WORK)',
    })

  const headerBottomY = drawHeader()
  let y = headerBottomY

  const filters = []
  if (projectName) filters.push(`Site: ${projectName}`)
  if (startDate && endDate) {
    filters.push(`Period: ${dateStr(startDate)} to ${dateStr(endDate)}`)
  }

  if (filters.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(`Filters:  ${filters.join('     |     ')}`, margin, y)
    y += 7
  }

  if (!rows.length) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No TATA work log entries match the selected filters.', margin, y + 10)
  } else {
    const headLabels = cols.map((c) => c.h)
    const body = rows.map((r) => cols.map((c) => c.get(r)))
    const totalRow = cols.map((c) => c.total(tableTotals))
    const allBody = [...body, totalRow]

    const leftCols = cols.reduce((acc, c, i) => {
      if (c.align === 'left') acc[i] = { halign: 'left' }
      return acc
    }, {})

    doc.autoTable({
      head: [headLabels],
      body: allBody,
      startY: y,
      theme: 'grid',
      margin: { top: headerBottomY, left: margin, right: margin, bottom: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 7,
        cellPadding: 1.2,
        halign: 'center',
        valign: 'middle',
        textColor: INK,
        lineColor: [200, 205, 212],
        lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: NAVY,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: leftCols,
      didParseCell: (data) => {
        if (data.section !== 'body') return

        const isTotalRow = data.row.index === allBody.length - 1
        if (isTotalRow) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = TOTAL_FILL
        } else if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [246, 248, 251]
        }
      },
      addPageContent: () => drawHeader(),
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
    })

    y = doc.lastAutoTable.finalY + 6
  }

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-GB')}`,
      margin + 8,
      pageHeight - 6
    )
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 8, pageHeight - 6, {
      align: 'right',
    })
  }

  doc.save(fileName)
}

