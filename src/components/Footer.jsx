import { Link } from "react-router-dom";
import { Store, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                <Store size={14} className="text-white" />
              </div>
              <span className="text-gray-900 font-bold text-lg">NexShop</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              An AI-powered ecommerce platform built for intelligent, seamless shopping experiences.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Shop</p>
            <div className="flex flex-col gap-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/cart", label: "Cart" },
                { to: "/orders", label: "Orders" },
                { to: "/wishlist", label: "Wishlist" },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-gray-500 hover:text-green-600 text-sm transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Account</p>
            <div className="flex flex-col gap-2.5">
              {[
                { to: "/login", label: "Sign In" },
                { to: "/register", label: "Register" },
                { to: "/profile", label: "Profile" },
                { to: "/dashboard", label: "Dashboard" },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-gray-500 hover:text-green-600 text-sm transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Sell */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Sellers</p>
            <div className="flex flex-col gap-2.5">
              {[
                { to: "/seller/dashboard", label: "Seller Dashboard" },
                { to: "/register", label: "Become a Seller" },
              ].map(({ to, label }) => (
                <Link key={label} to={to} className="text-gray-500 hover:text-green-600 text-sm transition-colors">{label}</Link>
              ))}
              <a href="http://localhost:8081/swagger-ui/index.html" target="_blank" rel="noopener noreferrer"
                className="text-gray-500 hover:text-green-600 text-sm transition-colors">API Docs</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-xs">© {new Date().getFullYear()} NexShop. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-xs">Built with React + Spring Boot</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
