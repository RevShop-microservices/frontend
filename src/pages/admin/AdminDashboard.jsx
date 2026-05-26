import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Package, ShoppingBag, TrendingUp, Bell, Shield, BarChart3, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../../api/axiosConfig";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../../components/Loader";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for display (real admin APIs would feed these)
  const [stats] = useState([
    { label: "Total Users", value: "1,240", icon: Users, color: "green" },
    { label: "Active Sellers", value: "87", icon: Shield, color: "blue" },
    { label: "Total Products", value: "3,456", icon: Package, color: "emerald" },
    { label: "Total Orders", value: "9,872", icon: ShoppingBag, color: "amber" },
  ]);

  const [notifications] = useState([
    { id: 1, message: "New seller registration: seller@example.com", type: "seller", time: "5 min ago" },
    { id: 2, message: "High traffic alert: 500 concurrent users", type: "alert", time: "15 min ago" },
    { id: 3, message: "New report submitted by customer", type: "report", time: "1 hr ago" },
  ]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "ADMIN") { navigate("/"); return; }
  }, [user]);

  const colorMap = {
    green: "bg-green-50 border-green-200 text-green-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    emerald: "bg-teal-50 border-teal-200 text-teal-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };

  const tabs = ["overview", "users", "analytics", "notifications"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Platform overview and management</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
            <Shield size={16} className="text-green-700" />
            <span className="text-green-700 text-sm font-semibold">Admin</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-900"
                }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${colorMap[stat.color]}`}>
                      <stat.icon size={16} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Revenue chart placeholder */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-green-600" /> Revenue Overview
              </h2>
              <div className="flex items-end gap-3 h-32">
                {[65, 80, 50, 90, 75, 95, 70, 85, 60, 88, 72, 94].map((h, i) => (
                  <div key={i} className="flex-1 bg-green-100 rounded-t-lg hover:bg-green-200 transition-colors" style={{ height: `${h}%` }}
                    title={`Month ${i + 1}`} />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">User Management</h2>
              <p className="text-gray-400 text-sm mt-1">View and manage all platform users</p>
            </div>
            <div className="p-8 text-center">
              <Users size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Connect to user management API</p>
              <p className="text-gray-400 text-sm mt-1">User listing requires admin API endpoints</p>
            </div>
          </div>
        )}

        {/* Analytics tab */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-8 flex items-center gap-5 shadow-sm">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${colorMap[stat.color]}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notifications tab */}
        {activeTab === "notifications" && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {notifications.map(n => (
              <div key={n.id} className="flex items-start gap-4 p-5 border-b border-gray-100 hover:bg-gray-50 last:border-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === "seller" ? "bg-blue-50 text-blue-600" :
                  n.type === "alert" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"
                  }`}>
                  {n.type === "seller" ? <Shield size={15} /> : n.type === "alert" ? <TrendingUp size={15} /> : <AlertCircle size={15} />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 text-sm">{n.message}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
