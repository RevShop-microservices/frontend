import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Package, ShoppingBag, DollarSign, TrendingUp, Plus, Pencil, Trash2, Bell, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../../api/axiosConfig";
import { deleteProduct } from "../../api/productApi";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import AddProductModal from "../../components/seller/AddProductModal";

export default function SellerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New order received for your product", type: "order", time: "2 min ago" },
    { id: 2, message: "Low stock alert: Item has only 3 units left", type: "stock", time: "1 hr ago" },
  ]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "SELLER") { navigate("/"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const sellerId = user?.userId || 1;
      const [analyticsRes, productsRes] = await Promise.allSettled([
        API.get(`/seller/analytics?sellerId=${sellerId}`),
        API.get(`/products/search?page=0&size=50`),
      ]);
      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value.data);
      if (productsRes.status === "fulfilled") {
        const d = productsRes.value.data;
        const all = d?.products || d?.content || [];
        setProducts(all.filter(p => !p.sellerId || p.sellerId === user?.userId));
      }
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id, user?.userId);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader /></div>;

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);

  const stats = [
    { label: "Total Products", value: analytics?.totalProducts ?? products.length, icon: Package, color: "green" },
    { label: "Total Orders", value: analytics?.totalOrders ?? 0, icon: ShoppingBag, color: "blue" },
    { label: "Revenue", value: `₹${(analytics?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "emerald" },
    { label: "Units Sold", value: analytics?.totalUnitsSold ?? 0, icon: TrendingUp, color: "amber" },
  ];

  const colorMap = {
    green: "bg-green-50 border-green-200 text-green-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    emerald: "bg-teal-50 border-teal-200 text-teal-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };

  const tabs = ["overview", "products", "analytics", "notifications"];

  return (
    <div className="min-h-screen bg-gray-50">
      {showAddModal && (
        <AddProductModal user={user} onClose={() => setShowAddModal(false)} onAdded={() => { setShowAddModal(false); loadData(); }} />
      )}

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {lowStockProducts.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-semibold">
                <AlertTriangle size={14} /> {lowStockProducts.length} low stock
              </div>
            )}
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all text-sm">
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap ${activeTab === tab ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-900"
                }`}>
              {tab}{tab === "notifications" && notifications.length > 0 && (
                <span className="ml-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs inline-flex items-center justify-center">{notifications.length}</span>
              )}
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

            {/* Low stock */}
            {lowStockProducts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
                <h3 className="text-amber-800 font-bold mb-3 flex items-center gap-2"><AlertTriangle size={16} /> Low Stock Alerts</h3>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.map(p => (
                    <span key={p.id} className="px-3 py-1 bg-white border border-amber-300 text-amber-700 text-xs font-semibold rounded-lg">
                      {p.name} ({p.stock} left)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analytics?.topSellingProducts?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <BarChart3 size={18} className="text-green-600" /> Top Selling Products
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 text-gray-400 font-semibold">Product</th>
                        <th className="text-right py-3 text-gray-400 font-semibold">Units Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topSellingProducts.map((p, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 text-gray-700">{p[1]}</td>
                          <td className="py-3 text-right text-green-600 font-bold">{p[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Products tab */}
        {activeTab === "products" && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <Package size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No products yet</p>
                <button onClick={() => setShowAddModal(true)} className="mt-4 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold">Add your first product</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-gray-400 font-semibold">Product</th>
                      <th className="text-left px-6 py-4 text-gray-400 font-semibold">Category</th>
                      <th className="text-right px-6 py-4 text-gray-400 font-semibold">Price</th>
                      <th className="text-right px-6 py-4 text-gray-400 font-semibold">Stock</th>
                      <th className="text-right px-6 py-4 text-gray-400 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900 font-semibold">{p.name}</td>
                        <td className="px-6 py-4 text-gray-400">{p.category}</td>
                        <td className="px-6 py-4 text-right text-gray-900 font-medium">₹{p.price?.toLocaleString()}</td>
                        <td className={`px-6 py-4 text-right font-semibold ${p.stock > 5 ? "text-green-600" : p.stock > 0 ? "text-amber-500" : "text-red-500"}`}>{p.stock}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(n => (
                  <div key={n.id} className="flex items-start gap-4 p-5 hover:bg-gray-50">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === "order" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                      {n.type === "order" ? <ShoppingBag size={16} /> : <AlertTriangle size={16} />}
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
        )}
      </div>
    </div>
  );
}
