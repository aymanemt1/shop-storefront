import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/client';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../components/ProductCard';
import { StatusBadge } from './Orders';

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

const emptyForm = {
  name: '',
  category_id: '',
  description: '',
  price: '',
  compare_at_price: '',
  stock: '',
  image_url: '',
  is_active: true,
};

export default function Admin() {
  const { user, loading } = useStore();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.is_admin) {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAll = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      api.get('/products', { params: { per_page: 50 } }),
      api.get('/categories'),
    ]);
    setProducts(p.data);
    setCategories(c.data || c);
    try {
      const { data: o } = await api.get('/orders');
      setOrders(o.data);
    } catch {
      /* admin order listing may be scoped — ignore */
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16">Loading…</div>;
  if (!user?.is_admin) return <Navigate to="/" replace />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      category_id: p.category?.id || '',
      description: p.description || '',
      price: p.price,
      compare_at_price: p.compare_at_price || '',
      stock: p.stock,
      image_url: p.image_url || '',
      is_active: p.is_active,
    });
    setErrors({});
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const payload = {
      ...form,
      category_id: form.category_id || undefined,
      compare_at_price: form.compare_at_price || null,
      image_url: form.image_url || null,
    };
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    fetchAll();
  };

  const updateStatus = async (orderId, status) => {
    await api.patch(`/orders/${orderId}/status`, { status });
    fetchAll();
  };

  const inputCls =
    'mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold">👮 Admin dashboard</h1>

      <div className="mt-4 flex gap-2">
        {['products', 'orders'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize ${
              tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div className="mt-6">
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            + New product
          </button>
          <div className="mt-4 bg-white rounded-2xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold">{p.name}</td>
                    <td className="px-4 py-3 text-slate-500">{p.category?.name}</td>
                    <td className="px-4 py-3">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {p.is_active ? 'active' : 'hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openEdit(p)} className="text-indigo-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => remove(p.id)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="mt-6 space-y-3">
          {orders.length === 0 && (
            <p className="text-slate-500 bg-white rounded-2xl border border-slate-200 p-8 text-center">
              No orders yet.
            </p>
          )}
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="font-extrabold">
                  <span className="font-mono">#{o.order_number}</span> · {formatPrice(o.total)}
                </p>
                <p className="text-sm text-slate-500">
                  {o.shipping_name} — {o.shipping_city} · {o.items_count} item(s)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={submit}
            className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4"
          >
            <h2 className="text-xl font-extrabold">{editing ? 'Edit product' : 'New product'}</h2>
            <div>
              <label className="text-sm font-semibold">Name</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
              {errors.name && <p className="text-sm text-red-600">{errors.name[0]}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Category</label>
                <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className={inputCls}>
                  <option value="">Select…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="text-sm text-red-600">{errors.category_id[0]}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold">Price ($)</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} className={inputCls} />
                {errors.price && <p className="text-sm text-red-600">{errors.price[0]}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Compare-at price (optional)</label>
                <input type="number" step="0.01" min="0" value={form.compare_at_price} onChange={(e) => set('compare_at_price', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-semibold">Stock</label>
                <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold">Description</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-semibold">Image URL (optional)</label>
              <input value={form.image_url} onChange={(e) => set('image_url', e.target.value)} className={inputCls} placeholder="https://…" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 accent-indigo-600" />
              Active (visible in store)
            </label>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40"
              >
                {busy ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
