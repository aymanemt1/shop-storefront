import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';

export function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

export default function ProductCard({ product }) {
  const { user, addToCart } = useStore();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setAdding(true);
    try {
      await addToCart(product.id, 1);
    } catch {
      /* stock error handled on cart page */
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition"
    >
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
          {product.category?.name}
        </p>
        <h3 className="mt-1 font-semibold text-slate-900 line-clamp-1">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || product.stock === 0}
            className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? 'Sold out' : adding ? '…' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  );
}
