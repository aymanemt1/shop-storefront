import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Admin from './pages/Admin';

function Protected({ children }) {
  const { user, loading } = useStore();
  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function Shell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <Protected>
                <Checkout />
              </Protected>
            }
          />
          <Route
            path="/order-success/:id"
            element={
              <Protected>
                <OrderSuccess />
              </Protected>
            }
          />
          <Route
            path="/orders"
            element={
              <Protected>
                <Orders />
              </Protected>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <Protected>
                <OrderDetail />
              </Protected>
            }
          />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-slate-500 flex items-center justify-between">
          <span>🛒 ShopStack — React storefront for the Laravel Shop API</span>
          <span>
            Built by <span className="font-semibold text-slate-700">Aymane Moutoute</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </BrowserRouter>
  );
}
