import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useContext } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

import { AuthContext } from "./context/AuthContext";
import AIChatBot from "./components/AIChatBot";


import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";

import ProductCompare from "./pages/ProductCompare";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import Profile from "./pages/customer/Profile";
import SellerDashboard from "./pages/seller/SellerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user?.userId) return;

    const wsUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace("/api", "/ws");
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        client.subscribe(`/user/${user.userId}/queue/notifications`, (message) => {
          if (message.body) {
            toast(message.body, { icon: "🔔" });
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [user]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            fontSize: "14px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          },
          success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />

      <Navbar />

      <Routes>
        {/* Fully public — no login needed */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/compare" element={<ProductCompare />} />

        {/* Protected — must be logged in */}
        <Route path="/cart" element={
          <ProtectedRoute><Cart /></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute><Checkout /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><Orders /></ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute><Wishlist /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        {/* Role-specific dashboards */}
        <Route path="/customer/dashboard" element={
          <ProtectedRoute requiredRoles={["CUSTOMER"]}><CustomerDashboard /></ProtectedRoute>
        } />
        <Route path="/seller/dashboard" element={
          <ProtectedRoute requiredRoles={["SELLER"]}><SellerDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>
        } />

        {/* Smart redirect based on role */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
      </Routes>

      <Footer />

      {/* AI Chatbot — always visible on every page */}
      <AIChatBot />
    </BrowserRouter>
  );
}

export default App;