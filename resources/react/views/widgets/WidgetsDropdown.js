// import React, { useEffect, useRef, useState } from 'react'
// import PropTypes from 'prop-types'
// import 'chartjs-plugin-datalabels'// To modify the data on barghaph

// import {
//   CRow,
//   CCol,
//   CDropdown,
//   CDropdownMenu,
//   CDropdownItem,
//   CDropdownToggle,
//   CWidgetStatsA,
// } from '@coreui/react'
// import { getStyle } from '@coreui/utils'
// import { CChartBar } from '@coreui/react-chartjs'
// import CIcon from '@coreui/icons-react'
// import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'
// import { color } from 'chart.js/helpers'
// import { getUserType } from '../../util/session'
// import { useTranslation } from 'react-i18next'



// // const WidgetsDropdown = ({ className, reportMonth, activeFilter, selectedRangeTotals }) => {
// //   const user = getUserType();
// //   const { t } = useTranslation('global');

// //   // ── Decide which values to display ────────────────────────────────
// //   let displaySales    = 0;
// //   let displayExpense  = 0;
// //   let displayPandL    = 0;
// //   let displayTax      = 0;
// //   let periodLabel     = reportMonth.currentMonth || t('this month');

// //   const isYearView = activeFilter === 'year';

// //   if (isYearView) {
// //     // Original logic – current calendar month
// //     const now = new Date();
// //     const currentMonthIndex = now.getMonth(); // 0 = Jan, 1 = Feb, ...

// //     displaySales   = reportMonth.monthlySales?.[currentMonthIndex]   ?? 0;
// //     displayExpense = reportMonth.monthlyExpense?.[currentMonthIndex] ?? 0;
// //     displayPandL   = reportMonth.monthlyPandL?.[currentMonthIndex]   ?? 0;
// //     displayTax     = reportMonth.monthlyTax?.[currentMonthIndex]     ?? 0;

// //     const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
// //     periodLabel = months[currentMonthIndex] || t('this month');
// //   } else {
// //     // For Quarter / Month / Week / Custom → show totals of selected range
// //     displaySales   = selectedRangeTotals?.totalSales   ?? reportMonth.totals?.totalSales   ?? 0;
// //     displayExpense = selectedRangeTotals?.totalExpenses ?? reportMonth.totals?.totalExpenses ?? 0;
// //     displayPandL   = selectedRangeTotals?.totalPL      ?? reportMonth.totals?.totalPL      ?? 0;
// //     displayTax     = selectedRangeTotals?.totalTax     ?? reportMonth.totals?.totalTax     ?? 0;

// //     periodLabel = activeFilter === 'custom'
// //       ? t('selected period')
// //       : t(activeFilter); // "quarter", "month", "week"
// //   }

// //   // Formatting helpers (keep your existing ones)
// //   const formatCurrency = (amount) => {
// //     if (!amount && amount !== 0) return '0 ₹';
// //     return `${Math.round(Number(amount)).toLocaleString('en-IN')} ₹`;
// //   };

// //   const getPandLDisplay = (value) => {
// //     if (value === 0) return '0 ₹';
// //     const sign = value > 0 ? t('Balance') : t('Balance'); // you may want Profit / Loss translation
// //     return `${formatCurrency(Math.abs(value))} (${sign})`;
// //   };

// //   const getPandLColor = (value) => {
// //     if (value === 0) return 'info';
// //     return value > 0 ? 'success' : 'danger';
// //   };

// //   return (
// //     <>
// //       {(user === 0 || user === 1) && (
// //         <CRow className={className} xs={{ gutter: 4 }}>
// //           {/* Balance / Cash in Hand */}
// //           <CCol sm={6} lg={3}>
// //             <CWidgetStatsA
// //               color={getPandLColor(displayPandL)}
// //               value={
// //                 <div className="fs-5 fw-semibold">
// //                   {getPandLDisplay(displayPandL)}
// //                   <span className="fs-6 fw-normal ms-2">
// //                     {t('in')} {periodLabel}
// //                   </span>
// //                 </div>
// //               }
// //               title={<span style={{ color: 'white' }}>{t('Cash in Hands')}</span>}
// //             />
// //           </CCol>

