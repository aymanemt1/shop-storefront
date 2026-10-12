import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then(({ data }) => {
      setProducts(data.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16">Loading…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold">❤️ Your wishlist</h1>
      {products.length === 0 ? (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500">
          Nothing saved yet. Tap the 🤍 on any product to save it here.
          <br />
          <Link
            to="/"
            className="mt-4 inline-block px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
