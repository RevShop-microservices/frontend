import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Edit3, Save, X, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/axiosConfig";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [is2fa, setIs2fa] = useState(false);
  const [toggling2fa, setToggling2fa] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  if (!user) { navigate("/login"); return null; }

  const handleSave = () => {
    toast.success("Profile updated!");
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center">
                <User size={28} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{form.name || user.email}</p>
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full font-semibold">{user.role}</span>
              </div>
            </div>
            <button onClick={() => editing ? handleSave() : setEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${editing ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
              {editing ? <><Save size={15} /> Save</> : <><Edit3 size={15} /> Edit</>}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Mail size={11} /> Email
              </label>
              <p className="text-gray-700 text-sm bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-200">{user.email}</p>
            </div>
            {[
              { key: "name", label: "Full Name", icon: User },
              { key: "phone", label: "Phone", icon: Phone },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Icon size={11} /> {label}
                </label>
                {editing ? (
                  <input value={form[key]} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
                ) : (
                  <p className="text-gray-700 text-sm bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-200">{form[key] || "—"}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <MapPin size={18} className="text-green-600" /> Saved Address
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "street", label: "Street", full: true },
              { key: "city", label: "City" },
              { key: "state", label: "State" },
              { key: "pincode", label: "PIN Code" },
            ].map(({ key, label, full }) => (
              <div key={key} className={full ? "sm:col-span-2" : ""}>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1.5">{label}</label>
                {editing ? (
                  <input value={form[key]} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
                ) : (
                  <p className="text-gray-700 text-sm bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-200">{form[key] || "—"}</p>
                )}
              </div>
            ))}
          </div>
          {editing && (
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold">Save Changes</button>
              <button onClick={() => setEditing(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold flex items-center gap-1.5"><X size={14} /> Cancel</button>
            </div>
          )}
        </div>

        {/* Security */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-5">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <ShieldCheck size={18} className="text-green-600" /> Security
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-semibold text-sm">Two-Factor Authentication (2FA)</p>
              <p className="text-gray-400 text-xs mt-0.5">Receive a one-time password via email when you login</p>
            </div>
            <button
              disabled={toggling2fa}
              onClick={async () => {
                setToggling2fa(true);
                try {
                  const newState = !is2fa;
                  await API.post("/auth/toggle-2fa", { userId: user.userId, enable: newState });
                  setIs2fa(newState);
                  toast.success(newState ? "2FA Enabled" : "2FA Disabled");
                } catch (err) {
                  toast.error("Failed to update 2FA");
                } finally {
                  setToggling2fa(false);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${is2fa ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${is2fa ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
