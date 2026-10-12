import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import api from '../api/client';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../components/ProductCard';

const stripePromise = import.meta.env.VITE_STRIPE_PK
  ? loadStripe(import.meta.env.VITE_STRIPE_PK)
  : null;

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      color: '#0f172a',
      '::placeholder': { color: '#94a3b8' },
    },
  },
};

function CheckoutForm() {
  const { cart, refreshCart } = useStore();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [payMethod, setPayMethod] = useState('cod');
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

  const placeOrder = async (extra = {}) => {
    const { data } = await api.post('/checkout', { ...form, ...extra });
    await refreshCart();
    navigate(`/order-success/${data.data.id}`);
  };

  const submit = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setErrors({});
    setError('');
    try {
      if (payMethod === 'card') {
        if (!stripe || !elements) {
          setError('Card payments are not configured (missing Stripe key).');
          setPlacing(false);
          return;
        }
        // 1. Create a PaymentIntent for the cart total
        const { data: intent } = await api.post('/checkout/payment-intent');
        // 2. Confirm it with the card details
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          intent.client_secret,
          { payment_method: { card: elements.getElement(CardElement) } }
        );
        if (stripeError) {
          setError(stripeError.message);
          setPlacing(false);
          return;
        }
        // 3. Create the order with the verified payment
        await placeOrder({ payment_intent_id: paymentIntent.id });
      } else {
        await placeOrder();
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        if (err.response.data.message && !err.response.data.errors) {
          setError(err.response.data.message);
        }
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
        <form onSubmit={submit} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-extrabold text-lg">Shipping details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {field('shipping_name', 'Full name', { placeholder: 'Aymane Moutoute' })}
              {field('shipping_phone', 'Phone', { placeholder: '+212 6 00 00 00 00' })}
            </div>
            {field('shipping_address', 'Address', { placeholder: 'Street, building, apartment' })}
            {field('shipping_city', 'City', { placeholder: 'Tanger' })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-extrabold text-lg">Payment</h2>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayMethod('cod')}
                className={`p-4 rounded-xl border-2 text-left transition ${
                  payMethod === 'cod' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'
                }`}
              >
                <p className="font-bold">💵 Cash on delivery</p>
                <p className="text-sm text-slate-500 mt-1">Pay when you receive your order</p>
              </button>
              <button
                type="button"
                onClick={() => setPayMethod('card')}
                disabled={!stripePromise}
                className={`p-4 rounded-xl border-2 text-left transition ${
                  payMethod === 'card' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'
                } disabled:opacity-40`}
              >
                <p className="font-bold">💳 Card</p>
                <p className="text-sm text-slate-500 mt-1">
                  {stripePromise ? 'Secure payment via Stripe' : 'Stripe key not configured'}
                </p>
              </button>
            </div>

            {payMethod === 'card' && stripePromise && (
              <div>
                <label className="text-sm font-semibold">Card details</label>
                <div className="mt-1 px-3 py-3 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500">
                  <CardElement options={CARD_STYLE} />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Test mode: use 4242 4242 4242 4242, any future date, any CVC.
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={placing || cart.items.length === 0}
            className="w-full px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40"
          >
            {placing
              ? 'Processing…'
              : payMethod === 'card'
                ? `Pay ${formatPrice(cart.subtotal)}`
                : `Place order · ${formatPrice(cart.subtotal)}`}
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit lg:sticky lg:top-24">
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

export default function Checkout() {
  return stripePromise ? (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  ) : (
    <CheckoutForm />
  );
}
