import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Filter, Search, MapPin, Star, Utensils,
} from "lucide-react";
import { motion } from "framer-motion";
import api, { unwrap } from "../utils/api";
import { normalizeResultList } from "../utils/searchNormalizer";
import MenuCard from "../components/MenuCard";

// Data kategori statis untuk filter UI
const categories = [
  "Semua Kategori",
  "Rendah Kalori",
  "Rendah Gula",
  "Tinggi Protein",
  "Seimbang",
  "Vegetarian/Vegan",
];

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || ""; // Ambil query pencarian (keperluan header)
  const initialLocation = searchParams.get("loc") || ""; // Ambil lokasi (jika ada)

  // State Data
  const [results, setResults] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // State Filter Lokal (hanya untuk UI, filter utama di backend)
  const [activeFilter, setActiveFilter] = useState("Semua Kategori");
  const [minRating, setMinRating] = useState(0);
  // NOTE: filteredResults dihilangkan, cukup gunakan 'results' yang sudah di-fetch

  // 💡 FUNGSI FETCH DATA PENCARIAN
  const fetchSearchResults = useCallback(async (query, type = 'all') => {
    setLoading(true);
    const q = (query || '').trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      const resp = await api.get('/search', { params: { q, type } });
      const payload = resp?.data?.data || resp?.data || null;
      const unified = payload && Array.isArray(payload.results) ? normalizeResultList(payload.results) : [];
      setResults(unified);
    } catch (error) {
      console.error('Gagal mengambil hasil pencarian:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 💡 EFFECT: Panggil API saat query berubah
  useEffect(() => {
    // Read current query and type from URLSearchParams on every change
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'menu'; // default to menu search
    fetchSearchResults(q, type);
  }, [searchParams, fetchSearchResults]);

  // Presentational components for each result type
  const RestaurantCard = ({ item }) => {
    const foto = item.foto || item.image || 'https://placehold.co/800x200/ddd/333?text=Restaurant';
    const name = item.name || item.nama_restoran || 'Restoran';
    const desc = item.description || item.deskripsi || item.address || '';
    const slug = item.slug || item.restaurant_slug || item.restaurantSlug || '';

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 w-full"
      >
        <div className="md:flex md:items-stretch">
          <Link to={`/restaurant/${slug}`} className="block md:w-48 lg:w-56 flex-shrink-0">
            <img src={foto} alt={name} className="w-full h-40 md:h-full object-cover" />
          </Link>
          <div className="p-4 flex-1">
            <Link to={`/restaurant/${slug}`} className="text-lg font-bold text-gray-800 hover:text-green-600">
              {name}
            </Link>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{desc}</p>
            <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold">{item.rating ?? '—'}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{item.distance || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const CategoryLink = ({ item }) => (
    <Link to={`/category/${item.slug || item.id}`} className="inline-block bg-white border border-gray-100 rounded-lg px-4 py-2 text-sm hover:bg-green-50 hover:border-green-200">
      {item.name} {item.count ? <span className="text-gray-400">({item.count})</span> : null}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Pencarian */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-md border-t-4 border-green-500">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Search className="w-7 h-7 text-green-600" /> Hasil Pencarian
          </h1>
          <p className="text-gray-600 mt-2 text-base">
            {loading ? (
                <span>Mencari menu...</span>
            ) : (
                <span>Menampilkan **{results.length}** menu untuk: 
                    <span className="font-semibold text-green-700 ml-1">
                        "{initialQuery || "Semua"}"
                    </span>
                    {initialLocation && (
                        <span className="text-sm text-gray-500 ml-2"> (Lokasi: {initialLocation})</span>
                    )}
                </span>
            )}
          </p>
        </div>

        {/* Layout Filter dan Hasil */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Kolom Kiri: Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-5 space-y-6 sticky top-28 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-3 mb-2">
                <Filter className="w-5 h-5" /> Filter Sehat
              </h3>

              {/* Filter Kategori Kesehatan */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Kategori Menu:</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveFilter(category)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                        activeFilter === category
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Rating */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-700">
                  Minimum Rating:{" "}
                  <span className="text-green-600">
                    {minRating || "Semua"} Bintang
                  </span>
                </h4>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg range-success"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>3.0</span>
                  <span>5.0</span>
                </div>
              </div>

              {/* Filter Jarak (Mock) */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-700">
                  Jarak Maksimum (km):
                </h4>
                <input
                  type="number"
                  placeholder="Contoh: 5"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Daftar Hasil */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center p-12">
                <svg className="animate-spin h-10 w-10 text-green-600 mx-auto" viewBox="0 0 24 24"></svg>
                <p className="text-gray-600 mt-4 text-xl">Sedang memuat hasil dari Padang...</p>
              </div>
            ) : results.length > 0 ? (
              (() => {
                // split results by type
                const menus = results.filter(r => r.type === 'menu');
                const restaurants = results.filter(r => r.type === 'restaurant');
                const categoriesRes = results.filter(r => r.type === 'category');

                // helper to adapt normalized item to MenuCard's expected props
                const mapToMenu = (it) => ({
                  id: it.id,
                  name: it.name,
                  description: it.description,
                  price: it.price,
                  rating: it.rating,
                  image: it.foto || it.image,
                  restaurantName: typeof it.restaurant === 'string' ? it.restaurant : (it.restaurant?.name || it.restaurantName || ''),
                  restaurantSlug: it.restaurantSlug || it.restaurant_slug || '',
                });

                return (
                  <div className="space-y-6">
                    {/* Categories Section */}
                    {categoriesRes.length > 0 && (
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-600 mb-3">Kategori</h3>
                        <div className="flex flex-wrap gap-3">
                          {categoriesRes.map(cat => (
                            <CategoryLink key={`cat-${cat.id}`} item={cat} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Menu Grid */}
                    {menus.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Menu</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {menus.map(m => (
                            <div key={`menu-${m.id}`} className="col-span-1">
                              <MenuCard menu={mapToMenu(m)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Restaurants as full-width cards */}
                    {restaurants.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Restoran</h3>
                        <div className="space-y-4">
                          {restaurants.map(r => (
                            <div key={`rest-${r.id}`} className="w-full">
                              <RestaurantCard item={r} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
                <p className="text-xl font-semibold text-gray-700">
                  Tidak ada hasil ditemukan.
                </p>
                <p className="text-gray-500 mt-2">
                  Coba ganti kata kunci atau longgarkan filter Anda.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}