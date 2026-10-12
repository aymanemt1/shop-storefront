import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function WishlistButton({ productId, className = '' }) {
  const { user, wishlist, toggleWishlist } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const active = wishlist.includes(productId);

  const click = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login');
    setBusy(true);
    try {
      await toggleWishlist(productId);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={click}
      disabled={busy}
      aria-label="Toggle wishlist"
      className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-sm border transition ${
        active
          ? 'bg-red-50 border-red-200'
          : 'bg-white/90 border-slate-200 hover:border-red-300'
      } ${className}`}
    >
      {active ? '❤️' : '🤍'}
    </button>
  );
}
