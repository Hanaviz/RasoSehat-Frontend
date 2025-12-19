import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const cache = new Map();

export default function useSearchQuery(q, options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const term = (q || '').trim();
    if (!term) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (cache.has(term)) {
      const cached = cache.get(term);
      // check TTL
      if (cached.expires > Date.now()) {
        setData(cached.value);
        return;
      } else {
        cache.delete(term);
      }
    }

    setIsLoading(true);
    setError(null);

    // debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      try {
        const resp = await api.get('/search', { params: { q: term }, signal: abortRef.current.signal });
        const payload = resp?.data?.data || resp?.data || null;
        setData(payload);
        cache.set(term, { value: payload, expires: Date.now() + (options.ttl || 30000) });
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }, options.debounce || 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [q]);

  return { data, isLoading, error };
}
