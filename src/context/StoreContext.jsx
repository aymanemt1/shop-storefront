import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shop_user'));
    } catch {
      return null;
    }
  });
  const [cart, setCart] = useState({ items: [], subtotal: '0.00', count: 0 });
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    if (!localStorage.getItem('shop_token')) {
      setCart({ items: [], subtotal: '0.00', count: 0 });
      return;
    }
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {
      /* guest or expired token */
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    if (!localStorage.getItem('shop_token')) {
      setWishlist([]);
      return;
    }
    try {
      const { data } = await api.get('/wishlist');
      setWishlist((data.data || []).map((p) => p.id));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleWishlist = async (productId) => {
    const { data } = await api.post('/wishlist', { product_id: productId });
    setWishlist((w) =>
      data.wishlisted ? [...w, productId] : w.filter((id) => id !== productId)
    );
    return data.wishlisted;
  };

  const fetchMe = useCallback(async () => {
    if (!localStorage.getItem('shop_token')) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/me');
      setUser(data.data);
      localStorage.setItem('shop_user', JSON.stringify(data.data));
      await Promise.all([refreshCart(), refreshWishlist()]);
    } catch {
      localStorage.removeItem('shop_token');
      localStorage.removeItem('shop_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/login', { email, password });
    localStorage.setItem('shop_token', data.token);
    localStorage.setItem('shop_user', JSON.stringify(data.user));
    setUser(data.user);
    await Promise.all([refreshCart(), refreshWishlist()]);
    return data.user;
  };

  const register = async (name, email, password, password_confirmation) => {
    const { data } = await api.post('/register', { name, email, password, password_confirmation });
    localStorage.setItem('shop_token', data.token);
    localStorage.setItem('shop_user', JSON.stringify(data.user));
    setUser(data.user);
    await Promise.all([refreshCart(), refreshWishlist()]);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('shop_token');
    localStorage.removeItem('shop_user');
    setUser(null);
    setCart({ items: [], subtotal: '0.00', count: 0 });
    setWishlist([]);
  };

  const addToCart = async (productId, quantity = 1) => {
    await api.post('/cart', { product_id: productId, quantity });
    await refreshCart();
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        cart,
        wishlist,
        loading,
        login,
        register,
        logout,
        refreshCart,
        refreshWishlist,
        toggleWishlist,
        addToCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
