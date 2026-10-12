import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../components/ProductCard';

export default function Cart() {
  const { cart, refreshCart, user } = useStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Your cart is waiting 🛒</h1>
        <p className="mt-2 text-slate-500">Log in to see your cart and check out.</p>
        <Link
          to="/login"
          className="mt-6 inline-block px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  const updateQty = async (productId, quantity) => {
    await api.post('/cart', { product_id: productId, quantity });
    await refreshCart();
  };

  const removeItem = async (productId) => {
    await api.delete(`/cart/${productId}`);
    await refreshCart();
  };

  const clear = async () => {
    await api.delete('/cart');
    await refreshCart();
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl">🛒</div>
        <h1 className="mt-4 text-2xl font-extrabold">Your cart is empty</h1>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Your cart ({cart.count})</h1>
        <button onClick={clear} className="text-sm text-red-600 hover:underline">
          Clear all
        </button>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4"
            >
              <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                {item.product?.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.product?.slug}`}
                  className="font-semibold hover:text-indigo-600 line-clamp-1"
                >
                  {item.product?.name}
                </Link>
                <p className="text-sm text-slate-500">{formatPrice(item.unit_price)} each</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <button
                      onClick={() => updateQty(item.product_id, item.quantity - 1)}
                      className="px-2.5 py-1 hover:bg-slate-100 rounded-l-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.product_id, item.quantity + 1)}
                      className="px-2.5 py-1 hover:bg-slate-100 rounded-r-lg"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="font-extrabold">{formatPrice(item.line_total)}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-extrabold text-lg">Summary</h2>
          <div className="mt-4 flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-slate-600">
            <span>Shipping</span>
            <span className="font-semibold text-emerald-600">Free</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-lg font-extrabold">
            <span>Total</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="mt-6 w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
