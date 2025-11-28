import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
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
  return config;
});

export default api;

// Export backend origin derived from baseURL so frontend can build absolute URLs
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const API_ORIGIN = String(API_BASE_URL).replace(/\/api\/?$/i, '');

// Helper to build absolute image URLs for backend-served uploads
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
