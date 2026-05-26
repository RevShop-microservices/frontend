import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Store, ChevronDown } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  const handleLogout = () => { logout(); navigate("/"); setMobileOpen(false); setDropdownOpen(false); };
  const isActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    if (user?.role === "ADMIN") return "/admin/dashboard";
    if (user?.role === "SELLER") return "/seller/dashboard";
    return "/customer/dashboard";
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isCustomer = user?.role === "CUSTOMER" || !user?.role;
  const navLinks = [
    { path: "/", label: "Home" },
    ...(isCustomer ? [{ path: "/cart", label: "Cart" }, { path: "/orders", label: "Orders" }, { path: "/wishlist", label: "Wishlist" }, { path: "/compare", label: "⚖️ Compare" }] : []),
  ].filter(Boolean);

  const roleColor = { CUSTOMER: "bg-green-50 text-green-700 border-green-200", SELLER: "bg-blue-50 text-blue-700 border-blue-200", ADMIN: "bg-purple-50 text-purple-700 border-purple-200" };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
            <Store size={16} className="text-white" />
          </div>
          <span className="text-gray-900 font-bold text-lg tracking-tight">NexShop</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ path, label }) => (
            <Link key={path} to={path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(path) ? "bg-green-50 text-green-700 font-semibold" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          {isCustomer && isAuthenticated && (
            <Link to="/cart" className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-green-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated && <NotificationBell />}
          {isAuthenticated ? (
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all">
                <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-white" />
                </div>
                <span className="text-gray-700 text-sm max-w-[110px] truncate hidden lg:block">{user?.email}</span>
                {user?.role && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold hidden lg:block ${roleColor[user.role] || roleColor.CUSTOMER}`}>{user.role}</span>
                )}
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                  <Link to={getDashboardPath()} onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <LayoutDashboard size={15} className="text-gray-400" /> Dashboard
                  </Link>
                  {isCustomer && (
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <User size={15} className="text-gray-400" /> Profile
                    </Link>
                  )}
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
              <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          {isCustomer && isAuthenticated && (
            <Link to="/cart" className="relative p-2 text-gray-500">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-green-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          )}
          <button className="p-2 text-gray-500 hover:text-gray-900" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 flex flex-col gap-0.5">
          {navLinks.map(({ path, label }) => (
            <Link key={path} to={path} onClick={() => setMobileOpen(false)}
              className={`py-2.5 px-3 rounded-lg text-sm font-medium ${isActive(path) ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"
                }`}>{label}</Link>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center">
                    <User size={13} className="text-white" />
                  </div>
                  <span className="text-gray-700 text-sm truncate">{user?.email}</span>
                </div>
                <Link to={getDashboardPath()} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2.5 px-3 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                {isCustomer && (
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2.5 px-3 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
                    <User size={15} /> Profile
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2 py-2.5 px-3 text-red-500 text-sm w-full text-left rounded-lg hover:bg-red-50">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-green-600 font-semibold text-sm rounded-lg hover:bg-green-50">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
