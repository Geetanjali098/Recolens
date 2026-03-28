/**
 * api.js
 * ------
 * Axios instance pre-configured with the backend base URL.
 * All API calls go through this file.
 */

import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://ecolens-geetanjali0984188-mi9kr0sw.leapcell.dev";

    // Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ---------- Products ----------

/** Fetch all products, optional category filter */
export const fetchProducts = (category = null) => {
  const params = category ? { category } : {}
  return api.get('/products', { params })
}

/** Fetch product categories */
export const fetchCategories = () => api.get('/categories')

// ---------- Recommendations ----------

/**
 * Get hybrid recommendations for a user + product.
 * @param {number} userId
 * @param {number} productId
 * @param {number} topN
 */
export const fetchRecommendations = (userId, productId, topN = 5) =>
  api.get('/recommend', {
    params: { user_id: userId, product_id: productId, top_n: topN },
  })

// ---------- Trending ----------

export const fetchTrending = (topN = 6) =>
  api.get('/trending', { params: { top_n: topN } })

export default api
