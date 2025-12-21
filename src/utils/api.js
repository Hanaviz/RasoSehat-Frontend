import axios from 'axios';

// Normalize base URL: ensure it includes the '/api' segment expected by backend
// Support multiple possible env var names to be resilient across builds/deploys
let rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BASE_URL || '';
// Also accept older CRA-style env var if present at build time
if (!rawBase && typeof process !== 'undefined' && process.env && process.env.REACT_APP_BACKEND_URL) {
  rawBase = process.env.REACT_APP_BACKEND_URL;
}
// Defensive: some misconfigurations accidentally prefix the value with the key name
if (typeof rawBase === 'string' && rawBase.match(/^VITE_API_BASE_URL=/i)) {
  rawBase = rawBase.replace(/^VITE_API_BASE_URL=/i, '');
}
const normalizedBase = rawBase
  ? (rawBase.endsWith('/api') ? rawBase : rawBase.replace(/\/$/, '') + '/api')
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: normalizedBase,
  withCredentials: false,
});

// attach bearer token from localStorage if present (key: access_token)
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }

  // Development: log outgoing request payload and final URL (redact sensitive headers)
  try {
    if (import.meta.env.DEV) {
      const safeHeaders = { ...config.headers };
      if (safeHeaders.Authorization) safeHeaders.Authorization = 'Bearer [REDACTED]';
      // Compute absolute URL for clearer debugging
      let fullUrl = '';
      try {
        fullUrl = new URL(config.url, config.baseURL).href;
      } catch (e) {
        fullUrl = (config.baseURL || '') + (config.url || '');
      }
      console.debug('[api] request:', config.method?.toUpperCase(), fullUrl, 'headers:', safeHeaders, 'data:', config.data);
    }
  } catch (e) {}

  return config;
});

// Response logging for development
api.interceptors.response.use(
  (response) => {
    try {
      if (import.meta.env.DEV) {
        console.debug(
          '[api] response:',
          response.status,
          response.config?.method?.toUpperCase(),
          response.config?.url,
          'data keys:',
          Object.keys(response.data || {})
        );
      }
    } catch (e) {}

    return response;
  },
  (error) => {
    try {
      if (import.meta.env.DEV) {
        console.error(
          '[api] response error:',
          error?.response?.status,
          error?.config?.method?.toUpperCase(),
          error?.config?.url,
          'response data:',
          error?.response?.data
        );
      }
    } catch (e) {}

    return Promise.reject(error);
  }
);

export default api;

// Export backend origin
export const API_BASE_URL = normalizedBase;
export const API_ORIGIN = String(API_BASE_URL).replace(/\/api\/?$/i, '');

// Helper to build absolute image URLs
export function makeImageUrl(u) {
  if (!u) return '';
  try {
    const s = String(u).trim();
    // Only accept absolute http(s) URLs. Any other value -> return empty to avoid 404s
    if (/^https?:\/\//i.test(s)) return encodeURI(s);
    // If value is a path like '/uploads/...' or a bare filename, prefix with API origin
    if (s.startsWith('/')) return API_ORIGIN.replace(/\/$/, '') + s;
    // bare filenames (no slashes) or relative paths -> prefix with /uploads/
    if (!s.includes('/')) return API_ORIGIN.replace(/\/$/, '') + '/uploads/' + encodeURI(s);
    // fallback: prefix and clean leading slashes
    return API_ORIGIN.replace(/\/$/, '') + '/' + encodeURI(s.replace(/^\/+/, ''));
  } catch (e) {
    return '';
  }
}

// Normalizing backend shapes
export function unwrap(res) {
  if (!res) return null;
  return res?.data?.data ?? res?.data ?? null;
}
