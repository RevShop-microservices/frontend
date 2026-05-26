import API from "./axiosConfig.js";

export const getReviews = (productId) => API.get(`/reviews/${productId}`);
export const getRating = (productId) => API.get(`/reviews/${productId}/rating`);
export const addReview = (data) => API.post("/reviews", data);
export const deleteReview = (data) => API.delete("/reviews", { data });
