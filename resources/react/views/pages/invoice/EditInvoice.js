// // Updated EditInvoice.js
// import React, { useEffect, useState } from 'react'
// import { useParams, useNavigate, useLocation } from 'react-router-dom'
// import { getAPICall, put } from '../../../util/api'
// import { useToast } from '../../common/toast/ToastContext'
// import { useTranslation } from 'react-i18next'
// import Invoice from './Invoice'

// const EditInvoice = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const location = useLocation()
//   const queryParams = new URLSearchParams(location.search)
//   const convertTo = queryParams.get('convertTo')

//   const [initialData, setInitialData] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [formInitialized, setFormInitialized] = useState(false)

//   const { showToast } = useToast()
//   const { t } = useTranslation('global')

//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const data = await getAPICall(`/api/order/${id}`)
//         console.log('Fetched order:', data) // Debug log
//         if (data) {
//           setInitialData({
//             projectId: data.project_id || null,
//             projectName: data.customer_name || 'N/A',
//             customer_id: data.id || null,
//             customer: {
//               name: data.customer_name || 'Unknown',
//               address: data.address || 'N/A',
//               mobile: data.mobile_number || 'N/A',
//             },
//             lat: data.lat || '',
//             long: '',
//             payLater: data.payLater || false,
//             isSettled: data.isSettled || false,
//             invoiceDate: data.invoiceDate,
//             deliveryTime: data.deliveryTime || '',
//             deliveryDate: data.deliveryDate,
//             invoiceType: convertTo ? parseInt(convertTo) : data.invoiceType || 3,
//             items: (data.items || []).map((item) => ({
//               work_type: item.work_type || '',
//               qty: item.qty || 0,
//               price: item.price || 0,
//               total_price: item.total_price || 0,
//               remark: item.remark || null,
//             })),
//             orderStatus: convertTo ? parseInt(convertTo) : data.orderStatus,
//             totalAmount: data.totalAmount || 0,
//             discount: data.discount || 0,
//             balanceAmount: data.finalAmount - data.paidAmount,
//             paidAmount: data.paidAmount || 0,
//             finalAmount: data.finalAmount || 0,
//             paymentType: data.paymentType || 0,
//           })
//           setFormInitialized(true)
//         } else {
//           showToast('danger', 'No order data found')
//         }
//       } catch (err) {
//         console.error('Fetch order error:', err)
//         showToast('danger', t('TOAST.fetch_order_failed'))
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchOrder()
//   }, [id, convertTo, t])

//   const handleSubmit = async (updatedState) => {
//     try {
//       const updatedOrder = {
//         ...updatedState,
//         id,
//         project_id: updatedState.projectId,
//         remainingBalance: updatedState.finalAmount - updatedState.paidAmount,
//       }
//       console.log('Updating order:', updatedOrder) // Debug log
//       const response = await put(`/api/order/${id}`, updatedOrder)
//       if (response?.success) {
//         showToast('success', t('TOAST.order_updated'))
//         navigate(`/invoice-details/${id}`)
//       } else {
//         showToast('danger', response?.message || t('TOAST.update_failed'))
//       }
//     } catch (error) {
//       console.error('Update error:', error)
//       showToast('danger', t('TOAST.update_error'))
//     }
//   }

//   if (loading || !formInitialized) return <div>{t('TOAST.loading')}</div>

//   return (
//     <Invoice
//       editMode={true}
//       initialData={initialData}
//       onSubmit={handleSubmit}
//     />
//   )
// }

// export default EditInvoice



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

          setInitialData({
            // 🔑 IDs
            projectId: data.project_id || project.id || null,
            customer_id: data.customer_id || null,

            // 🔑 Customer / Project info
            projectName: project.project_name || 'N/A',
            customer: {
              name: project.customer_name || 'Unknown',
              address: project.work_place || '',
              mobile: project.mobile_number || '',
            },

            // 🔑 Location
            lat: data.lat || '',
            long: data.long || '',

            // 🔑 Invoice details
            payLater: Boolean(data.payLater),
            isSettled: Boolean(data.isSettled),
            invoiceDate: data.invoiceDate || '',
            deliveryTime: data.deliveryTime || '',
            deliveryDate: data.deliveryDate || '',
            invoiceType: convertTo
              ? parseInt(convertTo)
              : data.invoiceType || 3,
            orderStatus: convertTo
              ? parseInt(convertTo)
              : data.orderStatus || 1,

            // 🔑 Items
            items: (data.items || []).map((item) => ({
              id: item.id,
              work_type: item.work_type || '',
              uom: item.uom || '',
              qty: Number(item.qty || 0),
              price: Number(item.price || 0),
              total_price: Number(item.total_price || 0),
              remark: item.remark || '',
              gst_percent: Number(item.gst_percent || 0),
              cgst_amount: Number(item.cgst_amount || 0),
              sgst_amount: Number(item.sgst_amount || 0), 
            })),

            // 🔑 Amounts
            totalAmount: Number(data.totalAmount || 0),
            discount: Number(data.discount || 0),
            paidAmount: Number(data.paidAmount || 0),
            finalAmount: Number(data.finalAmount || 0),
            balanceAmount:
              Number(data.finalAmount || 0) - Number(data.paidAmount || 0),

            // 🔑 Payment
            paymentType: data.paymentType || 0,

            // 🔑 Extra
            company_id: data.company_id || null,

             // 🔑 Terms and Conditions
            payment_terms: data.payment_terms || '',
            terms_and_conditions: data.terms_and_conditions || '',
            note: data.note || '',
            ref_id:data.ref_id || '',
            po_number:data.po_number || ''
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
