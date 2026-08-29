import axios from "axios";

// All API calls go through Next.js proxy at /api/*
// Next.js rewrites /api/* → EB backend (server-to-server, no CORS)
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://dfoclothing.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


// Attach JWT token from localStorage as Bearer token on every request
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && token !== "undefined" && token !== "null" && token !== "http-only-cookie") {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user-storage");
      }
    }
    return Promise.reject(error);
  }
);

export { api };
