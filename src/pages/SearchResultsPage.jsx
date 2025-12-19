import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, Search, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import api from "../utils/api";
import HeroMenuCard from "../components/HeroMenuCard";

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
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const controllerRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState("Semua Kategori");
  const [minRating, setMinRating] = useState(0);

  const limit = 24;

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  // Debounced, cancellable fetch when query or page changes
  useEffect(() => {
    const keyword = (query || "").trim();
    if (!keyword) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);

    // cancel previous controller if any
    if (controllerRef.current) {
      try {
        controllerRef.current.abort();
      } catch (e) {}
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/search", { params: { q: keyword, page, limit }, signal: controller.signal });
        const payload = res?.data?.data || res?.data || null;
        const menus = Array.isArray(payload?.results) ? payload.results : [];
        setResults(menus);
        setTotal(typeof payload?.total === 'number' ? payload.total : (menus.length || 0));
      } catch (err) {
        if (err && (err.name === 'CanceledError' || err.message === 'canceled' || err.code === 'ERR_CANCELED')) {
          // request was cancelled, ignore
          return;
        }
        console.error("Search failed:", err);
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      try {
        controller.abort();
      } catch (e) {}
    };
  }, [query, page]);

  // UI-level filtering (rating only)
  const filteredResults = results.filter((item) => {
    if (item.rating && item.rating < minRating) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="text-green-600" />
            Hasil Pencarian
          </h1>
          <p className="text-gray-600 mt-1">
            Menampilkan {filteredResults.length} hasil untuk "
            <span className="font-semibold text-green-700">{query}</span>"
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* FILTER */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-5 rounded-xl shadow sticky top-28">
              <h3 className="font-bold flex gap-2 mb-4">
                <Filter /> Filter
              </h3>

              <div className="space-y-2 mb-6">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveFilter(c)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeFilter === c
                        ? "bg-green-600 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">
                  Minimum Rating: {minRating}
                </p>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(+e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </aside>

          {/* RESULTS */}
          <section className="lg:col-span-3">
            {loading ? (
              <p className="text-center py-20">Memuat hasil...</p>
            ) : filteredResults.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredResults.map((item) => (
                  <HeroMenuCard
                    key={item.id}
                    menu={{
                      id: item.id,
                      name: item.name,
                      nama_menu: item.name,
                      description: item.description,
                      price: item.price,
                      harga: item.price,
                      image: item.image || item.foto || item.photo || null,
                      foto: item.foto || item.image || null,
                      rating: item.rating,
                      restaurantName: item.restaurant || item.restaurantName || '',
                      restaurant_slug: item.restaurant_slug || item.restaurantSlug || '',
                    }}
                  />
                ))}
              </div>
              ) : null}

            {/* Pagination controls */}
            {!loading && filteredResults.length ? (
              <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-xl shadow">
                <div>
                  <p className="text-sm text-gray-600">Menampilkan {Math.min(total, page * limit) - (page - 1) * limit} dari {total} hasil</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm">Halaman {page} / {Math.max(1, Math.ceil(total / limit))}</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(total / limit)}
                    className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 bg-white rounded-xl shadow">
                <p className="font-semibold text-gray-700">
                  Tidak ada hasil ditemukan
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
