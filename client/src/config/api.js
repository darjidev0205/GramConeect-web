/**
 * Centralized API Configuration for GramConnect Frontend
 * 
 * This module provides a single source of truth for the backend API base URL.
 * All frontend API calls must import API_BASE_URL from this file.
 * 
 * Environment variable strategy:
 *   VITE_API_URL = https://gramconnect-4hoh.onrender.com  (no trailing /api)
 *   Frontend endpoints are constructed as: `${API_BASE_URL}/api/...`
 * 
 * Local development fallback: http://localhost:5000
 */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

// Temporary debug log — remove after confirming deployment works
console.log("Configured API URL:", import.meta.env.VITE_API_URL);

/**
 * Helper to perform API requests with improved error handling.
 * Wraps fetch with:
 *   - Automatic JSON parsing
 *   - Meaningful error messages for common failure modes
 *   - Authorization header injection when token is provided
 * 
 * @param {string} endpoint - API path starting with / (e.g. "/api/auth/login")
 * @param {object} options - fetch options (method, headers, body, etc.)
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Inject Authorization header if token exists and not already set
  const token = localStorage.getItem("token");
  if (token && !options.headers?.["Authorization"]) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, options);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("API request failed:", { url, error });

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. The backend may be waking up (Render free tier can take ~30s) or the API configuration may be incorrect."
      );
    }

    throw error;
  }
}

export default API_BASE_URL;