// //           {/* Income */}
// //           <CCol sm={6} lg={3}>
// //             <CWidgetStatsA
// //               color="success"
// //               value={
// //                 <div className="fs-5 fw-semibold">
// //                   {formatCurrency(displaySales)}
// //                   <span className="fs-6 fw-normal ms-2">
// //                     {t('in')} {periodLabel}
// //                   </span>
// //                 </div>
// //               }
// //               title={<span style={{ color: 'white' }}>{t('Income')}</span>}
// //             />
// //           </CCol>

// //           {/* Expenses */}
// //           <CCol sm={6} lg={3}>
// //             <CWidgetStatsA
// //               color="danger"
// //               value={
// //                 <div className="fs-5 fw-semibold">
// //                   {formatCurrency(displayExpense)}
// //                   <span className="fs-6 fw-normal ms-2">
// //                     {t('in')} {periodLabel}
// //                   </span>
// //                 </div>
// //               }
// //               title={<span style={{ color: 'white' }}>{t('Expenses')}</span>}
// //             />
// //           </CCol>

// //           {/* Tax Collected */}
// //           <CCol sm={6} lg={3}>
// //             <CWidgetStatsA
// //               color="info"
// //               value={
// //                 <div className="fs-5 fw-semibold">
// //                   {formatCurrency(displayTax)}
// //                   <span className="fs-6 fw-normal ms-2">
// //                     {t('in')} {periodLabel}
// //                   </span>
// //                 </div>
// //               }
// //               title={<span style={{ color: 'white' }}>{t('Tax Collected')}</span>}
// //             />
// //           </CCol>
// //         </CRow>
// //       )}
// //     </>
// //   );
// // };

// // export default WidgetsDropdown;























// const WidgetsDropdown = ({ className, reportMonth, activeFilter, selectedRangeTotals }) => {
//   const { t } = useTranslation('global');
//   const user = getUserType();

//   // ── Totals come from selected range (not current month) ──
//   const totals = selectedRangeTotals || reportMonth.totals || {
//     totalSales: 0,
//     totalExpenses: 0,
//     totalPL: 0,
//     totalTax: 0,
//   };

//   const displaySales   = Number(totals.totalSales   || 0);
//   const displayExpense = Number(totals.totalExpenses || 0);
//   const displayPandL   = Number(totals.totalPL      || 0);
//   const displayTax     = Number(totals.totalTax     || 0);

//   // Period label
//   let periodLabel = t('selected period');
//   if (activeFilter === 'month') periodLabel = t('this month');
//   if (activeFilter === 'year')  periodLabel = t('this year');
//   if (activeFilter === 'quarter') periodLabel = t('this quarter');
//   if (activeFilter === 'week')  periodLabel = t('this week');

//   const formatCurrency = (amount) => {
//     return `${Math.round(Number(amount)).toLocaleString('en-IN')} ₹`;
//   };

//   const getPandLDisplay = (value) => {
//     if (value === 0) return '0 ₹';
//     const isProfit = value > 0;
//     return `${formatCurrency(Math.abs(value))} (${isProfit ? t('Profit') : t('Loss')})`;
//   };

//   const getPandLColor = (value) => value > 0 ? 'success' : value < 0 ? 'danger' : 'info';

//   return (
//     <>
//       {(user === 0 || user === 1) && (
//         <CRow className={className} xs={{ gutter: 4 }}>
//           <CCol sm={6} lg={3}>
//             <CWidgetStatsA
//               color={getPandLColor(displayPandL)}
//               value={
//                 <div className="fs-5 fw-semibold">
//                   {getPandLDisplay(displayPandL)}
//                   <span className="fs-6 fw-normal ms-2">
//                     {t('in')} {periodLabel}
//                   </span>
//                 </div>
//               }
//               title={<span style={{ color: 'white' }}>{t('Balance')}</span>}
//             />
//           </CCol>

//           <CCol sm={6} lg={3}>
//             <CWidgetStatsA
//               color="success"
//               value={
//                 <div className="fs-5 fw-semibold">
//                   {formatCurrency(displaySales)}
//                   <span className="fs-6 fw-normal ms-2">
//                     {t('in')} {periodLabel}
//                   </span>
//                 </div>
//               }
//               title={<span style={{ color: 'white' }}>{t('Income')}</span>}
//             />
//           </CCol>

