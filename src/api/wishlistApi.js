import API from "./axiosConfig.js";

export const getWishlist = (userId) => API.get("/wishlist", { params: { userId } });
export const addToWishlist = (data) => API.post("/wishlist/add", data);
export const removeFromWishlist = (data) => API.delete("/wishlist/remove", { data });
export const moveToCart = (data) => API.post("/wishlist/move-to-cart", data);
