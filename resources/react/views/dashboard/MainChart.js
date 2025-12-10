import React, { useEffect, useRef } from 'react'
import { CChartBar } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import { getUserType } from '../../util/session'

const MainChart = (props) => {
  const chartRef = useRef(null)

  // Helper function to round to 2 decimal places
  const roundToTwo = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100
  }

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    })
  }, [chartRef])

  // Get data from props with fallback to empty arrays and round values
  const salesData = (props.monthlySales || Array(12).fill(0)).map(val => roundToTwo(val))
  const expenseData = (props.monthlyExpense || Array(12).fill(0)).map(val => roundToTwo(val))
  const profitLossData = (props.monthlyPandL || Array(12).fill(0)).map(val => roundToTwo(val))

  // Calculate max value for y-axis scaling
  const allValues = [...salesData, ...expenseData, ...profitLossData.map(val => Math.abs(val))]
  const maxValue = Math.max(...allValues) + (Math.max(...allValues) * 0.1) // Add 10% padding

  // Calculate totals for the year (rounded)
  const totalSales = roundToTwo(salesData.reduce((sum, val) => sum + (val || 0), 0))
  const totalExpense = roundToTwo(expenseData.reduce((sum, val) => sum + (val || 0), 0))
  const totalProfitLoss = roundToTwo(profitLossData.reduce((sum, val) => sum + (val || 0), 0))

  return (
    <>
      {/* Summary Cards */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ 
          flex: '1 1 250px',
          minWidth: '200px'
        }}>
          
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: 'clamp(8px, 2vw, 20px)',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: window.innerWidth < 768 ? 'flex-start' : 'flex-end',
          flex: '1 1 300px',
          width: '100%'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
            backgroundColor: getStyle('--cui-body-bg'),
            borderRadius: '6px',
            border: `1px solid ${getStyle('--cui-border-color')}`,
            minWidth: 'fit-content'
          }}>
            <div style={{ 
              width: 'clamp(10px, 1.5vw, 12px)', 
              height: 'clamp(10px, 1.5vw, 12px)', 
              backgroundColor: '#4A90E2',
              borderRadius: '2px',
              flexShrink: 0
            }}></div>
            <span style={{ 
              fontSize: 'clamp(11px, 1.8vw, 13px)', 
              fontWeight: '500',
              color: getStyle('--cui-body-color'),
              whiteSpace: 'nowrap'
            }}>
              Profit & Loss
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
            backgroundColor: getStyle('--cui-body-bg'),
            borderRadius: '6px',
            border: `1px solid ${getStyle('--cui-border-color')}`,
            minWidth: 'fit-content'
          }}>
            <div style={{ 
              width: 'clamp(10px, 1.5vw, 12px)', 
              height: 'clamp(10px, 1.5vw, 12px)', 
              backgroundColor: '#2ECC71',
              borderRadius: '2px',
              flexShrink: 0
            }}></div>
            <span style={{ 
              fontSize: 'clamp(11px, 1.8vw, 13px)', 
              fontWeight: '500',
              color: getStyle('--cui-body-color'),
              whiteSpace: 'nowrap'
            }}>
              Sales
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
            backgroundColor: getStyle('--cui-body-bg'),
            borderRadius: '6px',
            border: `1px solid ${getStyle('--cui-border-color')}`,
            minWidth: 'fit-content'
          }}>
            <div style={{ 
              width: 'clamp(10px, 1.5vw, 12px)', 
              height: 'clamp(10px, 1.5vw, 12px)', 
              backgroundColor: '#E74C3C',
              borderRadius: '2px',
              flexShrink: 0
            }}></div>
            <span style={{ 
              fontSize: 'clamp(11px, 1.8vw, 13px)', 
              fontWeight: '500',
              color: getStyle('--cui-body-color'),
              whiteSpace: 'nowrap'
            }}>
              Expense 
            </span>
          </div>
        </div>
      </div>

      <div style={{ 
        width: '100%',
        overflow: 'hidden'
      }}>
        <CChartBar
          ref={chartRef}
          style={{ 
            height: 'clamp(250px, 40vh, 400px)', 
            marginTop: 'clamp(20px, 3vw, 40px)',
            width: '100%'
          }}
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
              {
                label: 'Profit & Loss',
                backgroundColor: '#4A90E2', // Blue color
                borderColor: '#4A90E2',
                borderWidth: 1,
                data: profitLossData,
                maxBarThickness: window.innerWidth < 768 ? 15 : window.innerWidth < 1024 ? 25 : 40,
              },
              {
                label: 'Sales',
                backgroundColor: '#2ECC71', // Green color
                borderColor: '#2ECC71',
                borderWidth: 1,
                data: salesData,
                maxBarThickness: window.innerWidth < 768 ? 15 : window.innerWidth < 1024 ? 25 : 40,
              },
              {
                label: 'Expense',
                backgroundColor: '#E74C3C', // Red color
                borderColor: '#E74C3C',
                borderWidth: 1,
                data: expenseData,
                maxBarThickness: window.innerWidth < 768 ? 15 : window.innerWidth < 1024 ? 25 : 40,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: {
                display: false, // Hide chart legend to avoid duplicate
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const value = roundToTwo(context.raw);
                    const datasetLabel = context.dataset.label;
                    return `${datasetLabel}: ${value}`;
                  },
                },
                titleFont: {
                  size: window.innerWidth < 768 ? 12 : 14,
                },
                bodyFont: {
                  size: window.innerWidth < 768 ? 11 : 13,
                },
              },
              datalabels: {
                display: false, // Disable data labels on bars
              },
            },
            scales: {
              x: {
                grid: {
                  color: getStyle('--cui-border-color-translucent'),
                  drawOnChartArea: false,
                },
                ticks: {
                  color: getStyle('--cui-body-color'),
                  font: {
                    size: window.innerWidth < 768 ? 10 : 12,
                  },
                  maxRotation: window.innerWidth < 768 ? 45 : 0,
                  minRotation: 0,
                },
                categoryPercentage: 1.0,
                barPercentage: 1.0,
              },
              y: {
                beginAtZero: true,
                border: {
                  color: getStyle('--cui-border-color-translucent'),
                },
                grid: {
                  color: getStyle('--cui-border-color-translucent'),
                },
                max: maxValue,
                ticks: {
                  color: getStyle('--cui-body-color'),
                  maxTicksLimit: window.innerWidth < 768 ? 4 : 5,
                  stepSize: Math.ceil(maxValue / (window.innerWidth < 768 ? 4 : 5)),
                  font: {
                    size: window.innerWidth < 768 ? 10 : 12,
                  },
                  callback: function(value) {
                    return roundToTwo(value) + 'k';
                  }
                },
              },
            },
            interaction: {
              mode: 'index',
              intersect: false,
            },
            elements: {
              bar: {
                borderRadius: 2,
              },
            },
            layout: {
              padding: {
                top: 10,
                left: window.innerWidth < 768 ? 5 : 10,
                right: window.innerWidth < 768 ? 5 : 10,
                bottom: 5,
              },
            },
            animation: {
              onComplete: function(chart) {
                // Ensure no data labels are drawn after animation
                if (chart && chart.config && chart.config.options && chart.config.options.plugins) {
                  chart.config.options.plugins.datalabels = { display: false };
                }
              },
            },
          }}
        />
      </div>
    </>
  )
}

export default MainChart