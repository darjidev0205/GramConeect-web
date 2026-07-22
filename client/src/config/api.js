import api, { API_BASE_URL as SERVICE_API_BASE_URL, getErrorMessage } from "../services/api";

const API_BASE_URL = SERVICE_API_BASE_URL;

export async function apiFetch(endpoint, options = {}) {
  try {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const method = (options.method || "GET").toLowerCase();
    
    let headers = options.headers || {};
    if (headers instanceof Headers) {
      const obj = {};
      headers.forEach((val, key) => { obj[key] = val; });
      headers = obj;
    }

    const config = {
      method,
      url,
      headers,
      data: options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : undefined,
    };

    const response = await api(config);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export default API_BASE_URL;
