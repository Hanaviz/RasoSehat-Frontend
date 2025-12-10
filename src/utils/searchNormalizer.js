// normalize results returned by backend `/api/search` into a common front-end shape

export function normalizeResult(item) {
  if (!item || !item.type) return null;
  switch (item.type) {
    case 'menu':
      return {
        id: item.id,
        type: 'menu',
        name: item.name || item.nama_menu || '',
        // prefer real slug from backend; default to empty string to avoid 'null' in URLs
        slug: item.slug || '',
        // restaurant may be string or object; keep as-is for flexibility
        restaurant: item.restaurant || item.nama_restoran || null,
        // normalize restaurant slug to string
        restaurantSlug: item.restaurant_slug || item.restaurantSlug || '',
        foto: item.foto || item.image || '',
        // ensure healthTag is always a string to safely call .includes
        healthTag: (item.healthTag || item.health_tag || '') + '',
        description: item.description || item.deskripsi || '',
        price: (typeof item.price !== 'undefined' && item.price !== null) ? item.price : (item.harga || null),
        rating: (typeof item.rating !== 'undefined' && item.rating !== null) ? item.rating : null,
      };
    case 'restaurant':
      return {
        id: item.id,
        type: 'restaurant',
        name: item.name || item.nama_restoran || '',
        slug: item.slug || item.restaurant_slug || item.restaurantSlug || '',
        description: item.description || item.deskripsi || item.alamat || null,
        foto: item.foto || item.image || '',
        rating: (typeof item.rating !== 'undefined' && item.rating !== null) ? item.rating : null,
      };
    case 'category':
      return {
        id: item.id,
        type: 'category',
        name: item.name || item.nama_kategori || item.nama || '',
        slug: item.slug || item.nama?.toLowerCase().replace(/\s+/g, '-') || '',
        count: item.count || 0,
      };
    default:
      return null;
  }
}

export function normalizeResultList(list) {
  if (!Array.isArray(list)) return [];
  const mapped = list.map(normalizeResult).filter(Boolean);
  // Ensure suggestion ordering: menu, restaurant, category
  mapped.sort((a, b) => {
    const order = { menu: 0, restaurant: 1, category: 2 };
    return (order[a.type] - order[b.type]);
  });
  return mapped;
}
