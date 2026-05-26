import API from "./axiosConfig.js";

export const getAllUsers = () => API.get("/admin/users");
export const getAllSellers = () => API.get("/admin/sellers");
export const blockUser = (userId) => API.put(`/admin/users/${userId}/block`);
export const unblockUser = (userId) => API.put(`/admin/users/${userId}/unblock`);
export const getPlatformStats = () => API.get("/admin/stats");
