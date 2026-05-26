import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, User, Store, ShoppingBag, Shield, CheckCircle, XCircle } from "lucide-react";
import { registerUser } from "../api/authApi";

const ROLES = [
  { value: "CUSTOMER", label: "Customer", icon: ShoppingBag, desc: "Shop and track orders" },
  { value: "SELLER", label: "Seller", icon: Store, desc: "List and sell products" },
  { value: "ADMIN", label: "Admin", icon: Shield, desc: "Manage the platform" },
];

const RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "One number (0-9)", test: (p) => /[0-9]/.test(p) },
  { label: "One special character (!@#$...)", test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function getStrength(password) {
  const passed = RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return { level: 0, label: "Very Weak", color: "bg-red-500" };
  if (passed === 2) return { level: 1, label: "Weak", color: "bg-orange-500" };
  if (passed === 3) return { level: 2, label: "Fair", color: "bg-yellow-500" };
  if (passed === 4) return { level: 3, label: "Strong", color: "bg-blue-500" };
  return { level: 4, label: "Very Strong", color: "bg-green-600" };
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();

  const allRulesPassed = RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword;
  const strength = getStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!allRulesPassed) {
      toast.error("Password does not meet all requirements");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ name, email, password, role });
      toast.success("Account created! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
              <User size={22} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Create account</h1>
          <p className="text-gray-400 text-sm text-center mb-8">Join NexShop today</p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">

            {/* Role Selector */}
            <div>
              <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-semibold ${role === value
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {ROLES.find((r) => r.value === role)?.desc}
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setTouched(true); }}
                  required
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition-all text-sm ${touched && !allRulesPassed && password.length > 0
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength Bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength.level ? strength.color : "bg-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${strength.level <= 1 ? "text-red-500" :
                    strength.level === 2 ? "text-yellow-600" :
                      strength.level === 3 ? "text-blue-600" : "text-green-600"
                    }`}>
                    {strength.label}
                  </p>
                </div>
              )}

              {/* Rules checklist */}
              {(touched && password.length > 0) && (
                <ul className="mt-2 flex flex-col gap-1">
                  {RULES.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${passed ? "text-green-600" : "text-red-500"}`}>
                        {passed
                          ? <CheckCircle size={12} className="flex-shrink-0" />
                          : <XCircle size={12} className="flex-shrink-0" />
                        }
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition-all text-sm ${confirmPassword.length > 0 && !passwordsMatch
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : confirmPassword.length > 0 && passwordsMatch
                      ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                      : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`text-xs mt-1 font-medium ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                  {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}