import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ChevronDown, ChevronUp, X, ArrowRight, RotateCcw, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { getOrdersByUser, cancelOrder } from "../api/orderApi";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import API from "../api/axiosConfig";

const STATUS_COLORS = {
  PLACED: "text-blue-600 bg-blue-50 border-blue-200",
  CONFIRMED: "text-blue-600 bg-blue-50 border-blue-200",
  SHIPPED: "text-indigo-600 bg-indigo-50 border-indigo-200",
  DELIVERED: "text-green-600 bg-green-50 border-green-200",
  CANCELLED: "text-red-500 bg-red-50 border-red-200",
  RETURN_REQUESTED: "text-amber-600 bg-amber-50 border-amber-200",
  RETURN_APPROVED: "text-teal-600 bg-teal-50 border-teal-200",
  RETURN_DENIED: "text-red-600 bg-red-50 border-red-200",
  REFUNDED: "text-purple-600 bg-purple-50 border-purple-200",
};

export default function Orders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!user.userId) {
      setError("Session incomplete. Please log out and log back in.");
      setLoading(false);
      return;
    }

    getOrdersByUser(user.userId)
      .then((res) => setOrders(res.data || []))
      .catch((err) => {
        console.error("Orders fetch error:", err);
        toast.error("Failed to load orders");
        setError("Failed to load orders. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (orderId) => {
    try {
      await cancelOrder(orderId);
      toast.success("Order cancelled");
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: "CANCELLED" } : o
        )
      );
    } catch {
      toast.error("Cannot cancel this order");
    }
  };

  const handleReturn = async (orderId) => {
    if (!window.confirm("Are you sure you want to request a return?")) return;
    try {
      await API.post(`/orders/${orderId}/return?userId=${user.userId}`);
      toast.success("Return request submitted!");
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: "RETURN_REQUESTED" } : o
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot request return");
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    const toastId = toast.loading("Generating your invoice...");
    try {
      const response = await API.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Invoice download failed", err);
      toast.error("Failed to download invoice. Please try again.", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <X size={24} className="text-red-500" />
        </div>
        <p className="text-gray-700 font-semibold">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center">
            <Package size={18} className="text-green-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-400 text-sm mt-0.5">Track and manage your purchases</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-5">
              <Package size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-600 text-lg font-semibold mb-2">No orders yet</p>
            <p className="text-gray-400 text-sm mb-6">
              Start shopping and your orders will appear here
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Start Shopping <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:border-gray-300 transition-colors"
              >
                <div
                  className="flex items-center justify-between p-5 cursor-pointer"
                  onClick={() =>
                    setExpanded(expanded === order.orderId ? null : order.orderId)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                      <Package size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">
                        Order #{order.orderId}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {order.items?.length || 0} item(s) ·{" "}
                        <span className="text-green-600 font-semibold">
                          ₹{order.totalAmount?.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status] || STATUS_COLORS.PLACED
                        }`}
                    >
                      {order.status}
                    </span>
                    {expanded === order.orderId ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {expanded === order.orderId && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                    <div className="flex flex-col gap-1 mb-4">
                      {order.items?.map((item, i) => (
                        <div
                          key={i}
                          className={`flex justify-between py-2.5 text-sm border-b border-gray-50 last:border-0 ${item.cancelled ? "opacity-50" : ""
                            }`}
                        >
                          <span className="text-gray-700">
                            {item.productName}
                            {item.cancelled && (
                              <span className="text-red-400 text-xs ml-1">
                                (Cancelled)
                              </span>
                            )}
                          </span>
                          <span className="text-gray-400">
                            x{item.quantity} ·{" "}
                            <span className="text-green-600 font-semibold">
                              ₹{item.price?.toLocaleString()}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2.5 mt-4">
                      <button
                        onClick={() => handleDownloadInvoice(order.orderId)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm hover:bg-green-100 transition-all font-semibold"
                      >
                        <Download size={14} /> Download Invoice
                      </button>

                      {(order.status === "PLACED" || order.status === "CONFIRMED") && (
                        <button
                          onClick={() => handleCancel(order.orderId)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 border border-red-200 rounded-xl text-sm hover:bg-red-100 transition-all"
                        >
                          <X size={14} /> Cancel Order
                        </button>
                      )}

                      {order.status === "DELIVERED" && (
                        <button
                          onClick={() => handleReturn(order.orderId)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl text-sm hover:bg-amber-100 transition-all"
                        >
                          <RotateCcw size={14} /> Request Return
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}