import { Link, useParams } from 'react-router-dom';

export default function OrderSuccess() {
  const { id } = useParams();
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-4xl">
        ✓
      </div>
      <h1 className="mt-6 text-3xl font-extrabold">Order placed!</h1>
      <p className="mt-2 text-slate-500">
        Thank you — your order <span className="font-mono font-semibold">#{id}</span> is confirmed
        and being prepared.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          to={`/orders/${id}`}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
        >
          View order
        </Link>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl border border-slate-200 font-semibold hover:bg-slate-100"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
