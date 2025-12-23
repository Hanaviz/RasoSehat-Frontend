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
  : 'hhttps://raso-sehat.vercel.app/api';

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
    const s = String(u);
    if (/^https?:\/\//i.test(s)) return encodeURI(s);

    // If string looks like a hostname or host+path but missing protocol
    // e.g. "example.com/uploads/..." or "rasosehat-backend-pr-12345.something.jpg"
    // then assume https and prepend it. Also handle bare hostnames that include
    // an image extension but are missing the protocol (common when DB stored
    // the host+filename without scheme).
    const looksLikeDomainOrHost = /^[a-z0-9.-]+(\/.+)?$/i;
    const imageExt = /\.(jpe?g|png|gif|webp|svg)$/i;
    // If it looks like a domain/host (contains a dot) and either contains a slash
    // (host+path) or ends with a known image extension, consider it a full URL
    // missing protocol and prepend https://
    if (looksLikeDomainOrHost.test(s) && s.includes('.') && (s.includes('/') || imageExt.test(s))) {
      return encodeURI('https://' + s.replace(/^\/+/, ''));
    }
    if (s.startsWith('/')) return encodeURI(API_ORIGIN + s);
    // If string looks like a placeholder fragment (e.g. "400x300.png?text=..."),
    // prefer the public placeholder service to avoid resolving relative domains.
    if (/^\d+x\d+\.(png|jpg|jpeg)(\?.*)?$/.test(s) || /text=/.test(s)) {
      return encodeURI(`https://via.placeholder.com/${s}`);
    }

    // If string looks like an uploads path or filename, prefer Supabase public URL
    if (s.startsWith('uploads/') || s.startsWith('upload/') || s.startsWith('/uploads/')) {
      // If the build provides Supabase details, construct the Supabase public URL
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_BACKEND_SUPABASE_URL || '';
      const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_MENU_BUCKET || import.meta.env.VITE_SUPABASE_UPLOAD_BUCKET || import.meta.env.VITE_SUPABASE_BUCKET || '';
      const normalizeKey = (p) => String(p).replace(/^\/*uploads\/*/i, '').replace(/^\//, '');
      const key = normalizeKey(s);
      if (SUPABASE_URL && SUPABASE_BUCKET && key) {
        try {
          // Build URL without double encoding - only encode the key part
          const baseUrl = SUPABASE_URL.replace(/\/$/, '');
          const supa = `${baseUrl}/storage/v1/object/public/${SUPABASE_BUCKET}/${key}`;
          return supa;
        } catch (e) { /* fallback below */ }
      }
      // Fallback: use backend origin + path if Supabase not configured
      return API_ORIGIN.replace(/\/$/, '') + '/' + s.replace(/^\//, '');
    }

    // Don't synthesize `/uploads/menu/...` fallback anymore. Backend should
    // provide public URLs in `foto_path`. If value is not an absolute URL or
    // absolute path, return empty string so frontend shows placeholders.
    return '';
  } catch (e) {
    return '';
  }
}

// Normalizing backend shapes
export function unwrap(res) {
  if (!res) return null;
  return res?.data?.data ?? res?.data ?? null;
}