//           <CCol sm={6} lg={3}>
//             <CWidgetStatsA
//               color="danger"
//               value={
//                 <div className="fs-5 fw-semibold">
//                   {formatCurrency(displayExpense)}
//                   <span className="fs-6 fw-normal ms-2">
//                     {t('in')} {periodLabel}
//                   </span>
//                 </div>
//               }
//               title={<span style={{ color: 'white' }}>{t('Expenses')}</span>}
//             />
//           </CCol>

//           <CCol sm={6} lg={3}>
//             <CWidgetStatsA
//               color="info"
//               value={
//                 <div className="fs-5 fw-semibold">
//                   {formatCurrency(displayTax)}
//                   <span className="fs-6 fw-normal ms-2">
//                     {t('in')} {periodLabel}
//                   </span>
//                 </div>
//               }
//               title={<span style={{ color: 'white' }}>{t('Tax Collected')}</span>}
//             />
//           </CCol>
//         </CRow>
//       )}
//     </>
//   );
// };




import React from 'react';
import {
  CRow,
  CCol,
  CWidgetStatsA,
} from '@coreui/react';
import { useTranslation } from 'react-i18next';
import { getUserType } from '../../util/session';

const WidgetsDropdown = ({
  className,
  reportMonth,
  activeFilter,
  selectedRangeTotals,
}) => {
  const { t } = useTranslation('global');
  const user = getUserType();

  // Use provided totals or fallback to zeros
  const totals = selectedRangeTotals || reportMonth?.totals || {
    totalSales: 0,
    totalExpenses: 0,
    totalPL: 0,
    totalTax: 0,
  };

  const displaySales   = Number(totals.totalSales   || 0);
  const displayExpense = Number(totals.totalExpenses || 0);
  const displayPandL   = Number(totals.totalPL      || 0);
  const displayTax     = Number(totals.totalTax     || 0);

  // Dynamic period label based on active filter
  let periodLabel = t('selected period');
  if (activeFilter === 'month')    periodLabel = t('this month');
  if (activeFilter === 'year')     periodLabel = t('this year');
  if (activeFilter === 'quarter')  periodLabel = t('this quarter');
  if (activeFilter === 'week')     periodLabel = t('this week');

  // Format currency with Indian rupee style
  const formatCurrency = (amount) =>
    `${Math.round(Number(amount)).toLocaleString('en-IN')} ₹`;

  // Profit/Loss display logic
  const getPandLDisplay = (value) => {
    if (value === 0) return '0 ₹';
    const isProfit = value > 0;
    return `${formatCurrency(Math.abs(value))} (${isProfit ? t('Profit') : t('Loss')})`;
  };

  // Color logic for P&L widget
  const getPandLColor = (value) =>
    value > 0 ? 'success' : value < 0 ? 'danger' : 'info';

  return (
    <>
      {(user === 0 || user === 1) && (
        <CRow className={className} xs={{ gutter: 4 }}>
          {/* Balance / Profit & Loss */}
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color={getPandLColor(displayPandL)}
              value={
                <div className="fs-5 fw-semibold">
                  {getPandLDisplay(displayPandL)}
                  <span className="fs-6 fw-normal ms-2">
                    {t('in')} {periodLabel}
                  </span>
                </div>
              }
              title={<span style={{ color: 'white' }}>{t('Balance')}</span>}
            />
          </CCol>

          {/* Income */}
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="success"
              value={
                <div className="fs-5 fw-semibold">
                  {formatCurrency(displaySales)}
                  <span className="fs-6 fw-normal ms-2">
                    {t('in')} {periodLabel}
                  </span>
                </div>
              }
              title={<span style={{ color: 'white' }}>{t('Income')}</span>}
            />
          </CCol>

          {/* Expenses */}
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="danger"
              value={
                <div className="fs-5 fw-semibold">
                  {formatCurrency(displayExpense)}
                  <span className="fs-6 fw-normal ms-2">
                    {t('in')} {periodLabel}
                  </span>
                </div>
              }
              title={<span style={{ color: 'white' }}>{t('Expenses')}</span>}
            />
          </CCol>

          {/* Tax Collected */}
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="info"
              value={
                <div className="fs-5 fw-semibold">
                  {formatCurrency(displayTax)}
                  <span className="fs-6 fw-normal ms-2">
                    {t('in')} {periodLabel}
                  </span>
                </div>
              }
              title={<span style={{ color: 'white' }}>{t('Tax Collected')}</span>}
            />
          </CCol>
        </CRow>
      )}
    </>
  );
};

export default WidgetsDropdown;