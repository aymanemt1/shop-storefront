import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../components/ProductCard';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, addToCart } = useStore();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [seenSlug, setSeenSlug] = useState(slug);

  // This route reuses the component when the slug changes. Drop the previous
  // product before paint so Add to cart cannot submit the item you just left.
  if (seenSlug !== slug) {
    setSeenSlug(slug);
    setProduct(null);
    setRelated([]);
    setQty(1);
    setAdding(false);
    setError('');
  }

  useEffect(() => {
    let cancelled = false;

    api
      .get(`/products/${slug}`)
      .then(async ({ data }) => {
        if (cancelled) return;
        const next = data.data;
        setProduct(next);

        const categorySlug = next?.category?.slug;
        if (!categorySlug) return;

        try {
          const { data: rel } = await api.get('/products', {
            params: { category: categorySlug, per_page: 4 },
          });
          if (cancelled) return;
          setRelated((rel.data || []).filter((p) => p.id !== next.id).slice(0, 3));
        } catch {
          // Related products are optional. A failure here must not hide the product.
        }
      })
      .catch(() => {
        if (!cancelled) navigate('/', { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  const handleAdd = async () => {
    if (!user) return navigate('/login');
    setError('');
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      navigate('/cart');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (!product) return <div className="max-w-7xl mx-auto px-4 py-16">Loading…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-indigo-600 hover:underline">
        ← Back to shop
      </Link>
      <div className="mt-4 grid md:grid-cols-2 gap-10 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10">
        <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
            {product.category?.name}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{product.name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-lg text-slate-400 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">{product.description}</p>
          <p className={`mt-3 text-sm font-semibold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          {error && <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border border-slate-200 rounded-lg">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-lg hover:bg-slate-100 rounded-l-lg"
              >
                −
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="px-3 py-2 text-lg hover:bg-slate-100 rounded-r-lg"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding || product.stock === 0}
              className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40"
            >
              {adding ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-extrabold mb-4">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
