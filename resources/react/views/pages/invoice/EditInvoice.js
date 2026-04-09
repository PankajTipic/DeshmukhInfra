
// Updated EditInvoice.js
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getAPICall, put } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext'
import { useTranslation } from 'react-i18next'
import Invoice from './Invoice'

const EditInvoice = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const convertTo = queryParams.get('convertTo')

  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formInitialized, setFormInitialized] = useState(false)

  const { showToast } = useToast()
  const { t } = useTranslation('global')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getAPICall(`/api/order/${id}`)
        console.log('Fetched order:', data)

        if (data) {
          const project = data.project || {}

          // Parse GST amounts
          const gstAmount = Number(data.gst || 0)
          const sgstAmount = Number(data.sgst || 0)
          const cgstAmount = Number(data.cgst || 0)
          const igstAmount = Number(data.igst || 0)
          
          // Get base amount (before GST)
          const totalAmount = Number(data.totalAmount || 0)
          
          // Calculate percentages by reverse engineering
          let gstPercentage = 0
          let sgstPercentage = 0
          let cgstPercentage = 0
          let igstPercentage = 0
          
          if (totalAmount > 0) {
            gstPercentage = (gstAmount / totalAmount) * 100
            sgstPercentage = (sgstAmount / totalAmount) * 100
            cgstPercentage = (cgstAmount / totalAmount) * 100
            igstPercentage = (igstAmount / totalAmount) * 100
          }

          // ── NEW: Aggregate billed qty if type 2 and proformas exist ──
          let alreadyBilledMap = {}
          const isType2WithProformas = data.invoiceType === 2 && Array.isArray(data.proformas) && data.proformas.length > 0

          if (isType2WithProformas) {
            data.proformas.forEach((pf) => {
              pf.details?.forEach((detail) => {
                const key = detail.work_type?.trim().toLowerCase() || ''
                if (key) {
                  alreadyBilledMap[key] = (alreadyBilledMap[key] || 0) + Number(detail.qty || 0)
                }
              })
            })
          }

          // Map items with billing info
          const items = (data.items || []).map((item) => ({
            id: item.id,
            work_type: item.work_type || '',
            uom: item.uom || '',
            qty: Number(item.qty || 0),
            price: Number(item.price || 0),
            total_price: Number(item.total_price || 0),
            remark: item.remark || '',
            work_sub_description: item.work_sub_description || '',
            gst_percent: item.gst_percent !== null && item.gst_percent !== undefined 
              ? Number(item.gst_percent) 
              : 18,
            cgst_amount: Number(item.cgst_amount || 0),
            sgst_amount: Number(item.sgst_amount || 0),

            // ── NEW: Billing restrictions ──
            alreadyBilledQty: alreadyBilledMap[item.work_type?.trim().toLowerCase() || ''] || 0,
            isWorkOrder: isType2WithProformas,  // Only true if type 2 AND proformas exist
          })).sort((a, b) => (a.id || 0) - (b.id || 0))

          setInitialData({
            projectId: data.project_id || project.id || null,
            customer_id: data.customer_id || null,

            projectName: project.project_name || 'N/A',
            customer: {
              name: project.customer_name || 'Unknown',
              address: project.work_place || '',
              mobile: project.mobile_number || '',
            },
            project_type: project.project_type?.name || '', // Pass project_type

            lat: data.lat || '',
            long: data.long || '',

            payLater: Boolean(data.payLater),
            isSettled: Boolean(data.isSettled),
            invoiceDate: data.invoiceDate || '',
            deliveryTime: data.deliveryTime || '',
            deliveryDate: data.deliveryDate || '',
            invoiceType: convertTo ? parseInt(convertTo) : data.invoiceType || 3,
            orderStatus: convertTo ? parseInt(convertTo) : data.orderStatus || 1,

            items: items.length > 0 ? items : [],  // Ensure items array

            totalAmount: totalAmount,
            subtotal: totalAmount,
            taxableAmount: totalAmount,
            discount: Number(data.discount || 0),
            paidAmount: Number(data.paidAmount || 0),
            finalAmount: Number(data.finalAmount || 0),
            balanceAmount: Number(data.finalAmount || 0) - Number(data.paidAmount || 0),

            gstAmount: gstAmount,
            sgstAmount: sgstAmount,
            cgstAmount: cgstAmount,
            igstAmount: igstAmount,
            gstPercentage: Math.round(gstPercentage * 100) / 100,
            sgstPercentage: Math.round(sgstPercentage * 100) / 100,
            cgstPercentage: Math.round(cgstPercentage * 100) / 100,
            igstPercentage: Math.round(igstPercentage * 100) / 100,

            paymentType: data.paymentType || 0,

            company_id: data.company_id || null,

            payment_terms: data.payment_terms || '',
            terms_and_conditions: data.terms_and_conditions || '',
            note: data.note || '',
            ref_id: data.ref_id || '',
            po_number: data.po_number || '',
          })

          setFormInitialized(true)
        } else {
          showToast('danger', 'No order data found')
        }
      } catch (err) {
        console.error('Fetch order error:', err)
        showToast('danger', t('TOAST.fetch_order_failed'))
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id, convertTo, t])

  const handleSubmit = async (updatedState) => {
    try {
      const updatedOrder = {
        ...updatedState,
        id,
        project_id: updatedState.projectId,
        remainingBalance:
          Number(updatedState.finalAmount || 0) -
          Number(updatedState.paidAmount || 0),
      }

      console.log('Updating order:', updatedOrder)
      const response = await put(`/api/order/${id}`, updatedOrder)

      if (response?.success) {
        showToast('success', t('TOAST.order_updated'))
        navigate(`/invoice-details/${id}`)
      } else {
        showToast('danger', response?.message || t('TOAST.update_failed'))
      }
    } catch (error) {
      console.error('Update error:', error)
      showToast('danger', t('TOAST.update_error'))
    }
  }

  if (loading || !formInitialized) return <div>{t('TOAST.loading')}</div>

  return (
    <Invoice
      editMode={true}
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  )
}

export default EditInvoice


