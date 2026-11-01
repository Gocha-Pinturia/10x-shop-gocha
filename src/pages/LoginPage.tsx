import { useState, useId } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Lock, User, ArrowLeft, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";
import { useToast } from "../context/ToastContext.tsx";

const loginSchema = Yup.object().shape({
  username: Yup.string()
    .trim()
    .required("Username is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const usernameId = useId();
  const passwordId = useId();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve destination if redirected from protected route
  const redirectPath = (location.state as { from?: string } | null)?.from || "/";

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: loginSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      // Simulate quick authentication
      setTimeout(() => {
        login(values.username);
        showToast(`Welcome back, ${values.username}!`, "success");
        setIsSubmitting(false);
        navigate(redirectPath, { replace: true });
      }, 300);
    },
  });

  const handleFillDemo = () => {
    formik.setValues({
      username: "emilys",
      password: "emilyspass",
    });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to catalog</span>
        </Link>

        {/* Title */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to 10X Shop
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your credentials to manage orders and checkout seamlessly
          </p>
        </div>

        {/* Form using Formik + Yup */}
        <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
          {/* Username Field */}
          <div>
            <label
              htmlFor={usernameId}
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id={usernameId}
                name="username"
                type="text"
                autoComplete="username"
                placeholder="e.g. emilys"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 min-h-[44px] transition-all ${
                  formik.touched.username && formik.errors.username
                    ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                }`}
              />
            </div>
            {formik.touched.username && formik.errors.username && (
              <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 font-medium">
                {formik.errors.username}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor={passwordId}
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="At least 6 characters"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 min-h-[44px] transition-all ${
                  formik.touched.password && formik.errors.password
                    ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                }`}
              />
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 font-medium">
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all shadow-md shadow-indigo-600/25 min-h-[44px] disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Log In"}
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Demo Credentials (PRD)
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              Fill emilys
            </button>
          </div>
          <p className="text-indigo-700 dark:text-indigo-300">
            Username: <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">emilys</code> ·
            Password: <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">emilyspass</code>
          </p>
        </div>
      </div>
    </div>
  );
}
