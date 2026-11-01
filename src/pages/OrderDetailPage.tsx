import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
  RotateCcw,
  Clock,
  CreditCard,
  Check,
} from "lucide-react";
import { ordersStorage } from "../models/StorageService.ts";
import { OrderModel } from "../models/Order.ts";
import type { Order, OrderStatus } from "../types/order.ts";
import type { Product } from "../types/product.ts";
import { formatPrice, formatDate } from "../utils/format.ts";
import { useCart } from "../context/CartContext.tsx";
import { useToast } from "../context/ToastContext.tsx";
import NotFoundPage from "./NotFoundPage.tsx";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [orders] = useState<Order[]>(() => ordersStorage.get() || []);
  const [, setNow] = useState<Date>(new Date());

  // Check if just placed from checkout
  const justPlaced = Boolean((location.state as { justPlaced?: boolean } | null)?.justPlaced);

  // Update status timeline periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const order = orders.find((o) => String(o.id) === id || o.number === id);

  if (!order) {
    return <NotFoundPage />;
  }

  const currentStatus: OrderStatus = OrderModel.getStatus(order);

  // Reorder all items in this order
  const handleReorder = () => {
    order.items.forEach((item) => {
      const mockProduct: Product = {
        id: item.productId,
        title: item.title,
        description: "",
        category: "",
        price: item.price,
        discountPercentage: item.discountPercentage,
        rating: 5,
        stock: item.stock || 50,
        thumbnail: item.thumbnail,
        images: [item.thumbnail],
        reviews: [],
      };
      addItem(mockProduct, item.quantity);
    });

    showToast("Items added to cart ✓", "success");
    navigate("/cart");
  };

  const steps: { label: OrderStatus; desc: string }[] = [
    { label: "Processing", desc: "Order confirmed and being packed" },
    { label: "Shipped", desc: "Handed over to carrier courier" },
    { label: "Delivered", desc: "Successfully delivered to your door" },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === "Processing") return 0;
    if (status === "Shipped") return 1;
    return 2;
  };

  const currentStepIdx = getStepIndex(currentStatus);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to orders</span>
        </Link>
      </div>

      {/* Just Placed Celebration Banner */}
      {justPlaced && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-sm">
            <span className="font-bold">Thank you for your order!</span> We have received it and started processing.
          </div>
        </div>
      )}

      {/* Order Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                Order #{order.number}
              </h1>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {currentStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-2">
              <Clock className="w-3.5 h-3.5" />
              Placed on {formatDate(order.placedAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleReorder}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reorder</span>
          </button>
        </div>

        {/* Status Timeline */}
        <div className="py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
            Shipment Status Timeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.label} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isCompleted
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-bold ${
                        isCurrent
                          ? "text-indigo-600 dark:text-indigo-400"
                          : isCompleted
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items Table */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Ordered Items</span>
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="p-4 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/20"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700/60 shrink-0"
                  />
                  <div className="min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-semibold text-sm text-slate-900 dark:text-white hover:text-indigo-600 truncate block"
                    >
                      {item.title}
                    </Link>
                    <span className="text-xs text-slate-500">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </div>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Info Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Shipping Address */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm mb-2">
              <Truck className="w-4 h-4 text-indigo-500" />
              <span>Shipping Details</span>
            </h3>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{order.shipping.fullName}</p>
            <p className="text-slate-600 dark:text-slate-400">{order.shipping.address}</p>
            <p className="text-slate-600 dark:text-slate-400">
              {order.shipping.city} {order.shipping.postalCode ? `, ${order.shipping.postalCode}` : ""}
            </p>
            {order.shipping.country && (
              <p className="text-slate-600 dark:text-slate-400">{order.shipping.country}</p>
            )}
            <p className="text-slate-600 dark:text-slate-400 pt-1">Email: {order.shipping.email}</p>
          </div>

          {/* Payment and Totals */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm mb-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              <span>Payment & Summary</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Method: <span className="font-medium text-slate-900 dark:text-white">{order.paymentMethod || "Cash on delivery"}</span>
            </p>
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
