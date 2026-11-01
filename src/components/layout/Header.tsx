import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, ShoppingCart, Sun, Moon, User, Package, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.tsx";
import { useCart } from "../../context/CartContext.tsx";
import { useTheme } from "../../context/ThemeContext.tsx";

export function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 font-semibold"
        : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 dark:text-white min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
            aria-label="10X Shop home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span>
              10X <span className="text-indigo-600 dark:text-indigo-400">Shop</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            <NavLink to="/" end className={navLinkClass}>
              Catalog
            </NavLink>

            {isLoggedIn && (
              <NavLink to="/orders" className={navLinkClass}>
                <Package className="w-4 h-4 mr-1.5 inline" />
                Orders
              </NavLink>
            )}

            {isLoggedIn && (
              <NavLink to="/profile" className={navLinkClass}>
                <User className="w-4 h-4 mr-1.5 inline" />
                Profile
              </NavLink>
            )}
          </nav>

          {/* Right Action Icons (Cart, Theme, Auth) */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>

            {/* Cart Link with Badge */}
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `relative p-2.5 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-bold text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center border-2 border-white dark:border-slate-900 animate-in zoom-in-50">
                  {itemCount}
                </span>
              )}
            </NavLink>

            {/* Desktop Auth Controls */}
            <div className="hidden md:flex items-center gap-2 ml-1">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 min-h-[40px]"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{user.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Log out"
                    aria-label="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-xs min-h-[44px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  Log In
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={navLinkClass}
          >
            Catalog
          </NavLink>
          {isLoggedIn ? (
            <>
              <NavLink
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                <Package className="w-4 h-4 mr-2 inline" />
                Orders
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                <User className="w-4 h-4 mr-2 inline" />
                Profile ({user.username})
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 min-h-[44px]"
            >
              Log In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
