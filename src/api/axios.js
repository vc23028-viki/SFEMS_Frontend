// src/api/axios.js
import axios from "axios";

// Dynamically determine API URL
const API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:5000/api"                // Local dev
  : "https://sfems-backend.onrender.com/api"; // Production (Render backend)

console.log(`🔗 Using API: ${API_URL}`);

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// Attach token to all requests if it exists
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for debugging and errors
api.interceptors.response.use(
  response => {
    console.log("✅ API Response:", response.config.url, response.data);
    return response;
  },
  error => {
    if (error.response) {
      console.error(`❌ API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error("❌ No response from server:", error.request);
      return Promise.reject(
        new Error("No response from server. Check if backend is running and CORS is configured.")
      );
    } else {
      console.error("❌ Axios Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
