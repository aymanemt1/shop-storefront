import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { formatPrice } from '../components/ProductCard';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_COLORS[status] || 'bg-slate-100'}`}
    >
      {status}
    </span>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(({ data }) => {
      setOrders(data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-16">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold">Your orders</h1>
      {orders.length === 0 ? (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500">
          No orders yet.{' '}
          <Link to="/" className="text-indigo-600 font-semibold hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition"
            >
              <div>
                <p className="font-extrabold">
                  Order <span className="font-mono">#{o.order_number}</span>
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(o.created_at).toLocaleDateString()} · {o.items_count} item(s)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-extrabold">{formatPrice(o.total)}</span>
                <StatusBadge status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
