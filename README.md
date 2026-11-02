# 10X Shop - Modern E-Commerce Web Application

## About
**10X Shop** is a high-performance, responsive e-commerce Single Page Application (SPA) designed to deliver a seamless shopping experience from product discovery to order tracking. Built with React 19, TypeScript in strict mode, and Tailwind CSS v4, the application integrates with the DummyJSON API and implements client-side state management, OOP domain models, and simulated shipment fulfillment.

---

## Features

### CORE Features
- **Product Catalog**: Live fetching from DummyJSON with responsive grids, price display with discounts, real-time stock status, and instant "Add to Cart".
- **Product Details (`/products/:id`)**: High-resolution image gallery, quantity stepper with stock boundary controls, formatted specifications, and related items.
- **Shopping Cart (`/cart`)**: Live quantity management, removal, subtotal/total calculations, and cart persistence across browser tabs.
- **Controlled Checkout (`/checkout`)**: Protected route requiring user login, full client-side validation, simulated order processing, and automatic cart clearing.
- **Authentication Simulation (`/login`)**: Client-side state authentication in `AuthContext` with redirect preservation back to checkout.
- **Error Handling & 404**: Catch-all 404 page for nonexistent routes or product IDs, plus an `ErrorBoundary` fallback component.
- **Mobile Responsive**: 100% responsive down to 375px screens with tap targets >= 44px and zero horizontal overflow.

### FULL Features
- **URL-Driven Catalog Filtering**: Debounced search (`?q=`), dynamic category filtering (`?category=`), multi-field sorting (`?sort=`), and pagination (`?page=`) all synchronized with URL parameters.
- **Formik + Yup Authentication**: Production-grade form handling with real-time schema validation and test credentials auto-fill.
- **Order Tracking & Lifecycle (`/orders` & `/orders/:id`)**: Automated live status updates (`Processing` < 1 min → `Shipped` 1–3 min → `Delivered` > 3 min) re-evaluated every 30 seconds.
- **Reorder Feature**: 1-click reorder functionality from order details directly into the cart.
- **Customer Profile (`/profile`)**: User information editing, order statistics, light/dark theme switcher, and selective local data clearing.
- **Promo Code Engine**: Apply promo code `10X10` for an immediate 10% discount on order subtotal.
- **Toast Notifications**: Floating feedback alerts for cart additions, removals, reviews, and promo codes.
- **OOP Architecture**: Dedicated domain models (`Cart`, `OrderModel`, `ApiClient`, `StorageService<T>`).
- **Performance Optimization**: Route-level code splitting with `React.lazy` and `Suspense`, image `loading="lazy"`, and `React.memo` for product cards.

---

## Tech Stack
- **Framework**: React 19 SPA (Vite 8)
- **Language**: TypeScript 5+ (Strict Mode with zero compiler errors)
- **Styling**: Tailwind CSS v4 (with `@theme` design tokens and dark mode)
- **Icons**: Lucide React
- **Forms & Validation**: Formik & Yup
- **Data Source**: DummyJSON REST API
- **State Management**: React Context API, `useReducer` with discriminated unions, and custom generic storage services

---

## Architecture

### Directory Tree
```
src/
├── api/
│   ├── ApiClient.ts        # OOP HTTP client with generics and error handling
│   ├── ApiError.ts         # Custom error class with status codes and type guards
│   └── products.api.ts     # Catalog, category, and product endpoints
├── components/
│   ├── common/
│   │   ├── ErrorBoundary.tsx   # Class-based error boundary with reload fallback
│   │   ├── ProtectedRoute.tsx  # Guard enforcing authentication on checkout/orders
│   │   └── ScrollToTop.tsx     # Viewport reset on route navigation
│   ├── layout/
│   │   ├── Header.tsx          # Responsive navigation, cart badge, theme toggle
│   │   ├── Footer.tsx          # Guarantees, copyright, and fast links
│   │   └── Layout.tsx          # Root shell with <Outlet />
│   ├── product/
│   │   ├── Pagination.tsx      # Accessible pagination with page buttons
│   │   ├── ProductCard.tsx     # Memoized product card with pricing and stock logic
│   │   └── ProductGrid.tsx     # Responsive CSS grid container
│   └── ui/
│       ├── Skeleton.tsx        # Loading card placeholders (anti-CLS)
│       └── Spinner.tsx         # Accessible loading indicators
├── context/
│   ├── AuthContext.tsx     # Client-side user state & session handling
│   ├── cart.reducer.ts     # Pure reducer with discriminated union actions
│   ├── CartContext.tsx     # Shopping cart provider and toast triggers
│   ├── ThemeContext.tsx    # Light/Dark mode state with DOM syncing
│   └── ToastContext.tsx    # Floating alert notification system
├── hooks/
│   ├── useDebounce.ts      # Input debounce for search efficiency
│   ├── useFetch.ts         # Generic data fetch hook with AbortController
│   └── useLocalStorage.ts  # Typed localStorage synchronization
├── models/
│   ├── Cart.ts             # OOP Cart model implementing ICart
│   ├── Order.ts            # Order model with status transitions
│   └── StorageService.ts   # Generic localStorage gateway class
├── pages/
│   ├── CatalogPage.tsx     # Search, filter, sort, and product list
│   ├── CartPage.tsx        # Shopping cart view with promo code input
│   ├── CheckoutPage.tsx    # Shipping details form and order summary
│   ├── LoginPage.tsx       # Formik+Yup login form with demo autofill
│   ├── NotFoundPage.tsx    # 404 fallback page
│   ├── OrderDetailPage.tsx # Order breakdown and shipment timeline
│   ├── OrdersPage.tsx      # Order history list
│   └── ProfilePage.tsx     # User settings, theme toggle, and data reset
├── routes/
│   └── AppRoutes.tsx       # Lazy-loaded route map with Suspense
├── types/
│   ├── api.ts              # AsyncState discriminated union
│   ├── cart.ts             # CartItem (Pick<Product>) and CartState
│   ├── order.ts            # Order, OrderStatus, and ShippingInfo
│   ├── product.ts          # Product, Category, and Review interfaces
│   └── user.ts             # AuthUser and Form values
└── utils/
    ├── format.ts           # Currency, discount, and date formatters
    ├── url.ts              # Query string builder for API requests
    └── validation.ts       # Centralized validation rules and error strings
```

### Data Flow
1. **User Action** → User searches, filters, clicks an item, or adjusts quantities.
2. **State Transition** → Actions dispatch to `CartContext` / `cartReducer` or update URL query parameters via `useSearchParams`.
3. **API Synchronization** → `useEffect` observes parameters, triggers `ApiClient.get<T>()` with an `AbortController` signal to prevent race conditions.
4. **Rendering & Feedback** → Components render updated state, recalculate totals using the OOP `Cart` domain model, and trigger user-friendly toast alerts.

---

## How to Run & Available Scripts

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### 3. Type Checking
```bash
npm run typecheck
```
Executes `tsc --noEmit` under strict TypeScript rules (0 errors required).

### 4. Production Build
```bash
npm run build
```
Creates an optimized production bundle inside the `dist/` directory.

---

## Test Accounts
To evaluate the authenticated experience, use the provided credentials or click the **"Fill emilys"** quick-action button on the Login page:
- **Username**: `emilys`
- **Password**: `emilyspass`

---

## Live Demo
- **Preview Application**: Available in the development environment at port 3000.
https://prd-exam.vercel.app/

---

## Credits
- Built as a Front-End Graduation Project (10X Shop PRD specification).
- Product data and mock APIs courtesy of [DummyJSON](https://dummyjson.com).
