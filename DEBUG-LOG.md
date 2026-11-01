# 10X Shop - Debugging Log (DEBUG-LOG.md)

This document records 5 concrete debugging case studies resolved during development, covering network issues, TypeScript safety, React rendering lifecycle, routing, and domain edge cases.

---

### Bug 1: Network 404 on Invalid Product Route Parameters
- **Symptom**: Navigating to `/products/abc` or `/products/999999` caused an uncaught console error (`Uncaught (in promise) ApiError: 404`) and displayed a broken screen instead of the standard 404 Not Found view.
- **Reproduction**:
  1. Open browser address bar and type `http://localhost:3000/products/abc`.
  2. Observe network tab and unhandled exception thrown.
- **Tool Used**: Chrome DevTools Network Tab & Console Inspector (revealed 404 HTTP response from `dummyjson.com/products/abc`).
- **Root Cause**: `useParams<{ id: string }>()` returned `"abc"` which was parsed into `NaN` and directly concatenated to the API request endpoint.
- **Fix**: Added validation in `ProductPage.tsx` before triggering API calls:
  ```ts
  const numericId = Number(id);
  const isValidId = !isNaN(numericId) && numericId > 0 && Number.isInteger(numericId);
  if (!isValidId) {
    setNotFound(true);
    setLoading(false);
    return;
  }
  ```
  If `!isValidId` or the API returns status `404`, the component renders `<NotFoundPage />` without crashing.
- **What I Learned**: Never trust route parameters as valid identifiers without client-side type and numerical boundary guards.

---

### Bug 2: TypeScript Guard Preventing Runtime Undefined Crash on Discount
- **Symptom**: Compilation alert when calculating `discountedPrice(product.price, product.discountPercentage)`.
- **Reproduction**:
  1. Set `tsconfig.json` to `"strict": true`.
  2. Run `npm run typecheck`.
- **Tool Used**: TypeScript compiler (`tsc --noEmit`).
- **Root Cause**: Some external product objects from third-party APIs have missing or null `discountPercentage` values (`number | undefined`). Passing `undefined` into the discount formula resulted in `NaN` propagating into cart subtotal totals.
- **Fix**: Implemented defensive fallback and safe guard inside `src/utils/format.ts`:
  ```ts
  export function discountedPrice(price: number, discountPercentage: number | undefined): number {
    if (!discountPercentage || discountPercentage <= 0) return price;
    const discounted = price * (1 - discountPercentage / 100);
    return Math.round(discounted * 100) / 100;
  }
  ```
- **What I Learned**: Strict TypeScript flags catch potential NaN and undefined calculations during compile time before they ever reach user devices.

---

### Bug 3: Missing useEffect Dependency on Product Detail Transitions
- **Symptom**: When clicking a "Related Product" card at the bottom of `/products/1` to go to `/products/4`, the URL changed in the address bar, but the page content remained showing Product 1.
- **Reproduction**:
  1. Navigate to `/products/1`.
  2. Scroll to the "Related Products" section and click the first item.
  3. Notice URL updates to `/products/4`, but the main image, title, and price do not update.
- **Tool Used**: React DevTools Components tab (showed `id` prop changed in route context, but internal state hooks didn't re-trigger).
- **Root Cause**: The `useEffect` fetching the product had an empty dependency array `[]` instead of `[id, numericId, isValidId]`.
- **Fix**: Included `numericId` in the `useEffect` dependency array and added a state reset so changing IDs fetches the new product and resets the selected image and stepper.
- **What I Learned**: Always include all external reactive identifiers accessed inside effects in the dependency array to ensure consistent synchronization.

---

### Bug 4: Cart Stock Overflow on Multiple Fast Clicks
- **Symptom**: If an item had a stock of 2 units, a user rapidly clicking "Add to cart" on the catalog card could add 3 or 4 units into the cart, violating available inventory limits.
- **Reproduction**:
  1. Find a product with `stock = 2`.
  2. Rapidly click "Add to cart" 3 times in quick succession.
  3. Inspect cart quantity.
- **Tool Used**: React DevTools Profiler & CartContext state inspection.
- **Root Cause**: State update in `cartReducer` did not check the combined existing quantity against `product.stock` before incrementing.
- **Fix**: Updated `cartReducer` to enforce stock capacity:
  ```ts
  const newQty = currentItem.quantity + qty;
  if (newQty > product.stock) {
    return state; // Reject addition exceeding stock
  }
  ```
  Integrated toast notification: `Cannot add more: Only X available in stock`.
- **What I Learned**: Business rules and boundary limits must always be enforced inside the pure reducer to prevent race condition leaks from UI event handlers.

---

### Bug 5: Client-Side Routing Refresh (SPA Direct Deep Links)
- **Symptom**: Refreshing the browser on `/products/5` or `/checkout` could result in a 404 in non-SPA server environments.
- **Reproduction**:
  1. Navigate to `/products/5`.
  2. Trigger browser hard refresh (`Cmd+R` / `F5`).
- **Tool Used**: Network developer tools and Vite dev server configuration.
- **Root Cause**: Static file servers try to look for a physical file `/products/5/index.html` unless configured for SPA fallback rewrite to `/index.html`.
- **Fix**: Ensured Vite development server and single-page routing use HTML5 history API with standard fallback redirect, and added 404 wildcard fallback `*` in `AppRoutes.tsx`.
- **What I Learned**: Modern SPAs require route fallback handling both at the server configuration level (Vite/Vercel rewrites) and the client-side router level (`path="*"`).
