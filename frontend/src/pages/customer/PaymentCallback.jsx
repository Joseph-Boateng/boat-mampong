import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/client'

export default function PaymentCallback() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('checking') // checking | success | failed

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) {
      navigate(`/shop/orders/${id}`)
      return
    }

    api.get(`/payments/verify/${reference}`)
      .then((res) => {
        setStatus(res.data.success ? 'success' : 'failed')
      })
      .catch(() => setStatus('failed'))
      .finally(() => {
        setTimeout(() => navigate(`/shop/orders/${id}`), 2000)
      })
  }, [id, searchParams, navigate])

  const messages = {
    checking: { icon: '⏳', text: 'Confirming your payment...' },
    success: { icon: '✅', text: 'Payment confirmed!' },
    failed: { icon: '⚠️', text: 'We could not confirm your payment. Check your order status.' },
  }
  const { icon, text } = messages[status]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-24">
        <div className="text-5xl mb-4">{icon}</div>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  )
}
