import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Clock, ChevronRight, ShoppingBag, ArrowRight } from "lucide-react";
import { ordersStorage } from "../models/StorageService.ts";
import { OrderModel } from "../models/Order.ts";
import type { Order, OrderStatus } from "../types/order.ts";
import { formatPrice, formatDate } from "../utils/format.ts";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders] = useState<Order[]>(() => ordersStorage.get() || []);
  const [, setNow] = useState<Date>(new Date());

  // Periodically refresh order status every 30 seconds as specified in PRD P6.2
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case "Processing":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300";
      case "Shipped":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          You have no orders yet.
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          When you place orders, they will appear here along with live simulated tracking updates.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors"
        >
          <span>Browse products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Your Orders
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track current shipments and view order summaries
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const currentStatus = OrderModel.getStatus(order);
          const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

          return (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      #{order.number}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                        currentStatus
                      )}`}
                    >
                      {currentStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(order.placedAt)}
                    </span>
                    <span>·</span>
                    <span>
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block">Total</span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
