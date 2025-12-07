import axios from 'axios';

// Normalize base URL: ensure it includes the '/api' segment expected by backend
const rawBase = import.meta.env.VITE_API_BASE_URL;
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

  // Development: log outgoing request payload (redact sensitive headers)
  try {
    if (import.meta.env.DEV) {
      const safeHeaders = { ...config.headers };
      if (safeHeaders.Authorization) safeHeaders.Authorization = 'Bearer [REDACTED]';
      console.debug(
        '[api] request:',
        config.method?.toUpperCase(),
        config.url,
        'headers:',
        safeHeaders,
        'data:',
        config.data
      );
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
    const s = String(u);
    if (/^https?:\/\//i.test(s)) return encodeURI(s);
    if (s.startsWith('/')) return encodeURI(API_ORIGIN + s);
    return encodeURI(s);
  } catch (e) {
    return '';
  }
}

// Normalizing backend shapes
export function unwrap(res) {
  if (!res) return null;
  return res?.data?.data ?? res?.data ?? null;
}
