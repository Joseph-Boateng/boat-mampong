export default function PaymentBadge({ order }) {
  if (order.payment_method === 'online') {
    return order.payment_status === 'paid'
      ? <span className="badge bg-green-100 text-green-800">💳 Paid</span>
      : <span className="badge bg-amber-100 text-amber-800">⏳ Payment pending</span>
  }
  return <span className="badge bg-gray-100 text-gray-600">💵 Cash on delivery</span>
}
