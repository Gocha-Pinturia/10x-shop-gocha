import { ShoppingBag, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      {/* Service Highlights */}
      <div className="border-b border-slate-100 dark:border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Free Fast Shipping</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">On all orders over $100</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Authentic Products</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Directly verified from suppliers</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">30-Day Easy Return</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hassle-free money back</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 font-medium">
          <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>© 2026 10X Shop. Front-End Graduation Project.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Catalog
          </Link>
          <Link to="/cart" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Cart
          </Link>
          <span className="text-slate-400 dark:text-slate-600">Built with React 19 + Tailwind v4 + DummyJSON</span>
        </div>
      </div>
    </footer>
  );
}
