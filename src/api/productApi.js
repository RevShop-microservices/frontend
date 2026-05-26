import API from "./axiosConfig.js";

export const getProducts = (params = {}) => API.get("/products/search", { params });
export const getProductById = (id, userId) => {
  const params = {};
  if (userId) params.userId = userId;
  return API.get(`/products/${id}`, { params });
};
export const createProduct = (data, sellerId) =>
  API.post(`/products?sellerId=${sellerId}`, data);
export const updateProduct = (id, data, sellerId) =>
  API.put(`/products/${id}?sellerId=${sellerId}`, data);
export const deleteProduct = (id, sellerId) =>
  API.delete(`/products/${id}?sellerId=${sellerId}`);
