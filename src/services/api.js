import axios from "axios";

// Thin Axios client for the Express API in /server. Not wired into the
// contexts yet — AuthContext, CartContext, etc. still run on mock data /
// localStorage so the app keeps working with zero setup, exactly as
// documented in server/README.md ("Connecting the frontend"). This file
// exists so that swap is a drop-in change later: point VITE_API_URL at a
// running server (mock-data mode needs no database) and start replacing
// the TODOs in each context one at a time with the matching call below.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("restostack_auth");
    const token = raw ? JSON.parse(raw).token : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    /* ignore corrupt storage */
  }
  return config;
});

// --- Auth ------------------------------------------------------------
export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }).then((r) => r.data),
  signup: (payload) => api.post("/auth/signup", payload).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  updateMe: (updates) => api.patch("/auth/me", updates).then((r) => r.data),
};

// --- Restaurants -------------------------------------------------------
export const restaurantsApi = {
  list: (params) => api.get("/restaurants", { params }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/restaurants/${slug}`).then((r) => r.data),
};

// --- Menu --------------------------------------------------------------
export const menuApi = {
  getByRestaurantId: (restaurantId, params) =>
    api.get(`/menu/${restaurantId}`, { params }).then((r) => r.data),
  getDish: (dishId) => api.get(`/menu/dish/${dishId}`).then((r) => r.data),
};

// --- Search --------------------------------------------------------------
export const searchApi = {
  search: (q, city) => api.get("/search", { params: { q, city } }).then((r) => r.data),
};

// --- Reviews -------------------------------------------------------------
export const reviewsApi = {
  listForRestaurant: (restaurantId) => api.get(`/reviews/restaurant/${restaurantId}`).then((r) => r.data),
  submitForRestaurant: (restaurantId, payload) =>
    api.post(`/reviews/restaurant/${restaurantId}`, payload).then((r) => r.data),
  listForDish: (dishId) => api.get(`/reviews/dish/${dishId}`).then((r) => r.data),
  submitForDish: (dishId, payload) => api.post(`/reviews/dish/${dishId}`, payload).then((r) => r.data),
};

// --- Cart ------------------------------------------------------------------
export const cartApi = {
  get: () => api.get("/cart").then((r) => r.data),
  addItem: (dishId, qty = 1) => api.post("/cart/items", { dishId, qty }).then((r) => r.data),
  setQty: (dishId, qty) => api.patch(`/cart/items/${dishId}`, { qty }).then((r) => r.data),
  removeItem: (dishId) => api.delete(`/cart/items/${dishId}`).then((r) => r.data),
  clear: () => api.delete("/cart").then((r) => r.data),
};

export default api;
