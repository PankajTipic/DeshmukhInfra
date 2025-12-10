import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import 'chartjs-plugin-datalabels'// To modify the data on barghaph

import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'
import { color } from 'chart.js/helpers'
import { getUserType } from '../../util/session'
import { useTranslation } from 'react-i18next'

const WidgetsDropdown = (props) => {

  const user= getUserType();
  const { t } = useTranslation('global'); // Add translation hook
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const [reportMonth,setReportMonth]=useState({
    currentSales:0,
    currentExpense:0,
    currentPandL:0,
    currentMonth:''
  });
  
  const date= new Date();
  const currentMonth= date.getMonth();

  // Utility function for consistent currency formatting (rounded to whole numbers)
  const formatCurrency = (amount, decimals = 0) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `0 ₹`;
    }
    return `${Math.round(Number(amount))} ₹`;
  };

  // Utility function for Indian number formatting with commas (rounded to whole numbers)
  const formatCurrencyWithCommas = (amount, decimals = 0) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `0 ₹`;
    }
    return `${Math.round(Number(amount)).toLocaleString('en-IN')} ₹`;
  };
 
  function calculateMonthlyReport (){
    let sales=[];
    let expence=[];
    let pandL=[];
  
    sales=props.reportMonth.monthlySales;
    expence=props.reportMonth.monthlyExpense;
    pandL=props.reportMonth.monthlyPandL;
    let length = sales.length;

    if (currentMonth >= 0 && currentMonth < length) {
      const currentSales = sales[currentMonth];
      const currentExpense = expence[currentMonth];
      const currentPandL = pandL[currentMonth];
      const months= ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const monthName=months[currentMonth];
      setReportMonth(resp=>({
        ...resp,
      currentSales:currentSales,
      currentExpense:currentExpense,
      currentPandL: currentPandL,
      currentMonth: monthName
      }))
      return (currentSales,currentExpense,currentPandL)
        } else {
      console.log("Index is out of bounds.");
      }
  }
  
  useEffect(()=>{
    calculateMonthlyReport();
  },[props.reportMonth]);

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
  }, [widgetChartRef1, widgetChartRef2])

  // Function to get P&L display text with proper rounding (no decimals)
  const getPandLDisplay = (value) => {
    if (value === 0) {
      return formatCurrency(Math.abs(value));
    }
    return `${formatCurrency(Math.abs(value))} (${value > 0 ? 'Balance' : 'Balance' })`;       // t('LABELS.profit')  t('LABELS.loss')
  }

  // Function to get P&L color
  const getPandLColor = (value) => {
    if (value === 0) {
      return "info"; // or "secondary" - neutral color for zero
    }
    return value > 0 ? "success" : "danger";
  }

  return (
    <>
      {(user === 0 || user === 1) && (
        <CRow className={props.className} xs={{ gutter: 4 }}>
          <CCol sm={4} xl={4} xxl={4} className='vh-[40%]'>
            <CWidgetStatsA className='pb-3'
            color={getPandLColor(reportMonth.currentPandL)}
              value={
                <><div d-flex>
                  <span className='fs-4' style={{color: 'white'}}>
                    {getPandLDisplay(reportMonth.currentPandL)}
                  </span>
                  <span className="fs-6 fw-normal" style={{color: 'white'}}>
                    &nbsp;{t('LABELS.in')} {reportMonth.currentMonth}
                  </span>
                  </div>
                </>
              }
              title= {<span style={{ color: 'white' }}>Cash in Hands</span>}             // {t('LABELS.profit_loss')}
              />
          </CCol>
        
          <CCol sm={4} xl={4} xxl={4}>
            <CWidgetStatsA className='pb-3'
                  style={{ backgroundColor: '#7BAE4F' }} 
              value={
                <>
                  <span className='fs-4'style={{color: 'white'}}>
                    {formatCurrency(reportMonth.currentSales)}
                  </span>
                  <span className="fs-6 fw-normal" style={{color: 'white'}}>
                    &nbsp;{t('LABELS.in')} {reportMonth.currentMonth}
                  </span>
                </>
              }
                title= {<span style={{ color: 'white' }}>Income</span>}              // {t('LABELS.sales')}
              />
          </CCol>
        
            <CCol sm={4} xl={4} xxl={4}>
            <CWidgetStatsA className='pb-3'
              style={{ backgroundColor: '#D09683' }} 
              value={
                <>
                  <span className='fs-4' style={{color:'white'}}>
                    {formatCurrency(reportMonth.currentExpense)}
                  </span>
                  <span className="fs-6 fw-normal" style={{color:'white'}}>
                    &nbsp;{t('LABELS.in')} {reportMonth.currentMonth}
                  </span>
                </>
              }
              title= {<span style={{ color: 'white' }}>{t('LABELS.expenses')}</span>}
            />
          </CCol>
     </CRow>
      )}
    </>
  );
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsDropdown