# 10X Shop - Graduation Project Plan (PLAN.md)

## 1. Project Goal & Scope
The goal of this project is to create **10X Shop**, a modern, responsive, production-ready e-commerce Single Page Application (SPA) built using React 19, TypeScript in strict mode, Tailwind CSS v4, and the DummyJSON API.

### Scope Overview
- **CORE Scope (Pass Baseline)**:
  - Strict TypeScript setup with `strict: true`, 0 type errors.
  - Responsive design with Tailwind CSS v4 (supporting 375px mobile through desktop).
  - Navigation with React Router (`/`, `/login`, `/products/:id`, `/cart`, `/checkout`, `*` 404).
  - Local authentication simulation in `AuthContext` (username/password controlled inputs, guest vs. logged-in state).
  - Catalog browsing with product cards, rating, discount calculation, stock indicators, and "Add to cart".
  - Product details view with gallery image selection, stock badges, quantity steppers, and related products.
  - Cart with item quantity adjustments, removal, subtotal/total calculations, and local persistence (`shop_cart`).
  - Checkout form with validation for required shipping fields, cart clearing, and order confirmation summary.
  - ErrorBoundary class component and basic error handling.
- **FULL Scope (Excellence 4–5 Points Zone)**:
  - Debounced search (400ms delay) and URL state synchronization (`?q=`, `?category=`, `?sort=`, `?page=`).
  - Categories dropdown and sorting by price, rating, and name.
  - Formik + Yup schema validation on the Login page.
  - Order history (`/orders`) and live shipment status timeline simulation (Processing → Shipped → Delivered).
  - Customer Profile page (`/profile`) with editable details, theme switcher, and local data reset.
  - OOP Domain models (`Cart`, `OrderModel`, `StorageService<T>`, `ApiClient`, `ApiError`).
  - Dark / Light mode with Tailwind `@theme` integration and `shop_theme` persistence.
  - Promo code `10X10` providing a 10% discount on order subtotal.
  - Route-level code splitting using `React.lazy` and `Suspense`.

---

## 2. 3-Week Milestones & Timeline

### Week 1: Foundation, Architecture, Auth & Catalog (Oct 17 – Oct 23)
- Initialize Vite + React 19 + TypeScript strict configuration.
- Integrate Tailwind CSS v4 with custom `@theme` tokens.
- Establish architecture: `api/`, `types/`, `models/`, `context/`, `hooks/`, `components/`, `pages/`, `routes/`.
- Implement `ApiClient`, `ApiError`, and product API fetchers with `AbortController`.
- Implement `AuthContext` and Formik + Yup login flow on `/login`.
- Develop `CatalogPage` with `ProductGrid`, `ProductCard`, and URL query parameter bindings.

### Week 2: Product Details, Cart, Checkout & Domain Models (Oct 24 – Oct 30)
- Build `ProductPage` with dynamic routing `/products/:id`, thumbnail selection, stock stepper, and review submissions.
- Implement OOP `Cart` domain model with `subtotal`, `discount`, `shipping`, and `total` calculation methods.
- Implement `cartReducer` with strict discriminated unions and exhaustive `never` checking.
- Persist cart in localStorage under `shop_cart`.
- Implement promo code engine (`10X10` for 10% off).
- Build `CheckoutPage` with required shipping validation, order summary, and order placement simulation.

### Week 3: Orders, Polish, Responsive Audits & Documentation (Oct 31 – Nov 06)
- Build `OrdersPage` and `OrderDetailPage` with automated status transitions (`Processing` < 1 min, `Shipped` 1–3 min, `Delivered` > 3 min).
- Build `ProfilePage` with local editing, order metrics, and "Clear local data" functionality.
- Implement `ThemeProvider` for Dark/Light mode toggle.
- Add `ErrorBoundary` class component and Toast alert notifications.
- Optimize performance via `React.lazy` code splitting, image `loading="lazy"`, and `React.memo(ProductCard)`.
- Perform mobile viewport testing at 375px (no horizontal scrolling).
- Write comprehensive documentation: `README.md`, `REPORT.md`, `DEBUG-LOG.md`, and `COMPATIBILITY.md`.

---

## 3. Work Breakdown Structure (WBS) & Effort Estimation

| Epic | Tasks & Deliverables | Est. Hours | Milestone |
|---|---|:---:|:---:|
| **Setup & Architecture** | Vite, tsconfig strict, Tailwind v4, Folder scaffolding | 6h | Week 1 |
| **Data Layer & Types** | Product, Cart, User, Order types, ApiClient class | 8h | Week 1 |
| **Auth & Routing** | Layout, NavLinks, ProtectedRoute, Formik+Yup Login | 10h | Week 1 |
| **Catalog & Filters** | Debounce, Category filter, Sorting, Pagination, URL state | 14h | Week 1 |
| **Product Details** | Gallery, Stepper, Stock limits, Customer reviews | 12h | Week 2 |
| **Cart System** | Cart OOP model, cartReducer, Toast alerts, Promo code | 12h | Week 2 |
| **Checkout Flow** | Controlled form, Validation, Order generation, Clear cart | 10h | Week 2 |
| **Order Tracking** | Orders list, Status timeline simulation, Reorder flow | 8h | Week 3 |
| **Profile & Settings** | Edit profile, Theme switcher, Clear local data | 6h | Week 3 |
| **Performance & QA** | Lazy loading, ErrorBoundary, 375px responsive testing | 8h | Week 3 |
| **Documentation** | PLAN.md, README.md, REPORT.md, DEBUG-LOG.md | 8h | Week 3 |
| **Total** | | **102h** | |

---

## 4. Risk Assessment & Mitigations

1. **Risk: DummyJSON API downtime, latency, or rate limits**
   - *Mitigation*: Graceful error states with Retry buttons in `CatalogPage` and `ProductPage`. Fallback mock reviews and client-side sorting if API sorting parameters are ignored.
2. **Risk: State desynchronization between header badge and cart page**
   - *Mitigation*: Single source of truth via `CartContext` and `cartReducer`, combined with reactive localStorage syncing via `StorageService<CartState>`.
3. **Risk: Race conditions on rapid search typing**
   - *Mitigation*: Custom `useDebounce` hook (400ms delay) combined with `AbortController` in `useEffect` cleanup to cancel obsolete requests.
4. **Risk: Mobile viewport horizontal scrolling (overflow bug)**
   - *Mitigation*: Strict Tailwind utilities (`max-w-full`, `overflow-x-hidden`, flexible grids) verified down to 375px viewport dimensions.

---

## 5. Definition of Done (DoD)
- TypeScript passes with `tsc --noEmit` and **0 errors** in strict mode (`any` is disallowed).
- All 8 routes (`/`, `/login`, `/products/:id`, `/cart`, `/checkout`, `/orders`, `/orders/:id`, `/profile`, `*`) work smoothly without page reloads.
- Responsive across Mobile (375px), Tablet, and Desktop with tap targets >= 44px.
- All core user flows execute seamlessly: Catalog → Product Details → Cart → Checkout → Order Confirmation → Order Tracking.
