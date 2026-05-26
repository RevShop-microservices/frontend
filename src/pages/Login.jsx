import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Store, ShieldCheck } from "lucide-react";
import { loginUser } from "../api/authApi";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axiosConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser({ email, password });

      // Check if 2FA is required (202 status or requiresOtp flag)
      const data = res.data?.data;
      if (data && typeof data === "object" && data.requiresOtp) {
        setOtpStep(true);
        setOtpEmail(data.email || email);
        toast.success("OTP sent to your email!");
        return;
      }

      const token = res.data?.token || res.data?.data;
      const userInfo = login(token);
      toast.success("Welcome back!");
      const role = userInfo?.role;
      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "SELLER") navigate("/seller/dashboard");
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", { email: otpEmail, otp });
      const token = res.data?.token || res.data?.data;
      const userInfo = login(token);
      toast.success("Welcome back!");
      const role = userInfo?.role;
      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "SELLER") navigate("/seller/dashboard");
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification Screen
  if (otpStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                <ShieldCheck size={22} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Two-Factor Authentication</h1>
            <p className="text-gray-400 text-sm text-center mb-8">
              Enter the 6-digit code sent to <span className="font-semibold text-gray-600">{otpEmail}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div>
                <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">OTP Code</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required
                  placeholder="000000" maxLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm text-center tracking-[0.5em] text-xl font-bold" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all mt-2">
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
            </form>

            <button onClick={() => { setOtpStep(false); setOtp(""); }}
              className="w-full text-center text-gray-400 text-sm mt-6 hover:text-gray-600">
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
              <Store size={22} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm text-center mb-8">Sign in to your NexShop account</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm" />
            </div>
            <div>
              <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-xs font-medium text-green-600 hover:text-green-500">
                  Forgot password?
                </Link>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            No account?{" "}
            <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
