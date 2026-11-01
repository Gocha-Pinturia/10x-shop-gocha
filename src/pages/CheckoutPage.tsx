import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ShoppingBag,
  CreditCard,
  Truck,
  ArrowRight,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useCart } from "../context/CartContext.tsx";
import { useAuth } from "../context/AuthContext.tsx";
import { useToast } from "../context/ToastContext.tsx";
import { validateCheckout } from "../utils/validation.ts";
import { formatPrice } from "../utils/format.ts";
import { OrderModel } from "../models/Order.ts";
import { ordersStorage } from "../models/StorageService.ts";
import type { Order } from "../types/order.ts";

export default function CheckoutPage() {
  const { items, cart, subtotal, discount, shipping, total, promoCode, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Controlled form state
  const [formData, setFormData] = useState({
    fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || "",
    email: user.email || (user.username ? `${user.username.toLowerCase()}@example.com` : ""),
    address: "",
    city: "",
    phone: user.phone || "+1 555-0199",
    postalCode: "10001",
    country: "Georgia",
    paymentMethod: "Cash on delivery",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // If cart is empty and order wasn't just placed, show redirect prompt
  if (items.length === 0 && !placedOrder) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Your cart is empty
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          You need at least one product in your cart before checking out.
        </p>
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors"
        >
          Return to Cart
        </Link>
      </div>
    );
  }

  // Handle Input Changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Submit Order
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateCheckout(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Create local simulated order
      const newOrder = OrderModel.create(
        cart,
        items,
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          phone: formData.phone.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country,
        },
        formData.paymentMethod
      );

      // Save to localStorage shop_orders
      const existingOrders = ordersStorage.get() || [];
      ordersStorage.set([newOrder, ...existingOrders]);

      // Set placed order for thank-you confirmation screen
      setPlacedOrder(newOrder);

      // Clear the cart
      clearCart();

      setIsSubmitting(false);
      showToast("Order placed successfully!", "success");
    }, 600);
  };

  // If order was successfully placed, render Thank You screen
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 sm:p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Thank you! Your order has been placed.
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Order Reference:{" "}
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              #{placedOrder.number}
            </span>
          </p>
        </div>

        {/* Order Brief Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-left border border-slate-200/60 dark:border-slate-700/60 space-y-4">
          <div className="flex justify-between items-baseline border-b border-slate-200 dark:border-slate-700 pb-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              Delivering to
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {placedOrder.shipping.fullName} ({placedOrder.shipping.city}, {placedOrder.shipping.address})
            </span>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
              Items Ordered ({placedOrder.items.length})
            </span>
            {placedOrder.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="truncate pr-2">
                  {item.quantity}× {item.title}
                </span>
                <span className="font-semibold shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-baseline font-bold text-base text-slate-900 dark:text-white">
            <span>Total Amount Paid</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-xl font-extrabold">
              {formatPrice(placedOrder.total)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(`/orders/${placedOrder.id}`, { state: { justPlaced: true } })}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Timeline</span>
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors min-h-[44px] flex items-center justify-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Checkout
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete your shipping and delivery details to place your simulated order
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Shipping Form Fields (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Shipping Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 min-h-[44px] transition-all ${
                      errors.fullName
                        ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                        : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 font-medium">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 min-h-[44px] transition-all ${
                      errors.email
                        ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                        : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Street Address *
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, Apt 4B"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 min-h-[44px] transition-all ${
                      errors.address
                        ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                        : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 font-medium">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Tbilisi / New York"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 min-h-[44px] transition-all ${
                      errors.city
                        ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                        : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 font-medium">
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+995 555 123 456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="0102"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                  />
                </div>

                {/* Country */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                  >
                    <option value="Georgia">Georgia</option>
                    <option value="United States">United States</option>
                    <option value="Germany">Germany</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="France">France</option>
                  </select>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Payment Method (Simulated)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.paymentMethod === "Cash on delivery"
                        ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on delivery"
                      checked={formData.paymentMethod === "Cash on delivery"}
                      onChange={handleChange}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Cash on Delivery
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.paymentMethod === "Credit Card"
                        ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Credit Card"
                      checked={formData.paymentMethod === "Credit Card"}
                      onChange={handleChange}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Card on File (•••• 4242)
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </h2>

              {/* Items List preview */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
                {items.map((it) => (
                  <div key={it.productId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={it.thumbnail}
                        alt={it.title}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-lg object-contain bg-slate-100 dark:bg-slate-800 p-1 shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {it.title}
                        </div>
                        <div className="text-slate-400">Qty: {it.quantity}</div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white shrink-0">
                      {formatPrice(it.price * it.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2.5 text-sm border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>

                {promoCode && discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount (10X10 −10%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>

                <div className="flex justify-between items-baseline font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-base text-slate-900 dark:text-white">Total</span>
                  <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all min-h-[48px] disabled:opacity-50"
              >
                <span>{isSubmitting ? "Processing Order..." : "Place order"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Simulated secure e-commerce checkout</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
