import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, Heart, Package, User, ArrowRight, Bell, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { getOrdersByUser } from "../../api/orderApi";
import Loader from "../../components/Loader";

const STATUS_COLORS = {
  PLACED: "text-blue-600 bg-blue-50 border-blue-200",
  CONFIRMED: "text-blue-600 bg-blue-50 border-blue-200",
  SHIPPED: "text-indigo-600 bg-indigo-50 border-indigo-200",
  DELIVERED: "text-green-600 bg-green-50 border-green-200",
  CANCELLED: "text-red-500 bg-red-50 border-red-200",
};

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.userId) {
      getOrdersByUser(user.userId)
        .then(res => setOrders(res.data || []))
        .catch(() => { })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const totalSpent = orders.reduce((sum, o) => o.status !== "CANCELLED" ? sum + (o.totalAmount || 0) : sum, 0);
  const delivered = orders.filter(o => o.status === "DELIVERED").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center flex-shrink-0">
            <User size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "green" },
            { label: "Delivered", value: delivered, icon: Package, color: "blue" },
            { label: "Total Spent", value: `₹${totalSpent.toLocaleString()}`, icon: TrendingUp, color: "emerald" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 text-xs font-medium">{label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${color === "green" ? "bg-green-50 border-green-200 text-green-700" :
                  color === "blue" ? "bg-blue-50 border-blue-200 text-blue-700" :
                    "bg-teal-50 border-teal-200 text-teal-700"
                  }`}><Icon size={15} /></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: ShoppingBag, label: "My Orders", desc: "Track your purchases", to: "/orders", color: "green" },
            { icon: Heart, label: "Wishlist", desc: "Saved products", to: "/wishlist", color: "red" },
            { icon: Package, label: "Shop Now", desc: "Browse products", to: "/", color: "blue" },
          ].map(({ icon: Icon, label, desc, to, color }) => (
            <Link key={to} to={to}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${color === "green" ? "bg-green-50 border-green-200 text-green-700" :
                color === "red" ? "bg-red-50 border-red-200 text-red-500" :
                  "bg-blue-50 border-blue-200 text-blue-700"
                }`}><Icon size={20} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-semibold text-sm">{label}</p>
                <p className="text-gray-400 text-xs">{desc}</p>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-green-600 text-sm font-medium hover:text-green-700">View all</Link>
          </div>
          {loading ? (
            <div className="py-8"><Loader text="Loading orders..." /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No orders yet</p>
              <Link to="/" className="inline-flex mt-3 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl">Start Shopping</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.slice(0, 5).map(order => (
                <div key={order.orderId} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                      <Package size={15} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-semibold text-sm">Order #{order.orderId}</p>
                      <p className="text-gray-400 text-xs">{order.items?.length || 0} item(s) · ₹{order.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status] || STATUS_COLORS.PLACED}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
