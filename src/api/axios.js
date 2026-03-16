import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 300000,
  withCredentials: true,                  
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ── Request interceptor ─────────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor ────────────────────────────────── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status    = error.response?.status;
    const path      = window.location.pathname;
    const isAuthPage = path.includes("/login") || path.includes("/register");

    if (status === 401 && !isAuthPage) {
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/login";
    }

    if (status === 403) {
      console.warn("CORS or permission error – check server CORS config.");
    }

    if (!error.response) {
      console.error("Network / CORS error – no response received:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;