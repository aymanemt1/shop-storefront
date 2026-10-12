import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../components/ProductCard';

export default function Checkout() {
  const { cart, refreshCart } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setErrors({});
    setError('');
    try {
      const { data } = await api.post('/checkout', form);
      await refreshCart();
      navigate(`/order-success/${data.data.id}`);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setError(err.response?.data?.message || 'Checkout failed. Please try again.');
      }
    } finally {
      setPlacing(false);
    }
  };

  const field = (key, label, props = {}) => (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        {...props}
      />
      {errors[key] && <p className="mt-1 text-sm text-red-600">{errors[key][0]}</p>}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold">Checkout</h1>
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <form onSubmit={submit} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-extrabold text-lg">Shipping details</h2>
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            {field('shipping_name', 'Full name', { placeholder: 'Aymane Moutoute' })}
            {field('shipping_phone', 'Phone', { placeholder: '+212 6 00 00 00 00' })}
          </div>
          {field('shipping_address', 'Address', { placeholder: 'Street, building, apartment' })}
          <div className="grid sm:grid-cols-2 gap-4">
            {field('shipping_city', 'City', { placeholder: 'Tanger' })}
            <div>
              <label className="text-sm font-semibold">Notes (optional)</label>
              <input
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Delivery instructions"
                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={placing || cart.items.length === 0}
            className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40"
          >
            {placing ? 'Placing order…' : `Place order · ${formatPrice(cart.subtotal)}`}
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit">
          <h2 className="font-extrabold text-lg">Order summary</h2>
          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {item.product?.name} <span className="text-slate-400">× {item.quantity}</span>
                </span>
                <span className="font-semibold">{formatPrice(item.line_total)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between font-extrabold">
            <span>Total</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
