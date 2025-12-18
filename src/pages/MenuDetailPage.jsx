import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Clock, MapPin, Star, Phone, Utensils, AlertTriangle, CheckCircle, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api, { unwrap, makeImageUrl } from '../utils/api';
import MenuReviewSection from '../components/MenuReviewSection';

// Normalizer
function normalizeMenuRow(row, idFallback) {
  if (!row) return null;

  let dietClaims = [];
  if (Array.isArray(row.diet_claims)) dietClaims = row.diet_claims;
  else if (typeof row.diet_claims === 'string') {
    try {
      const parsed = JSON.parse(row.diet_claims);
      dietClaims = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      dietClaims = row.diet_claims ? row.diet_claims.split(',').map(s => s.trim()).filter(Boolean) : [];
    }
  }

  const name = row.nama_menu || row.name || 'Menu';

  // Helper to coerce a possible object to a display string
  const nameOf = (v) => {
    if (!v && v !== 0) return null;
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    if (typeof v === 'object') {
      // Common shapes returned by the backend: { id, nama_kategori } or { id, nama }
      return v.nama_kategori || v.nama || v.name || v.namaKategori || v.label || null;
    }
    return String(v);
  };

  // Ensure diet claims are strings (backend may return objects)
  const normalizedDietClaims = Array.isArray(dietClaims)
    ? dietClaims.map(dc => nameOf(dc)).filter(Boolean)
    : [];

  // Ingredients may also be objects (e.g., bahan_baku rows). Normalize to strings.
  const normalizedIngredients = (Array.isArray(row.bahan_baku)
    ? row.bahan_baku.map(b => nameOf(b) || (typeof b === 'string' ? b : null)).filter(Boolean)
    : (Array.isArray(row.ingredients) ? row.ingredients.map(i => nameOf(i)).filter(Boolean) : [])) || [];

  return {
    id: row.id ?? idFallback,
    name,
    slug: row.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    category: nameOf(row.kategori) || normalizedDietClaims[0] || 'Umum',
    healthTag: normalizedDietClaims[0] || 'Sehat',
    price: row.harga ?? row.price ?? '0',
    rating: Number(row.rating) || 4.5,
    reviews: Number(row.reviews) || 0,
    description: row.deskripsi ?? row.description ?? '',
    image: makeImageUrl(row.foto ?? row.image) || 'https://placehold.co/800x600/4ade80/white?text=RasoSehat',
    restaurant: {
      name: row.nama_restoran || row.restaurant_name || 'Restoran',
      slug: row.restorans?.slug || (row.nama_restoran || row.restaurant_name || 'restoran').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      address: row.alamat || row.address || '',
      phone: row.no_telepon || row.phone || '',
      distance: row.distance || '',
    },
    // Nutrition values: accept either top-level fields (legacy) or nested `nutrition` object from backend
    nutrition: (() => {
      const n = row.nutrition || {};
      const hasTop = (k) => typeof row[k] !== 'undefined';
      const hasNested = (k) => typeof n[k] !== 'undefined';
      const pick = (...keys) => {
        for (const k of keys) {
          if (hasTop(k)) return row[k];
          if (hasNested(k)) return n[k];
        }
        return null;
      };

      return {
        servingSize: row.porsi || row.serving_size || n.servingSize || '1 porsi',
        calories: pick('kalori', 'calories'),
        protein: pick('protein'),
        carbs: pick('karbohidrat', 'carbs'),
        fat: pick('lemak', 'fat'),
        fiber: pick('serat', 'fiber'),
        sugar: pick('gula', 'sugar'),
        sodium: pick('sodium'),
        cholesterol: pick('kolesterol', 'cholesterol'),
      };
    })(),
    ingredients: normalizedIngredients,
    cookingMethod: row.metode_masak || row.cooking_method || '',
    allergens: (row.allergens && typeof row.allergens === 'string'
      ? row.allergens.split(',').map(s => s.trim())
      : row.allergens
    ) || [],
    diet_claims: normalizedDietClaims,
    verified: row.status_verifikasi === 'disetujui' || row.verified === true,
  };
}

