import API from "./axiosConfig.js";

/**
 * Send a natural language query to the AI assistant.
 * Returns AIResponseDTO: { intent, message, products, compareResult, llmSummary }
 */
export const aiQuery = (userId, query) =>
  API.post(`/ai/query?userId=${userId}`, query, {
    headers: { "Content-Type": "text/plain" },
  });

/** Check AI service health */
export const aiHealth = () => API.get("/ai/health");
