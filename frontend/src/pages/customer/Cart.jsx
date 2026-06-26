import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useCart } from '../../context/CartContext'
import api from '../../api/client'

const DELIVERY_FEE = 8

export default function Cart() {
  const { cart, cartShopId, total, updateQuantity, removeFromCart, clearCart } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      setError('Please enter a delivery address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const items = cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity }))
      const res = await api.post('/orders', {
        shop_id: cartShopId,
        items,
        delivery_address: address,
        delivery_notes: notes,
      })
      clearCart()
      navigate(`/shop/orders/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Browse vendors to add items</p>
          <Link to="/shop" className="btn-primary">Browse Vendors</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

        {/* Cart items */}
        <div className="card mb-4 divide-y divide-gray-100">
          {cart.map(({ product, quantity }) => (
            <div key={product.id} className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-brand-600 text-sm">GHS {parseFloat(product.price).toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >−</button>
                <span className="w-6 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >+</button>
              </div>
              <p className="w-20 text-right font-semibold">
                GHS {(parseFloat(product.price) * quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeFromCart(product.id)}
                className="text-gray-400 hover:text-red-500 ml-1"
              >✕</button>
            </div>
          ))}
        </div>

        {/* Delivery details */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold mb-3">Delivery Details</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Delivery Address *</label>
              <input
                className="input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. House No. 12, Market Street, Near the post office"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Notes for Rider (optional)</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Call when you arrive, blue gate"
              />
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="card p-5 mb-5">
          <h2 className="font-semibold mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>GHS {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery fee</span>
              <span>GHS {DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
              <span>Total</span>
              <span className="text-brand-600">GHS {(total + DELIVERY_FEE).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="btn-primary w-full py-4 text-base"
        >
          {loading ? 'Placing order...' : `Place Order · GHS ${(total + DELIVERY_FEE).toFixed(2)}`}
        </button>
        <p className="text-xs text-center text-gray-500 mt-2">
          Payment collected on delivery or via Mobile Money
        </p>
      </div>
    </div>
  )
}
