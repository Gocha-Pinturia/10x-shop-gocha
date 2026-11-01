# 10X Shop - Cross-Browser & Device Compatibility (COMPATIBILITY.md)

## 1. Responsive Viewport Test Matrix (3 Breakpoints)

| Viewport Width | Device Target | Navigation Mode | Catalog Grid | Tap Targets (≥ 44px) | Horizontal Scroll | Result |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **375px** | iPhone SE / Mobile | Burger Drawer Menu | 1 Column | Pass (all buttons ≥ 44px) | **None (0px overflow)** | Pass |
| **414px – 480px** | iPhone 14 / Large Mobile | Burger Drawer Menu | 1 Column | Pass | **None** | Pass |
| **768px – 1024px** | iPad / Tablets | Full Header Nav | 2–3 Columns | Pass | **None** | Pass |
| **1280px+** | Desktop Displays | Full Header Nav + Badges | 4 Columns | Pass | **None** | Pass |

---

## 2. Browser Compatibility Matrix

| Browser | Version Tested | Rendering Engine | Routing & History | LocalStorage | Dark Mode | Status |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Google Chrome** | 120+ | Blink | Verified (SPA history) | Verified (`shop_cart`, etc.) | Verified (`.dark` class) | Fully Supported |
| **Mozilla Firefox** | 122+ | Gecko | Verified | Verified | Verified | Fully Supported |
| **Apple Safari** | 17+ (macOS/iOS) | WebKit | Verified | Verified | Verified | Fully Supported |
| **Microsoft Edge** | 120+ | Blink | Verified | Verified | Verified | Fully Supported |

---

## 3. Accessibility & Interactive States Verification
- **Semantic HTML**: Proper use of `<header>`, `<nav>`, `<main>`, `<footer>`, `<form>`, `<label>`, `<button>`, and `<a>`.
- **Form Controls**: All inputs have associated labels (`htmlFor` matched with `id`), aria-labels for icon-only actions.
- **Focus Rings**: Visual outline focus rings (`focus:ring-2 focus:ring-indigo-500`) on all interactive buttons, steppers, and inputs.
- **Contrast Ratios**: Body text achieves contrast ratios exceeding WCAG AA requirements (>= 4.5:1) in both Light and Dark themes.
- **Image Attributes**: All product images feature meaningful `alt` descriptions, `width`, `height`, and `loading="lazy"` attributes to prevent CLS.
