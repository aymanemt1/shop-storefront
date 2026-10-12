import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Navbar() {
  const { user, cart, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-800 font-extrabold tracking-tight text-indigo-600">
          🛒 ShopStack
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <Link to="/" className="px-3 py-2 rounded-lg hover:bg-slate-100">
            Shop
          </Link>
          {user && (
            <Link to="/orders" className="px-3 py-2 rounded-lg hover:bg-slate-100">
              Orders
            </Link>
          )}
          {user?.is_admin && (
            <Link
              to="/admin"
              className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            >
              Admin
            </Link>
          )}
          <Link
            to="/cart"
            className="relative px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold"
          >
            Cart
            {cart.count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                {cart.count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-2 ml-1">
              <span className="hidden sm:block text-slate-500 max-w-32 truncate">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link to="/login" className="px-3 py-2 rounded-lg hover:bg-slate-100">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
