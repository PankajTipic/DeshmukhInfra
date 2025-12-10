import React from 'react'
import { CButton, CFormSelect } from '@coreui/react'
import { useTranslation } from 'react-i18next'

export function Dropdown({ ReportOptions, selectedOption, setSelectedOption }) {
  const { t, ready } = useTranslation('global')

  if (!ready) return <div>{t('LABELS.loading')}</div>

  // Add placeholder option for dropdown
  const optionsWithPlaceholder = [
    ...ReportOptions,
  ]

  return (
    <div>
      
      <CFormSelect
        id="report-select"
        options={optionsWithPlaceholder}
        value={selectedOption}
        onChange={(e) => setSelectedOption(e.target.value)}
      />
    </div>
  )
}

export function Button({ fetchReportData }) {
  const { t, ready } = useTranslation('global')

  if (!ready) return <div>{t('LABELS.loading')}</div>

  return (
    <div>
      <CButton color="success" onClick={fetchReportData}>
        {t('LABELS.fetch_report')}
      </CButton>
    </div>
  )
}
