import api from '../api';

export async function searchQuery(q, signal) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  const url = `/search?${params.toString()}`;
  const res = await api.get(url, { signal });
  return res && res.data ? res.data : res;
}
