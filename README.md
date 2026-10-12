# 🛒 ShopStack — React Storefront

A complete e-commerce frontend built with **React + Vite + Tailwind CSS**, consuming the Laravel Shop API.

## ✨ Features

**Store**
- 🏠 Product catalog — search, category filter, price range, in-stock toggle, 4 sort orders, pagination
- 🔍 Product detail pages with related products
- 🛒 Cart — quantities, remove, clear, live subtotal
- 💳 Checkout — shipping form with validation → atomic order creation → success page
- 📦 Order history + order detail with status badges

**Auth**
- Register / login / logout (Sanctum tokens in localStorage)
- One-click demo accounts (customer + admin)
- Protected routes for checkout and orders

**Admin dashboard** (`/admin`, admin account only)
- Product table — create / edit / delete via modal form
- Order list — update status (`pending → paid → shipped → delivered → cancelled`)

## 🛠️ Stack

React 18 · Vite · React Router · Axios · Tailwind CSS v4

## 🚀 Quick start

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your API
npm run dev            # http://localhost:5173
```

The Laravel API must be running:

```bash
cd ../laravel-shop-api
php artisan serve      # http://localhost:8000
```

Demo accounts (seeded by the API):

| Role     | Email              | Password   |
|----------|--------------------|------------|
| Admin    | admin@shop.test    | `password` |
| Customer | customer@shop.test | `password` |

## 📁 Structure

```
src/
├── api/client.js             # Axios instance + token interceptor
├── context/StoreContext.jsx  # Auth + cart global state
├── components/               # Navbar, ProductCard
├── pages/
│   ├── Home.jsx              # Catalog + filters + pagination
│   ├── ProductDetail.jsx     # Detail + related products
│   ├── Cart.jsx               # Cart management
│   ├── Checkout.jsx          # Shipping form → order
│   ├── OrderSuccess.jsx      # Confirmation page
│   ├── Orders.jsx / OrderDetail.jsx
│   ├── Login.jsx / Register.jsx
│   └── Admin.jsx             # Product CRUD + order statuses
└── App.jsx                   # Routes + protected routes
```

## 🔮 Ideas to extend

- Stripe payment step before order placement
- Wishlist / favorites
- Product reviews and ratings
- Real-time stock via polling or websockets

---

Built by [Aymane Moutoute](https://github.com/aymanemt1) · Full Stack Software Developer
