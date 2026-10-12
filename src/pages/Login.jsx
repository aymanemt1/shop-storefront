import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(email, password);
      navigate(user.is_admin ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (e, p) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-slate-200 p-8">
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40"
          >
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Demo accounts</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => fillDemo('customer@shop.test', 'password')}
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              🧑 Customer
            </button>
            <button
              onClick={() => fillDemo('admin@shop.test', 'password')}
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              👮 Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
