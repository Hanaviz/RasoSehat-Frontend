import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LocateFixed } from "lucide-react";
import HeroMenuCard from "../components/HeroMenuCard";
import api, { unwrap, makeImageUrl } from "../utils/api";

// Data kategori yang statis (tidak perlu dari API)
const allCategories = [
  { name: "Rendah Gula", icon: "🍯", slug: "rendah-gula" },
  { name: "Rendah Kalori", icon: "🥒", slug: "rendah-kalori" },
  { name: "Tinggi Protein", icon: "🥤", slug: "tinggi-protein" },
  { name: "Seimbang", icon: "🍽️", slug: "seimbang" },
  { name: "Vegetarian / Vegan", icon: "🥦", slug: "vegetarian-vegan" },
  { name: "Rendah Lemak Jenuh", icon: "🥑", slug: "rendah-lemak-jenuh" },
  { name: "Kids Friendly", icon: "🧸", slug: "kids-friendly" },
  { name: "Gluten Free", icon: "🌾", slug: "gluten-free" },
  { name: "Organik", icon: "🥬", slug: "organik" },
];

// Helper: kelompokkan menu berdasarkan diet_claims.
// Jika menu tidak punya klaim, masukkan ke grup 'Umum'.
const groupMenusByClaim = (menus) => {
  const grouped = {};
  const predefinedClaims = allCategories.map((c) => c.name);

  menus.forEach((menu) => {
    const claims =
      Array.isArray(menu.diet_claims) && menu.diet_claims.length > 0
        ? menu.diet_claims
        : ["Umum"];
    claims.forEach((claim) => {
      if (!grouped[claim]) grouped[claim] = [];

      const slug = (menu.nama_menu || "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      const restaurantSlug = (menu.nama_restoran || "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

      grouped[claim].push({
        id: menu.id,
        name: menu.nama_menu,
        slug,
        price: menu.harga,
        rating: menu.rating || 4.5,
        prepTime: menu.prepTime || "10-20 min",
        image:
          makeImageUrl(menu.foto) ||
          "https://placehold.co/400x300/4ade80/white?text=RasoSehat",
        restaurantName: menu.nama_restoran,
        restaurantSlug,
        description: menu.deskripsi,
        isVerified: menu.status_verifikasi === "disetujui" || true,
        calories: menu.kalori,
      });
    });
  });

  const groups = predefinedClaims
    .map((claim) => ({
      title: claim,
      slug: allCategories.find((c) => c.name === claim)?.slug || claim,
      items: grouped[claim] || [],
    }))
    .filter((g) => g.items.length > 0);

  if (grouped["Umum"] && grouped["Umum"].length) {
    groups.push({ title: "Umum", slug: "umum", items: grouped["Umum"] });
  }

  return groups;
};

export default function HeroSection() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [location, setLocation] = useState("");
  const [reverseLoading, setReverseLoading] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // State untuk data dari API
  const [featuredMenus, setFeaturedMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(true);

  const displayedCategories = showAllCategories
    ? allCategories
    : allCategories.slice(0, 8);

  // Map display category names to backend diet_claim keys
  const claimKeyMap = {
    "Rendah Kalori": "low_calorie",
    "Rendah Gula": "low_sugar",
    "Tinggi Protein": "high_protein",
    "Tinggi Serat": "high_fiber",
    Seimbang: "balanced",
    "Vegetarian / Vegan": "vegan",
    "Rendah Lemak Jenuh": "low_saturated_fat",
    "Kids Friendly": "kids_friendly",
    "Gluten Free": "gluten_free",
    Organik: "organic",
  };

    // Derive category sections from the `allCategories` constant (preserve name/icon/slug)
    // Use the human-readable category name as `key` because the backend stores
    // diet_claims as display names in many installations. Avoid using internal
    // snake_case keys here to improve matching with the DB.
    const derivedCategories = allCategories.map((c) => ({
      title: c.name,
      key: c.name, // use display name for lookup against diet_claims_list.nama
      slug: c.slug,
      icon: c.icon,
    }));

  // State for per-category sections (one section per entry in allCategories)
  const [categorySections, setCategorySections] = useState(
    derivedCategories.map((c) => ({
      ...c,
      items: [],
      loading: true,
      error: null,
    }))
  );

  // Debug: log categorySections whenever it changes to verify payloads
  useEffect(() => {
    try {
      if (categorySections && categorySections.length) {
        categorySections.forEach((sec) => {
          console.debug(
            `[Herosection] category='${sec.title}' key='${sec.key}' items=${
              (sec.items || []).length
            } loading=${sec.loading} error=${Boolean(sec.error)}`
          );
        });
      } else {
        console.debug("[Herosection] categorySections empty");
      }
    } catch (e) {
      console.warn("[Herosection] debug log failed", e);
    }
  }, [categorySections]);

  // Fetch dan normalisasi data
  const fetchFeaturedMenus = useCallback(async () => {
    setLoadingMenus(true);
    try {
      console.log(
        "[HeroSection] fetching approved menus from",
        api.defaults.baseURL + "/menus"
      );
      const response = await api.get(`/menus`);
      console.log(
        "[HeroSection] response received:",
        response.status,
        response.data
      );

      const payload = unwrap(response) || [];

      const normalized = (payload || []).map((m) => ({
        ...m,
        // pastikan diet_claims selalu array
        diet_claims: Array.isArray(m.diet_claims)
          ? m.diet_claims
          : m.diet_claims
          ? typeof m.diet_claims === "string"
            ? (() => {
                try {
                  return JSON.parse(m.diet_claims);
                } catch {
                  return [m.diet_claims];
                }
              })()
            : [m.diet_claims]
          : [],
        id: m.id,
        nama_menu: m.nama_menu,
        deskripsi: m.deskripsi,
        harga: m.harga,
        foto: m.foto,
        kalori: m.kalori,
        nama_restoran: m.nama_restoran,
      }));

      setFeaturedMenus(normalized);
      console.log(
        "[HeroSection] normalized menus set (count):",
        normalized.length
      );
    } catch (err) {
      console.error("[HeroSection] fetch error", err);
      setFeaturedMenus([]);
    } finally {
      setLoadingMenus(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedMenus();
  }, [fetchFeaturedMenus]);

  const groupedMenus = groupMenusByClaim(featuredMenus);

  useEffect(() => {
    console.debug("[HeroSection] featuredMenus updated:", featuredMenus);
    try {
      const summary = groupMenusByClaim(featuredMenus).map((g) => ({
        title: g.title,
        count: g.items.length,
      }));
      console.debug("[HeroSection] grouped summary:", summary);
    } catch (e) {
      console.debug("[HeroSection] grouping error", e);
    }
  }, [featuredMenus]);

  // Fetch per-category menus sequentially (one-by-one) and populate categorySections
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Debug: show derived categories structure
      console.debug("[HeroSection] derivedCategories:", derivedCategories);
      for (const cat of derivedCategories) {
        if (cancelled) break;
        setCategorySections((prev) =>
          prev.map((s) =>
            s.key === cat.key ? { ...s, loading: true, error: null } : s
          )
        );
        try {
          const encodedKey = encodeURIComponent(cat.key);
          const url = `/menus/by-category/${encodedKey}?limit=8`;
          console.debug(
            `[HeroSection] fetching category='${cat.title}' -> ${url}`
          );
          const resp = await api.get(url);
          console.debug(
            `[HeroSection] raw response for '${cat.title}':`,
            resp && resp.data ? resp.data : resp
          );
          const payload = unwrap(resp) || [];
          console.debug(`[HeroSection] payload for '${cat.title}':`, payload);
          setCategorySections((prev) =>
            prev.map((s) =>
              s.key === cat.key
                ? { ...s, items: payload, loading: false, error: null }
                : s
            )
          );
        } catch (e) {
          console.error("[HeroSection] fetch category error", cat.key, e);
          setCategorySections((prev) =>
            prev.map((s) =>
              s.key === cat.key
                ? {
                    ...s,
                    items: [],
                    loading: false,
                    error: e?.message || String(e),
                  }
                : s
            )
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Expose a manual refresh for debugging in the UI
  const handleRefreshFeatured = async () => {
    try {
      setLoadingMenus(true);
      await fetchFeaturedMenus();
    } finally {
      setLoadingMenus(false);
    }
  };

  // Hero carousel data (gunakan yang statis)
  const heroSlides = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&h=1080&fit=crop",
      slogan: "Padang Penuh Rasa, Tetap Sehat Selalu.",
      subtext:
        "Temukan pilihan menu rendah kolesterol dan tinggi gizi tanpa mengorbankan kelezatan.",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&h=1080&fit=crop",
      slogan: "Diet Sehat Jadi Mudah, Dekat dari Kampus Anda.",
      subtext:
        "Panduan lokasi makanan sehat terdekat, ideal untuk gaya hidup mahasiswa.",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&h=1080&fit=crop",
      slogan: "Atasi Kolesterol Tinggi, Mulai Hidup Sehat Hari Ini.",
      subtext:
        "Lihat data nutrisi terverifikasi untuk setiap menu dan restoran.",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1920&h=1080&fit=crop",
      slogan: "Tinggi Protein, Rendah Gula. Pilihan Tepat untuk Semua Diet.",
      subtext:
        "Saring menu berdasarkan Rendah Kalori, Keto, Vegan, dan kebutuhan Anda.",
    },
  ];

  // Auto slide and map logic (dihapus/disingkat untuk fokus pada API)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };
  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleExplore = () => {
    if (location.trim()) {
      navigate(`/search?loc=${encodeURIComponent(location.trim())}`);
    } else {
      navigate(`/search`);
    }
  };
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocation("Lokasi Saya");
      return;
    }

    setReverseLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const fullAddress = await reverseGeocode(lat, lng);

          if (fullAddress) {
            setLocation(fullAddress); // alamat lengkap
          } else {
            setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
        } catch (e) {
          console.warn("Reverse geocode failed", e);
          setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } finally {
          setReverseLoading(false);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);
        setReverseLoading(false);
        setLocation("Lokasi Saya");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Reverse geocode using Nominatim (OpenStreetMap)
  // Returns a short human-friendly name or null on failure
  // Reverse geocode using Nominatim (OpenStreetMap) — return FULL address
  async function reverseGeocode(lat, lon) {
    try {
      const base = "https://nominatim.openstreetmap.org/reverse";
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        format: "json",
        addressdetails: "1",
        zoom: "18",
        accept_language: "id",
        email: "support@rasosehat.example",
      });

      const res = await fetch(`${base}?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (!data) return null;

      // Gunakan display_name jika lengkap
      if (data.display_name && data.display_name.trim().length > 0) {
        return data.display_name.trim();
      }

      // Fallback penyusunan manual alamat lengkap
      const addr = data.address || {};

      const fullAddressParts = [
        [addr.road, addr.house_number].filter(Boolean).join(" "), // Jalan
        addr.neighbourhood,
        addr.suburb,
        addr.city_district,
        addr.village,
        addr.town,
        addr.city,
        addr.state_district,
        addr.state,
        addr.country,
      ].filter(Boolean);

      if (fullAddressParts.length > 0) {
        return fullAddressParts.join(", ");
      }

      return null;
    } catch (e) {
      console.warn("reverseGeocode error", e);
      return null;
    }
  }

  // No Google Maps modal: simplified location input (geolocation button only)

  const createSlug = (name) =>
    name
      ?.toLowerCase()
      .replace(/\s/g, "-")
      .replace(/[^\w-]+/g, "") || "";

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 bg-gradient-to-b from-green-50 to-white pb-8">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Hero Carousel dan Location Chooser (Kode sama, tidak diubah) */}
        {/*  */}
        <div className="relative mb-16 sm:mb-20 md:mb-24">
          {/* ... (Kode Carousel) */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl group">
            {/* PENGURANGAN TINGGI CAROUSEL */}
            <div className="relative h-56 sm:h-72 md:h-96 lg:h-[430px] overflow-hidden">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === currentSlide
                      ? "opacity-100 translate-x-0"
                      : index < currentSlide
                      ? "opacity-0 -translate-x-full"
                      : "opacity-0 translate-x-full"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={`Slide ${slide.id}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay untuk teks */}
                  <div className="absolute inset-0 bg-black/40"></div>

                  {/* Slogan Text Overlay */}
                  <motion.div
                    key={slide.id + "-text"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 sm:p-8"
                  >
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-black text-white leading-tight drop-shadow-lg max-w-2xl">
                      {slide.slogan}
                    </h2>
                    <p className="mt-2 text-sm sm:text-base font-semibold italic text-green-200 drop-shadow max-w-xl">
                      {slide.subtext}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Previous Button */}
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-white w-6 sm:w-8 h-2"
                      : "bg-white/50 hover:bg-white/75 w-2 h-2"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Standalone Location Chooser */}
          <div className="max-w-md mx-auto -mt-12 relative z-10">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">
                Cari Makanan di Sekitar Anda
              </h3>
              {/* Form untuk Chooser Location */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExplore();
                }}
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Masukkan Area / Kecamatan"
                      className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                    {/* Tombol GPS untuk lokasi saat ini */}
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-green-600 transition-colors ${
                        reverseLoading ? "cursor-wait" : ""
                      }`}
                      title="Gunakan Lokasi Saat Ini"
                      disabled={reverseLoading}
                    >
                      {reverseLoading ? (
                        <svg
                          className="animate-spin w-5 h-5 text-gray-500"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                      ) : (
                        <LocateFixed className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base whitespace-nowrap shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    Cari
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Google Maps modal removed — use simple text input + geolocation button instead */}
        </div>
        {/* END: Carousel dan Location Chooser */}

        {/* Categories Section */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6 -mt-8 border-2 border-green-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">
            Kategori
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
            {displayedCategories.map((category, index) => (
              <Link
                key={index}
                to={`/category/${createSlug(category.name)}`}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-3 sm:p-4 transition-all hover:shadow-lg hover:scale-105 group"
              >
                <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            {!showAllCategories ? (
              <button
                onClick={() => setShowAllCategories(true)}
                className="text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base hover:underline transition-colors"
              >
                Show More
              </button>
            ) : (
              <button
                onClick={() => setShowAllCategories(false)}
                className="text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base hover:underline transition-colors"
              >
                Show Less
              </button>
            )}
          </div>
        </div>

        {/* Featured Menus Section */}
        {/* Per-category sections: each nutrition category renders its own container */}
        {categorySections.map((section) => (
          <div
            key={section.key}
            className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6 border-2 border-green-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-700">
                {section.title}
              </h2>
              <Link
                to={`/category/${section.slug}`}
                className="text-sm text-green-600 hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            {section.loading ? (
              <div className="text-sm text-gray-600">Memuat...</div>
            ) : section.error ? (
              <div className="text-sm text-red-600">
                Gagal memuat kategori: {section.error}
              </div>
            ) : !section.items || section.items.length === 0 ? (
              <div className="text-sm text-gray-600">
                Belum ada menu untuk kategori ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {section.items.map((item) => {
                  const menu = {
                    id: item.id,
                    name: item.nama_menu || item.name,
                    slug: item.slug,
                    price: item.harga || item.price,
                    rating: item.rating || 0,
                    image:
                      makeImageUrl(item.foto || item.image) ||
                      "https://placehold.co/400x300/4ade80/white?text=RasoSehat",
                    restaurantName: item.nama_restoran || item.restaurantName,
                    restaurantSlug: item.restaurant_slug || item.restaurantSlug,
                    description: item.deskripsi || item.description,
                    calories: item.kalori || item.calories,
                    prepTime: item.prepTime || "10-20 min",
                    isVerified: true,
                  };
                  return (
                    <HeroMenuCard
                      key={`${section.key}-${item.id}`}
                      menu={menu}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {/* Featured Menus Section */}
      </div>
    </div>
  );
}
