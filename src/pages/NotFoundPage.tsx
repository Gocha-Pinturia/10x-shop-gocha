import { Link } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-inner">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>

      <span className="font-mono text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
        404 Error
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
        Page not found
      </h1>

      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The page you are looking for does not exist.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/25 min-h-[48px]"
      >
        <span>Go to catalog</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
