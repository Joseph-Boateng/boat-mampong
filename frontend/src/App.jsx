import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import CustomerHome from './pages/customer/Home'
import VendorDetail from './pages/customer/VendorDetail'
import Cart from './pages/customer/Cart'
import OrderTracking from './pages/customer/OrderTracking'
import PaymentCallback from './pages/customer/PaymentCallback'
import OrderHistory from './pages/customer/OrderHistory'
import VendorDashboard from './pages/vendor/Dashboard'
import VendorProducts from './pages/vendor/Products'
import VendorOrders from './pages/vendor/Orders'
import RiderDashboard from './pages/rider/Dashboard'
import RiderEarnings from './pages/rider/Earnings'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/Overview'
import AdminUsers from './pages/admin/Users'
import AdminShops from './pages/admin/Shops'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminRiders from './pages/admin/Riders'

// Route guard
function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer */}
            <Route path="/shop" element={
              <ProtectedRoute role="customer"><CustomerHome /></ProtectedRoute>
            } />
            <Route path="/shop/vendor/:id" element={
              <ProtectedRoute role="customer"><VendorDetail /></ProtectedRoute>
            } />
            <Route path="/shop/cart" element={
              <ProtectedRoute role="customer"><Cart /></ProtectedRoute>
            } />
            <Route path="/shop/orders" element={
              <ProtectedRoute role="customer"><OrderHistory /></ProtectedRoute>
            } />
            <Route path="/shop/orders/:id" element={
              <ProtectedRoute role="customer"><OrderTracking /></ProtectedRoute>
            } />
            <Route path="/shop/orders/:id/payment-callback" element={
              <ProtectedRoute role="customer"><PaymentCallback /></ProtectedRoute>
            } />

            {/* Vendor */}
            <Route path="/vendor" element={
              <ProtectedRoute role="vendor"><VendorDashboard /></ProtectedRoute>
            } />
            <Route path="/vendor/products" element={
              <ProtectedRoute role="vendor"><VendorProducts /></ProtectedRoute>
            } />
            <Route path="/vendor/orders" element={
              <ProtectedRoute role="vendor"><VendorOrders /></ProtectedRoute>
            } />

            {/* Rider */}
            <Route path="/rider" element={
              <ProtectedRoute role="rider"><RiderDashboard /></ProtectedRoute>
            } />
            <Route path="/rider/earnings" element={
              <ProtectedRoute role="rider"><RiderEarnings /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
            }>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="shops" element={<AdminShops />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="riders" element={<AdminRiders />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
