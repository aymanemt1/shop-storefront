import { useEffect, useState } from 'react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

const SORTS = [
  { value: '', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low → high' },
  { value: 'price_desc', label: 'Price: high → low' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    in_stock: false,
    sort: '',
    page: 1,
  });

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data || data));
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { per_page: 12, page: filters.page };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.in_stock) params.in_stock = 1;
      if (filters.sort) params.sort = filters.sort;
      const { data } = await api.get('/products', { params });
      setProducts(data.data);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  };

  const set = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-8 sm:p-12 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Everything you love, one cart.
        </h1>
        <p className="mt-2 text-indigo-100 max-w-xl">
          Browse the catalog, filter by category and price, and check out in seconds.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 lg:sticky lg:top-24">
            <div>
              <label className="text-sm font-semibold">Search</label>
              <input
                value={filters.search}
                onChange={(e) => set({ search: e.target.value })}
                placeholder="Phone, jacket…"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Category</label>
              <select
                value={filters.category}
                onChange={(e) => set({ category: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name} ({c.products_count ?? ''})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-semibold">Min $</label>
                <input
                  type="number"
                  min="0"
                  value={filters.min_price}
                  onChange={(e) => set({ min_price: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Max $</label>
                <input
                  type="number"
                  min="0"
                  value={filters.max_price}
                  onChange={(e) => set({ max_price: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={filters.in_stock}
                onChange={(e) => set({ in_stock: e.target.checked })}
                className="w-4 h-4 accent-indigo-600"
              />
              In stock only
            </label>
            <div>
              <label className="text-sm font-semibold">Sort</label>
              <select
                value={filters.sort}
                onChange={(e) => set({ sort: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500">
              No products match your filters.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {meta && meta.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    disabled={meta.current_page <= 1}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {meta.current_page} of {meta.last_page}
                  </span>
                  <button
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
