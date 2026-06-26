import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])         // [{ product, quantity }]
  const [cartShopId, setCartShopId] = useState(null)

  const addToCart = (product, shopId) => {
    // If adding from a different shop, clear cart first
    if (cartShopId && cartShopId !== shopId) {
      if (!window.confirm('Your cart has items from another shop. Clear it and start a new order?')) return
      setCart([])
      setCartShopId(null)
    }

    setCartShopId(shopId)
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.product.id !== productId)
      if (updated.length === 0) setCartShopId(null)
      return updated
    })
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId)
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => {
    setCart([])
    setCartShopId(null)
  }

  const total = cart.reduce((sum, i) => sum + parseFloat(i.product.price) * i.quantity, 0)
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, cartShopId, total, itemCount,
      addToCart, removeFromCart, updateQuantity, clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
