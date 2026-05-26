import API from "./axiosConfig.js";

export const getCart = (userId) => API.get("/cart", { params: { userId } });
export const addToCartAPI = (userId, data) => API.post(`/cart/add?userId=${userId}`, data);
export const updateCartAPI = (userId, data) => API.put(`/cart/update?userId=${userId}`, data);
export const removeFromCartAPI = (userId, productId) =>
  API.delete("/cart/remove", { params: { userId, productId } });
export const clearCartAPI = (userId) => API.delete("/cart/clear", { params: { userId } });
