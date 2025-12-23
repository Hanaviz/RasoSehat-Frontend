import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Filter, Search, Star, ChevronLeft, ChevronRight } from "lucide-react";
import api, { makeImageUrl } from "../utils/api";
import MenuCard from "../components/MenuCard";

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
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const typeParam = (searchParams.get("type") || "all").toLowerCase();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const controllerRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState("Semua Kategori");
  const [minRating, setMinRating] = useState(0);
  const [visitingId, setVisitingId] = useState(null);

  const limit = 24;

  // Reset page when query or type changes
  useEffect(() => {
    setPage(1);
  }, [query, typeParam]);

  // Fetch search results from backend
  useEffect(() => {
    const keyword = (query || "").trim();
    if (!keyword) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Cancel previous request
    if (controllerRef.current) {
      try {
        controllerRef.current.abort();
      } catch (e) {
        // Ignore abort errors
      }
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    // Debounced fetch
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/search", {
          params: { q: keyword, page, limit, type: typeParam },
          signal: controller.signal,
        });

        const payload = res?.data?.data || res?.data || {};
        const items = Array.isArray(payload.results) ? payload.results : [];
        const totalCount =
          typeof payload.total === "number" ? payload.total : items.length;

        setResults(items);
        setTotal(totalCount);

        // Prefetch missing slugs for restaurant items so UI shows DB slugs
        let active = true;
        (async () => {
          try {
            const missing = items.filter(
              (it) =>
                it.type === "restaurant" &&
                (!it.slug || String(it.slug) === "null")
            );
            if (missing.length === 0) return;

            const updates = {};
            await Promise.all(
              missing.map(async (it) => {
                if (!it.id) return;
                try {
                  const rres = await api.get(`/restaurants/${it.id}`);
                  const body = rres?.data?.data || rres?.data || {};
                  const fetchedSlug =
                    body?.slug || body?.restaurant?.slug || null;
                  if (fetchedSlug && String(fetchedSlug) !== "null") {
                    updates[it.id] = {
                      slug: String(fetchedSlug),
                      foto: body?.foto_path || body?.foto || body?.photo || it.foto || null,
                      rating: it.rating || body?.rating || it.rating,
                    };
                  }
                } catch (e) {
                  console.warn(
                    "[SearchResults] prefetch slug failed for",
                    it.id,
                    e
                  );
                }
              })
            );

            if (!active) return;
            if (Object.keys(updates).length > 0) {
              const merged = items.map((it) =>
                updates[it.id] ? { ...it, ...updates[it.id] } : it
              );
              setResults(merged);
            }
          } catch (e) {
            console.warn("[SearchResults] error prefetching slugs", e);
          }
        })();
      } catch (err) {
        // Ignore abort errors
        if (
          err &&
          (err.name === "CanceledError" ||
            err.message === "canceled" ||
            err.code === "ERR_CANCELED")
        ) {
          return;
        }
        console.error("[SearchResults] Fetch failed:", err);
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
  }, [query, page, typeParam]);

  // Client-side filtering by rating
  const filteredResults = results.filter((item) => {
    if (minRating > 0 && (!item.rating || item.rating < minRating)) {
      return false;
    }
    return true;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  // Renderer for restaurant items
  const renderRestaurantItem = (r) => {
    // Resolve image: prefer r.foto_path, then r.foto, fallback to foto_ktp or generated avatar
    const rawImg = r.foto_path || r.foto || r.foto_ktp || r.photo || null;
    let imgSrc = "/restoran-placeholder.png";
    try {
      if (rawImg) {
        if (typeof rawImg === "string" && rawImg.startsWith("http")) imgSrc = rawImg;
        else imgSrc = makeImageUrl(rawImg);
      } else {
        imgSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || "")}&background=16a34a&color=fff&rounded=true`;
      }
    } catch (e) {
      imgSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || "")}&background=16a34a&color=fff&rounded=true`;
    }

    // compute safe slug: ignore literal 'null' or undefined
    const slugCandidate = r.slug && String(r.slug) !== "null" ? String(r.slug) : null;
    const safeVisit = async () => {
      if (visitingId) return; // prevent re-entrancy
      setVisitingId(r.id);
      try {
        if (slugCandidate) return navigate(`/restaurant/${slugCandidate}`);

        // Fallback: try to fetch restaurant by id and obtain its slug
        if (r.id) {
          const res = await api.get(`/restaurants/${r.id}`);
          const body = res?.data?.data || res?.data || {};
          const fetchedSlug = body?.slug || body?.restaurant?.slug || null;
          if (fetchedSlug && String(fetchedSlug) !== "null") {
            return navigate(`/restaurant/${encodeURIComponent(fetchedSlug)}`);
          }
        }
      } catch (e) {
        console.warn("[SearchResults] Failed to fetch restaurant by id fallback", e);
      } finally {
        setVisitingId(null);
      }

      // Final fallback: perform a restaurant-only search for the name
      navigate(`/search?q=${encodeURIComponent(r.name || "")}&type=restaurant`);
    };

    return (
      <div key={`resto-${r.id}`} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100">
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Logo Restoran */}
            <button type="button" onClick={safeVisit} disabled={visitingId === r.id} aria-label={`Buka ${r.name || "restoran"}`} className="flex-shrink-0 rounded-full overflow-hidden w-20 h-20 ring-2 ring-gray-100 hover:ring-green-500 transition-all">
              <img src={imgSrc} alt={r.name || "Restoran"} loading="lazy" className="w-full h-full object-cover" />
            </button>

            {/* Info Restoran */}
            <div className="flex-1 min-w-0">
              <button type="button" onClick={safeVisit} disabled={visitingId === r.id} className="text-left w-full group">
                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-green-600 transition-colors truncate">{r.name || "—"}</h3>
              </button>

              {r.slug && String(r.slug) !== "null" && (
                <div className="text-xs text-gray-500 mt-1 truncate">{r.slug}</div>
              )}

              {/* Stats Row - Shopee Style */}
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-gray-700">
                    {r.rating ? Number(r.rating).toFixed(1) : "0.0"}
                  </span>
                </div>
              </div>

              {r.description && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                  {r.description}
                </p>
              )}
            </div>
          </div>

          {/* Tombol Kunjungi */}
          <button
            type="button"
            onClick={safeVisit}
            disabled={visitingId === r.id}
            className="w-full mt-4 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {visitingId === r.id ? "Memuat…" : "Kunjungi Toko"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen-safe bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
            <Search className="text-green-600 w-8 h-8" />
            Hasil Pencarian
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {loading ? (
              <span className="animate-pulse">Mencari...</span>
            ) : (
              <>
                Menampilkan{" "}
                <span className="font-semibold text-green-700">
                  {filteredResults.length}
                </span>{" "}
                hasil untuk "
                <span className="font-semibold text-green-700">{query}</span>"
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SIDEBAR FILTER */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-5 rounded-xl shadow-md sticky top-28">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-lg text-gray-800">
                <Filter className="w-5 h-5 text-green-600" />
                Filter
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Kategori
                </p>
                <div className="space-y-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveFilter(c)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        activeFilter === c
                          ? "bg-green-600 text-white font-medium shadow-sm"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Rating Minimum
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-lg font-bold text-gray-800">
                    {minRating.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>5</span>
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setActiveFilter("Semua Kategori");
                  setMinRating(0);
                }}
                className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors duration-200"
              >
                Reset Filter
              </button>
            </div>
          </aside>

          {/* RESULTS SECTION */}
          <section className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-md">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 text-lg">
                  Memuat hasil pencarian...
                </p>
              </div>
            ) : filteredResults.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((item) =>
                    item.type === "restaurant" ? (
                      renderRestaurantItem(item)
                    ) : (
                      <MenuCard
                        key={item.id}
                        menu={{
                          id: item.id,
                          name: item.name,
                          description: item.description,
                          price: item.price,
                          image: item.foto_path || item.foto || null,
                          rating: item.rating,
                          restaurantName: item.restaurant || "",
                          restaurantSlug: item.restaurant_slug || "",
                          slug: item.slug,
                        }}
                      />
                    )
                  )}
                </div>

                {/* Pagination */}
                {total > limit && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-md gap-4">
                    <div className="text-sm text-gray-600">
                      Menampilkan {startIndex}-{endIndex} dari {total} hasil
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg transition-colors duration-200 font-medium text-sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Sebelumnya</span>
                      </button>

                      <span className="px-4 py-2 text-sm font-medium text-gray-700">
                        Hal {page} / {totalPages}
                      </span>

                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page >= totalPages}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg transition-colors duration-200 font-medium text-sm"
                      >
                        <span className="hidden sm:inline">Berikutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-12 bg-white rounded-xl shadow-md">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Tidak Ada Hasil Ditemukan
                </h3>
                <p className="text-gray-500 mb-6">
                  Coba gunakan kata kunci yang berbeda atau kurangi filter
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Kembali ke Beranda
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
