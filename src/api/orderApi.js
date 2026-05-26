import API from "./axiosConfig.js";

export const placeOrder = (data) => API.post("/orders/checkout", data);
export const buyNow = (data) => API.post("/orders/buy-now", data);
export const getOrdersByUser = (userId) => API.get("/orders/user", { params: { userId } });
export const getOrderDetails = (orderId) => API.get(`/orders/${orderId}`);
export const cancelOrder = (orderId) => API.put(`/orders/${orderId}/cancel`);
export const cancelOrderItem = (orderId, itemId) =>
  API.put(`/orders/${orderId}/cancel-item`, null, {
    params: { itemId },
  });
export const checkPurchase = (productId, userId) =>
  API.get("/orders/check-purchase", { params: { productId, userId } });
