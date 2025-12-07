import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Filter, Search, MapPin, Star, Utensils,
} from "lucide-react";
import { motion } from "framer-motion";
import api, { unwrap } from "../utils/api";

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
  const initialQuery = searchParams.get("q") || ""; // Ambil query pencarian
  const initialLocation = searchParams.get("loc") || ""; // Ambil lokasi (jika ada)

  // State Data
  const [results, setResults] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // State Filter Lokal (hanya untuk UI, filter utama di backend)
  const [activeFilter, setActiveFilter] = useState("Semua Kategori");
  const [minRating, setMinRating] = useState(0);
  // NOTE: filteredResults dihilangkan, cukup gunakan 'results' yang sudah di-fetch

  // 💡 FUNGSI FETCH DATA PENCARIAN
  const fetchSearchResults = useCallback(async (query, categoryName) => {
    setLoading(true);
    // CATATAN: Karena tabel kategori_makanan menggunakan ID, kita perlu ID kategori
    // Implementasi ini disederhanakan dengan hanya mengirim query string.
    
    // Construct URL API Search
    let url = `${API_BASE_URL}/menus/search?`;
    if (query) {
        url += `q=${encodeURIComponent(query)}&`;
    }
    // Jika Anda memiliki ID Kategori yang sesuai, kirimkan:
    // if (categoryId) { url += `category_id=${categoryId}&`; }

    // Tambahkan filter Rating/Lokasi di frontend jika tidak ingin membebani backend
    
    try {
      const response = await api.get('/menus/search', { params: { q: query } });

      // Memproses slug menu dan restoran (karena API hanya memberikan nama)
      const items = unwrap(response) || [];
      const processedResults = items.map(item => {
            const slug = item.nama_menu.toLowerCase().replace(/\s/g, '-').replace(/[^\w-]+/g, '');
            const restaurantSlug = item.nama_restoran.toLowerCase().replace(/\s/g, '-').replace(/[^\w-]+/g, '');

            // Mengambil klaim pertama sebagai healthTag untuk tampilan card
            const healthTag = Array.isArray(item.diet_claims) && item.diet_claims.length > 0
                ? item.diet_claims[0]
                : 'Sehat Umum';
            
            return {
                ...item,
                slug,
                restaurantSlug,
                healthTag,
                rating: 4.5, // Mock Rating
                price: item.harga,
                description: item.deskripsi,
                name: item.nama_menu,
                restaurant: item.nama_restoran,
            };
        });

        setResults(processedResults);
    } catch (error) {
        console.error('Gagal mengambil hasil pencarian:', error);
        setResults([]);
    } finally {
        setLoading(false);
    }
  }, []); // dependencies kosong karena hanya menggunakan searchParams

  // 💡 EFFECT: Panggil API saat query berubah
  useEffect(() => {
    // Implementasi filter UI: Anda dapat memanggil fetchSearchResults dengan filter aktif di sini
    // Untuk saat ini, kita panggil hanya dengan initialQuery
    fetchSearchResults(initialQuery, null); 
  }, [initialQuery, fetchSearchResults]);

  // Komponen Card Hasil Pencarian (Disesuaikan untuk data dari API)
  const ResultCard = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
    >
      <Link to={`/menu/${item.slug}`} className="block">
        <img
          src={item.foto || 'https://placehold.co/400x300/4ade80/white?text=Menu'} // Gunakan item.foto dari DB
          alt={item.name}
          className="w-full h-40 object-cover"
        />
      </Link>

      <div className="p-4 space-y-2">
        <Link to={`/menu/${item.slug}`}>
          <h3 className="text-lg font-bold text-gray-800 hover:text-green-600 transition-colors">
            {item.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <Link
            to={`/restaurant/${item.restaurantSlug}`} 
            className="font-semibold text-gray-700 hover:text-green-600 transition-colors"
          >
            {item.restaurant}
          </Link>
          <div
            className={`px-2 py-0.5 rounded text-xs font-semibold ${
              item.healthTag.includes("Rendah")
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {item.healthTag}
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-2 border-gray-100">
          <div className="flex items-center gap-1 text-yellow-500 text-sm">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold text-gray-700">{item.rating}</span>
          </div>
          <p className="flex items-center gap-1 text-xs text-gray-600">
            <MapPin className="w-3 h-3" /> {item.distance || '0.5'} km
          </p>
          <p className="text-green-600 font-bold">Rp {item.price}</p>
        </div>
      </div>
    </motion.div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
              </div>
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