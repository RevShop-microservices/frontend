import { useState } from "react";
import { Bell, X, CheckCircle, Package, AlertTriangle } from "lucide-react";

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "order", title: "Order Placed", message: "Your order #1024 has been placed", time: "2 min ago", read: false },
  { id: 2, type: "delivery", title: "Out for Delivery", message: "Order #1020 is out for delivery", time: "1 hr ago", read: false },
  { id: 3, type: "delivered", title: "Order Delivered", message: "Order #1018 was delivered", time: "Yesterday", read: true },
];

const iconMap = {
  order: { Icon: Package, bg: "bg-green-50 text-green-600" },
  delivery: { Icon: Package, bg: "bg-blue-50 text-blue-600" },
  delivered: { Icon: CheckCircle, bg: "bg-teal-50 text-teal-600" },
  alert: { Icon: AlertTriangle, bg: "bg-amber-50 text-amber-600" },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-green-600 hover:text-green-700 font-medium">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">No notifications</div>
              ) : notifications.map(n => {
                const { Icon, bg } = iconMap[n.type] || iconMap.order;
                return (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.read ? "bg-green-50/30" : ""}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-xs font-semibold">{n.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-gray-400 text-[10px] mt-1">{n.time}</p>
                    </div>
                    <button onClick={() => dismiss(n.id)} className="text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5">
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
