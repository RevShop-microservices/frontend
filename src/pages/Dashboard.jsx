import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role === "ADMIN") navigate("/admin/dashboard", { replace: true });
    else if (user.role === "SELLER") navigate("/seller/dashboard", { replace: true });
    else navigate("/customer/dashboard", { replace: true });
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader text="Redirecting to your dashboard..." />
    </div>
  );
}
