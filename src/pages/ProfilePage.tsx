import { useState, useId } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Moon,
  Sun,
  Trash2,
  LogOut,
  Save,
  CheckCircle2,
  Mail,
  Phone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";
import { useCart } from "../context/CartContext.tsx";
import { useTheme } from "../context/ThemeContext.tsx";
import { useToast } from "../context/ToastContext.tsx";
import { ordersStorage, reviewsStorage } from "../models/StorageService.ts";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { clearCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const phoneId = useId();

  // Controlled form state
  const [firstName, setFirstName] = useState(user.firstName || user.username || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [email, setEmail] = useState(user.email || `${user.username || "shopper"}@example.com`);
  const [phone, setPhone] = useState(user.phone || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Orders count
  const orders = ordersStorage.get() || [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!firstName.trim() || firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (phone.trim()) {
      const phoneDigits = phone.replace(/[\s+-]/g, "");
      if (phoneDigits.length < 9 || phoneDigits.length > 15 || !/^\d+$/.test(phoneDigits)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("Please correct profile errors", "error");
      return;
    }

    setErrors({});
    updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    setIsSaved(true);
    showToast("Profile details updated successfully!", "success");
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "Clear all local cart, order history, and product reviews? Your login session and theme will be preserved."
      )
    ) {
      clearCart();
      ordersStorage.remove();
      reviewsStorage.remove();
      showToast("Local shopping data cleared", "info");
    }
  };

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully", "info");
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Customer Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account preferences, contact info, and device storage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Column: User Summary Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <User className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {firstName} {lastName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                @{user.username || "guest"}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-xs">
              <div>
                <span className="text-slate-400 block">Orders</span>
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {orders.length}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
              <div>
                <span className="text-slate-400 block">Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                  Active Member
                </span>
              </div>
            </div>
          </div>

          {/* Quick Settings Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Preferences & Actions
            </h3>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200 min-h-[44px]"
            >
              <div className="flex items-center gap-2">
                {theme === "light" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                <span>Theme: {theme === "light" ? "Light" : "Dark"}</span>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 text-xs">Toggle</span>
            </button>

            {/* Clear Local Data */}
            <button
              type="button"
              onClick={handleClearData}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-slate-700 dark:text-slate-200 transition-colors text-xs font-semibold min-h-[44px]"
            >
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Trash2 className="w-4 h-4" />
                <span>Clear Local Data</span>
              </div>
              <span className="text-slate-400 text-xs">Reset</span>
            </button>

            {/* Log Out */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors text-xs font-semibold min-h-[44px]"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2">
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6"
            noValidate
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Edit Profile Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Controlled form updates stored in local session state
                </p>
              </div>
              {isSaved && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label
                  htmlFor={firstNameId}
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  First Name *
                </label>
                <input
                  id={firstNameId}
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 min-h-[44px] transition-all ${
                    errors.firstName
                      ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                      : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 font-medium">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor={lastNameId}
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Last Name *
                </label>
                <input
                  id={lastNameId}
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 min-h-[44px] transition-all ${
                    errors.lastName
                      ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                      : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 font-medium">
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label
                  htmlFor={emailId}
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id={emailId}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 min-h-[44px] transition-all ${
                      errors.email
                        ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                        : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="sm:col-span-2">
                <label
                  htmlFor={phoneId}
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id={phoneId}
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+995 555 123 456"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 min-h-[44px] transition-all ${
                      errors.phone
                        ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                        : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 font-medium">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
