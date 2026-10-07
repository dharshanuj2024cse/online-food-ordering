# 🍔 FoodExpress - Complete Online Food Ordering System

A production-style, full-stack **Online Food Ordering System** built with **React (Vite)**, **Node.js (Express)**, and **MySQL**.

---

## 📖 Project Overview

FoodExpress is a modern, single-restaurant food ordering platform designed for high performance and seamless user experience.

### 🌟 Key Customer Features
- **User Authentication**: Register, login, persistent JWT sessions, profile management, and password reset with current password verification.
- **Dynamic Menu & Discovery**:
  - Live search across food names, descriptions, and categories.
  - Multi-factor filtering: Categories, Pure Veg / Non-Veg toggle, In-Stock status, and 4.5+ Rating filter.
  - Sorting: Price (Low → High, High → Low), Popularity, Highest Rated, and Newest arrivals.
- **Dish Details**: High-resolution photography, ingredients tags, dietary indicators, quantity selector, and related category dishes.
- **Smart Shopping Cart**: Real-time quantity adjustment, persistent cart state across pages, free delivery progress tracker (orders ₹500+ qualify for FREE delivery).
- **Backend Coupon System**: Validate codes like `WELCOME50` (50% OFF up to ₹100), `FLAT100` (₹100 flat discount), and `FOODIE20`. All discounts strictly verified on the backend.
- **Delivery Address Book**: Manage and select multiple saved delivery addresses.
- **Flexible Checkout**: Cash on Delivery (COD) and Simulated Mock Online Payment with animated banking authorization.
- **Live Order Tracking**: Visual step-by-step dispatch timeline (`PLACED` → `CONFIRMED` → `PREPARING` → `OUT_FOR_DELIVERY` → `DELIVERED`).
- **Order History & 1-Click Reorder**: Review past orders, view full itemized receipts, and instant 1-click reorder with live item availability verification.

### 🛠️ Key Administrator Features
- **Admin Dashboard**: Real-time KPI metric cards (Total Revenue, Orders, Today's Orders, Pending Orders, Users, Available Dishes).
- **Interactive Analytics**: Sales trend chart over time and order status distribution breakdown.
- **Food Management (`/admin/foods`)**: Add, edit, delete dishes, customize pricing/ratings, and instant one-click in-stock availability toggle switch.
- **Category Management (`/admin/categories`)**: Organize cuisines with safety checks preventing deletion of categories containing active dishes.
- **Order Management (`/admin/orders`)**: View all incoming orders, filter by status, search by customer, view customer delivery address, and update status (`PLACED` → `DELIVERED`).
- **Customer Directory (`/admin/users`)**: Inspect registered customers, total orders, lifetime expenditure, and toggle account activation status.
- **Coupon Manager (`/admin/coupons`)**: Create and configure percentage/fixed discount rules, expiry dates, minimum order thresholds, and usage limits.

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Tailwind CSS, Lucide React Icons |
| **Backend** | Node.js, Express.js, REST API, JSON Web Tokens (JWT), BcryptJS, CORS, Dotenv |
| **Database** | MySQL (InnoDB engine, strict Foreign Keys, Indexes, Constraints) via `mysql2` |

---

## 🗄️ Database Architecture

The system uses 9 normalized relational tables:
- `users`: Customer and administrator authentication with hashed passwords.
- `categories`: Culinary categories (Pizza, Burger, Biryani, Indian, Chinese, Desserts, Beverages, Snacks).
- `food_items`: 32+ seeded dishes with prices, ratings, ingredients, veg flag, and availability.
- `addresses`: User address book for checkout.
- `cart` & `cart_items`: User shopping carts synced with the database.
- `coupons`: Promotional discount rules and usage trackers.
- `orders`: Master order records with financial audit fields and delivery address snapshots.
- `order_items`: Historical item snapshots preserving food names and prices at the time of purchase.

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@foodapp.com` | `Admin@123` |
| **Demo Customer** | `user@foodapp.com` | `User@123` |

*Passwords are securely hashed using bcrypt prior to database insertion.*

---

## 📐 Order Calculation Formula

Calculations are computed and enforced strictly by the backend:
```
Subtotal = sum(item.price × item.quantity)
Delivery Fee = ₹40 (Waived / ₹0 if Subtotal >= ₹500)
Tax = 5% of Subtotal (GST)
Discount = Coupon Discount (Percentage or Fixed, capped at maximum_discount)
Grand Total = Subtotal + Delivery Fee + Tax - Discount
```

---

## 🚀 Setup & Installation Instructions

### 1. Database Setup (MySQL)
Ensure MySQL is running on your machine (default port 3306), then execute the SQL scripts:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```
*(If prompted for password and there is none, simply press Enter)*

### 2. Backend Setup
```bash
cd server
npm install
npm start
```
The backend REST API will run on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📁 Project Structure

```text
online-food-ordering/
├── client/
│   ├── src/
│   │   ├── components/       # Navbar, Footer, FoodCard, CartItem, OrderTimeline, Modal, Loader, EmptyState
│   │   ├── pages/            # Customer & Admin pages
│   │   ├── layouts/          # MainLayout, AdminLayout
│   │   ├── services/         # Axios API clients
│   │   ├── context/          # AuthContext, CartContext, NotificationContext
│   │   ├── utils/            # formatters (₹ currency, dates, badges)
│   │   ├── App.jsx           # Declarative routing & guards (ProtectedRoute, AdminRoute)
│   │   └── main.jsx          # App root
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── config/               # db.js (MySQL pool)
│   ├── controllers/          # auth, food, category, cart, order, coupon, user, admin
│   ├── middleware/           # auth.js (JWT & requireAdmin)
│   ├── routes/               # Express REST routes
│   ├── utils/                # seedRunner.js
│   ├── app.js
│   ├── server.js
│   └── package.json
├── database/
│   ├── schema.sql
│   └── seed.sql
├── README.md
└── .env.example
```