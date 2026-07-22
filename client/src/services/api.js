import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(
        "API request:",
        config.method?.toUpperCase(),
        `${config.baseURL || ""}${config.url}`
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error("API error:", {
        message: error.message,
        code: error.code,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);

/**
 * Transforms API error objects into user-friendly error messages.
 * Prevents raw "Failed to fetch" or uncaught exceptions on mobile browsers.
 */
export const getErrorMessage = (error, defaultMsg = "An error occurred.") => {
  if (error?.code === "ECONNABORTED") {
    return "The server took too long to respond. (Render free tier may be waking up, ~30s)";
  }

  if (!error?.response) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return "No internet connection. Please check your network and try again.";
    }
    return "Unable to connect to the server. Check your internet connection and try again.";
  }

  const status = error.response.status;

  if (status === 400) {
    return error.response.data?.message || "Invalid request. Please check your inputs.";
  }
  if (status === 401) {
    return error.response.data?.message || "Authentication failed. Please sign in again.";
  }
  if (status === 403) {
    return error.response.data?.message || "Access denied. You do not have permission.";
  }
  if (status === 404) {
    return error.response.data?.message || "Requested endpoint or resource was not found.";
  }
  if (status === 429) {
    return error.response.data?.message || "Too many requests. Please wait a minute before retrying.";
  }
  if (status >= 500) {
    return error.response.data?.message || "Internal server error. Please try again later.";
  }

  return error.response.data?.message || defaultMsg;
};

/**
 * Temporary frontend diagnostic helper function to verify backend connectivity.
 */
export const testBackendConnection = async () => {
  const start = Date.now();

  try {
    const response = await api.get("/");

    console.log("Backend diagnostic:", {
      apiBaseURL: API_BASE_URL,
      status: response.status,
      data: response.data,
      elapsedMs: Date.now() - start,
    });

    return response.data;
  } catch (error) {
    console.error("Backend diagnostic failed:", {
      apiBaseURL: API_BASE_URL,
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      elapsedMs: Date.now() - start,
    });

    throw error;
  }
};

export { API_BASE_URL };
export default api;
