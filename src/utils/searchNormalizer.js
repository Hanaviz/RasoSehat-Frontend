// Normalize backend search response items into unified shape
export function normalizeItem(item) {
  // assume backend already returns { id, type, name, description, image, rating, meta }
  if (!item || !item.type) return null;
  return {
    id: item.id,
    type: item.type,
    name: item.name || '',
    description: item.description || '',
    image: item.image || null,
    rating: (item.rating === undefined) ? null : item.rating,
    meta: item.meta || {}
  };
}

export function normalizeResultList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeItem).filter(Boolean);
}
