import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import { formatPrice } from '../components/ProductCard';
import { StatusBadge } from './Orders';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.data));
  }, [id]);

  if (!order) return <div className="max-w-5xl mx-auto px-4 py-16">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/orders" className="text-sm text-indigo-600 hover:underline">
        ← All orders
      </Link>
      <div className="mt-4 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold">
            Order <span className="font-mono">#{order.order_number}</span>
          </h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Placed {new Date(order.created_at).toLocaleString()}
        </p>

        <div className="mt-6 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <p className="font-semibold">{item.product?.name || 'Product'}</p>
                <p className="text-sm text-slate-500">
                  {formatPrice(item.unit_price)} × {item.quantity}
                </p>
              </div>
              <span className="font-extrabold">{formatPrice(item.line_total)}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>{formatPrice(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between text-lg font-extrabold pt-2">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Ship to</p>
          <p>
            {order.shipping_name} · {order.shipping_phone}
          </p>
          <p>
            {order.shipping_address}, {order.shipping_city}
          </p>
          {order.notes && <p className="mt-1 italic">“{order.notes}”</p>}
        </div>
      </div>
    </div>
  );
}
