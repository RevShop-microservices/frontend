import API from "./axiosConfig.js";

export const getSellerAnalytics = (sellerId) =>
  API.get("/seller/analytics", { params: { sellerId } });

export const getSellerOrders = (sellerId) =>
  API.get("/seller/orders", { params: { sellerId } });