const NutritionModal = ({ data, onClose, menu }) => {
  const nutritionPoints = [
    { label: "Kalori Total", value: data.calories, unit: "Kkal", color: "text-red-500" },
    { label: "Protein", value: data.protein, unit: "g", color: "text-blue-500" },
    { label: "Karbohidrat", value: data.carbs, unit: "g", color: "text-yellow-500" },
    { label: "Lemak Total", value: data.fat, unit: "g", color: "text-orange-500" },
    { label: "Gula", value: data.sugar, unit: "g", color: "text-red-600" },
    { label: "Kolesterol", value: data.cholesterol, unit: "mg", color: "text-green-600" },
    { label: "Serat", value: data.fiber, unit: "g", color: "text-green-500" },
    { label: "Natrium", value: data.sodium, unit: "mg", color: "text-gray-500" },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center bg-green-500">
          <h3 className="text-xl font-bold text-white">Detail Gizi per {data.servingSize}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-white hover:bg-white/20 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {nutritionPoints.map((point, index) => (
              <div key={index} className="flex flex-col p-3 bg-gray-50 rounded-lg border">
                <span className="text-xs text-gray-500">{point.label}</span>
                {point.value === null || typeof point.value === 'undefined' ? (
                  <span className="text-xl font-extrabold text-gray-400">—<span className="text-base ml-1 text-gray-400">{point.unit}</span></span>
                ) : (
                  <span className={`text-xl font-extrabold ${point.color}`}>
                    {String(point.value)}
                    <span className="text-base ml-1 text-gray-700">{point.unit}</span>
                  </span>
                )}
              </div>
            ))}
          </div>

          {menu && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
              <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                <CheckCircle size={20} />
                <span>Verifikasi RasoSehat: {menu.healthTag}</span>
              </div>
              {Array.isArray(menu.allergens) && menu.allergens.length > 0 && (
                <p className="text-xs text-red-500 mt-2">Peringatan: {menu.allergens.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function MenuDetailPage() {
  const { id: idParam, slug: slugParam } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let resp;
      const numericCandidate = idParam ?? slugParam;
      if (numericCandidate && /^\d+$/.test(String(numericCandidate))) {
        resp = await api.get(`/menus/${encodeURIComponent(numericCandidate)}?_=${Date.now()}`);
      } else if (slugParam) {
        resp = await api.get(`/menus/slug/${encodeURIComponent(slugParam)}?_=${Date.now()}`);
      } else {
        setError({ type: 'notfound', message: 'ID atau slug menu tidak valid' });
        setLoading(false);
        return;
      }

      const row = unwrap(resp) || null;
      if (!row) {
        setError({ type: 'notfound', message: 'Menu tidak ditemukan' });
        setLoading(false);
        return;
      }

      setMenu(normalizeMenuRow(row, idParam ?? slugParam));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching menu detail', err);
      if (err?.response?.status === 404) {
        setError({ type: 'notfound', message: 'Menu tidak ditemukan' });
      } else if (err?.request) {
        // network / CORS / server unreachable
        setError({ type: 'network', message: 'Gagal terhubung ke server. Periksa koneksi Anda.' });
      } else {
        setError({ type: 'other', message: 'Terjadi kesalahan saat memuat data.' });
      }
      setMenu(null);
      setLoading(false);
    }
  }, [idParam, slugParam]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-pulse">
            <div className="w-full h-96 bg-gray-200 rounded-2xl" />
            <div className="mt-6 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-6" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if (error.type === 'notfound') {
      return (
        <div className="min-h-screen pt-28 text-center p-8">
          <h1 className="text-3xl font-bold text-red-600">404: Menu Tidak Ditemukan</h1>
          <p className="text-gray-600 mt-4">{error.message}</p>
          <Link to="/" className="text-green-600 hover:underline">Kembali ke Beranda</Link>
        </div>
      );
    }

    return (
      <div className="min-h-screen pt-28 text-center p-8">
        <h1 className="text-2xl font-bold text-red-600">Gagal Memuat</h1>
        <p className="text-gray-600 mt-4">{error.message}</p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <button onClick={() => fetchMenu()} className="px-4 py-2 bg-green-600 text-white rounded-lg">Coba Lagi</button>
          <Link to="/" className="text-green-600 hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen pt-28 text-center p-8">
        <h1 className="text-3xl font-bold text-red-600">404: Menu Tidak Ditemukan</h1>
        <p className="text-gray-600 mt-4">Maaf, menu dengan ID {idParam ?? slugParam} tidak dapat ditemukan. Kembali ke{' '}
          <Link to="/" className="text-green-600 hover:underline">Beranda</Link>.
        </p>
      </div>
    );
  }

  const waLink = `https://wa.me/${menu.restaurant.phone}?text=Halo%20${menu.restaurant.name},%20Saya%20tertarik%20dengan%20menu%20${menu.name}.`;

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* LEFT — Image + Restaurant Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="lg:sticky lg:top-28 h-fit">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-green-500/50">
              <img
                src={menu.image}
                alt={menu.name}
                className="w-full h-96 object-cover"
                onLoad={(e) => {
                  try {
                    const img = e && e.target;
                    if (img && img.naturalWidth) {
                      console.debug('[MenuDetailPage] image load:', { src: img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
                    }
                  } catch (err) { /* ignore */ }
                }}
              />
            </div>

            {/* Seller Info */}
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Utensils className="w-6 h-6 text-green-500" /> Informasi Penjual
              </h3>

              {/* Use safe slug fallback */}
              <Link to={`/restaurant/${menu.restaurant?.slug || (menu.restaurant?.name || menu.nama_restoran || '').toLowerCase().replace(/\s+/g,'-').replace(/[^\w-]+/g,'')}`} className="text-base font-semibold text-gray-700 mb-2 hover:text-green-600 transition-colors underline">
                {menu.restaurant.name}
              </Link>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm">{menu.restaurant.address} - ({menu.restaurant.distance})</p>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <p className="text-sm font-semibold">Buka (Tutup jam 21:00)</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-500/50 hover:scale-[1.01]">
                  <Phone className="w-5 h-5" /> Hubungi (WA)
                </a>

                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-300 hover:scale-[1.01]">
                  <MapPin className="w-5 h-5" /> Lihat Lokasi
                </button>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Menu Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-8">
            <div className="space-y-4">
              <span className={`px-4 py-1 rounded-full text-sm font-bold shadow-md ${menu.category === "Vegetarian" ? "bg-green-100 text-green-700 border border-green-300" : "bg-blue-100 text-blue-700 border border-blue-300"}`}>
                {menu.category}
              </span>

              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">{menu.name}</h1>

              {Array.isArray(menu.diet_claims) && menu.diet_claims.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {menu.diet_claims.map((d, i) => <span key={i} className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-800 border border-green-100">{d}</span>)}
                </div>
              )}

              <div className="flex items-center gap-4 text-xl">
                <span className="text-green-600 font-extrabold">Rp {menu.price}</span>

                <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                  <Star className="w-5 h-5 fill-current" />
                  <span>{menu.rating.toFixed(1)}</span>
                </div>

                <span className="text-gray-500 text-base">| {menu.reviews} Terjual</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Deskripsi dan Komposisi</h2>
              <p className="text-gray-700 leading-relaxed">{menu.description}</p>

              <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500 shadow-inner">
                <p className="text-sm font-semibold text-green-700 mb-1">Klaim Menu:</p>
                <p className="text-lg font-extrabold text-green-800 flex items-center gap-2"><CheckCircle className="w-6 h-6" /> {menu.healthTag}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                <div className="p-4">
                  <h4 className="font-semibold text-gray-700 mb-1">Bahan Utama:</h4>
                  <p className="text-sm text-gray-600">{menu.ingredients.join(", ")}.</p>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-700 mb-1">Metode Masak:</h4>
                  <p className="text-sm text-gray-600">{menu.cookingMethod}</p>
                </div>
                {menu.allergens.length > 0 && (
                  <div className="p-4 bg-red-50">
                    <h4 className="font-semibold text-red-700 mb-1 flex items-center gap-2"><AlertTriangle size={18} /> Peringatan Alergen:</h4>
                    <p className="text-sm text-red-600">{menu.allergens.join(", ")}.</p>
                  </div>
                )}
              </div>

              <button onClick={() => setShowNutritionModal(true)} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg">
                <Save className="w-5 h-5" /> Lihat Tabel Nilai Gizi Rinci
              </button>
            </div>

            {/* REVIEWS (NEW COMPONENT) */}
            <div>
              <MenuReviewSection menuId={menu.id} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Nutrition Modal */}
      <AnimatePresence>
        {showNutritionModal && (
          <NutritionModal
            data={menu.nutrition}
            onClose={() => setShowNutritionModal(false)}
            menu={menu}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
