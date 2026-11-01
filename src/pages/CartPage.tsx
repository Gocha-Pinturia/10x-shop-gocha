import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Tag, Check, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext.tsx";
import { formatPrice, discountedPrice } from "../utils/format.ts";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    promoCode,
    setQuantity,
    removeItem,
    clearCart,
    applyPromo,
    removePromo,
  } = useCart();

  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromo(promoInput);
    if (res.success) {
      setPromoInput("");
      setPromoError("");
    } else {
      setPromoError(res.error || "Invalid promo code");
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Clear the cart? This cannot be undone.")) {
      clearCart();
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Your cart is empty.
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
          Looks like you haven&apos;t added any items to your shopping cart yet. Explore our catalog to find great deals!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/25 min-h-[48px]"
        >
          <span>Browse products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and adjust your selected products before proceeding to checkout
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
            {items.map((item) => {
              const unitPrice = discountedPrice(item.price, item.discountPercentage);
              const lineTotal = unitPrice * item.quantity;

              return (
                <div key={item.productId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  {/* Thumbnail */}
                  <Link
                    to={`/products/${item.productId}`}
                    className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-2 shrink-0 flex items-center justify-center overflow-hidden border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      loading="lazy"
                      width={96}
                      height={96}
                      className="max-h-full max-w-full object-contain"
                    />
                  </Link>

                  {/* Title and Unit Price */}
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-bold text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-xs text-slate-500">
                      <span>Unit: {formatPrice(unitPrice)}</span>
                      {item.discountPercentage >= 1 && (
                        <span className="line-through text-slate-400">{formatPrice(item.price)}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-white select-none">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[90px]">
                    <div className="font-bold text-base text-slate-900 dark:text-white">
                      {formatPrice(lineTotal)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Remove ${item.title} from cart`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Clear Cart Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleClearCart}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5 p-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear cart</span>
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Order Summary
            </h2>

            {/* Price Breakdown */}
            <div className="space-y-3 text-sm border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>

              {promoCode && discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span>Discount (10X10 −10%)</span>
                    <button
                      type="button"
                      onClick={removePromo}
                      className="text-xs text-rose-500 hover:underline ml-1"
                    >
                      Remove
                    </button>
                  </div>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>

              {shipping > 0 && subtotal - discount < 100 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Add {formatPrice(100 - (subtotal - discount))} more to qualify for Free Shipping!
                </p>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatPrice(total)}
              </span>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-2 pt-2">
              <label htmlFor="cartPromoCodeInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Promo Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="cartPromoCodeInput"
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPromoError("");
                    }}
                    placeholder="Try '10X10'"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs uppercase font-medium focus:ring-2 focus:ring-indigo-500 min-h-[42px]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors min-h-[42px]"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-rose-600 dark:text-rose-400 text-xs mt-1">
                  {promoError}
                </p>
              )}
              {promoCode && (
                <p className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1 mt-1 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Code {promoCode} is currently active.
                </p>
              )}
            </form>

            {/* Checkout Button */}
            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all min-h-[48px]"
            >
              <span>Proceed to checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
