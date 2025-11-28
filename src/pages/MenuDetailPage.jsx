import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Clock, MapPin, Star, Phone, Utensils, AlertTriangle, MessageSquare, CheckCircle, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from '../utils/api';

// Normalizer: map backend row -> UI-friendly menu object
function normalizeMenuRow(row, idFallback) {
  if (!row) return null;

  // diet_claims: can be array, JSON-string, comma-separated string, or null
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

  return {
    id: row.id ?? idFallback,
    name,
    slug: row.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    category: row.kategori || dietClaims[0] || 'Umum',
    healthTag: dietClaims[0] || 'Sehat',
    price: row.harga ?? row.price ?? '0',
    rating: Number(row.rating) || 4.5,
    reviews: Number(row.reviews) || 0,
    description: row.deskripsi ?? row.description ?? '',
    image: row.foto ?? row.image ?? 'https://placehold.co/800x600/4ade80/white?text=RasoSehat',
    restaurant: {
      name: row.nama_restoran || row.restaurant_name || 'Restoran',
      slug: (row.nama_restoran || row.restaurant_name || 'restoran').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      address: row.alamat || row.address || '',
      phone: row.no_telepon || row.phone || '',
      distance: row.distance || '',
    },
    nutrition: {
      servingSize: row.porsi || row.serving_size || '1 porsi',
      calories: row.kalori ?? row.calories ?? 0,
      protein: row.protein ?? row.protein ?? '0',
      carbs: row.karbohidrat ?? row.carbs ?? '0',
      fat: row.lemak ?? '0',
      fiber: row.serat ?? '0',
      sugar: row.gula ?? '0',
      sodium: row.sodium ?? '0',
      cholesterol: row.kolesterol ?? '0',
    },
    // backend may use `bahan_baku` or `ingredients`
    ingredients: (row.bahan_baku && typeof row.bahan_baku === 'string' ? row.bahan_baku.split(',').map(s => s.trim()) : (row.ingredients || [])) || [],
    cookingMethod: row.metode_masak || row.cooking_method || '',
    allergens: (row.allergens && typeof row.allergens === 'string' ? row.allergens.split(',').map(s => s.trim()) : row.allergens) || [],
    diet_claims: dietClaims,
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
    { label: "Natrium (Sodium)", value: data.sodium, unit: "mg", color: "text-gray-500" },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-green-500">
          <h3 className="text-xl font-bold text-white">Detail Gizi per {data.servingSize}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {nutritionPoints.map((point, index) => (
              <div key={index} className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-xs font-semibold text-gray-500">{point.label}</span>
                <span className={`text-xl font-extrabold ${point.color}`}>
                  {point.value}
                  <span className="text-base font-normal ml-1 text-gray-700">{point.unit}</span>
                </span>
              </div>
            ))}
          </div>

          {menu && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
              <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                <CheckCircle size={20} />
                <span>Verifikasi RasoSehat: {menu.healthTag}</span>
              </div>
              <p className="text-sm text-gray-700">Menu ini telah diverifikasi oleh tim kami berdasarkan tinjauan bahan baku dan metode masak.</p>
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
  // The app route is /menu/:slug in App.jsx; sometimes we navigate with numeric id.
  // Accept either `id` or `slug` from useParams, and treat a numeric param as an ID.
  const { id: idParam, slug: slugParam } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  // local reviews stored keyed by menu slug or id
  const reviewsKey = `rs_menu_reviews_${menu?.slug || idParam || slugParam}`;
  const [localReviews, setLocalReviews] = useState([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMedia, setReviewMedia] = useState(null);
  const fileInputRef = React.createRef();

  const handleMediaSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const type = file.type.startsWith('video') ? 'video' : 'image';
    const reader = new FileReader();
    reader.onload = () => setReviewMedia({ type, dataUrl: reader.result, name: file.name });
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(reviewsKey);
      if (raw) setLocalReviews(JSON.parse(raw));
    } catch (err) { console.warn("Failed to load menu reviews", err); }
  }, [reviewsKey]);

  // Fetch detail using id (numeric) or slug (string)
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let resp;
      // if idParam or slugParam contains a numeric value -> treat as ID
      const numericCandidate = idParam ?? slugParam;
      if (numericCandidate && /^\d+$/.test(String(numericCandidate))) {
        resp = await api.get(`/menus/${encodeURIComponent(numericCandidate)}`);
      } else if (slugParam) {
        resp = await api.get(`/menus/slug/${encodeURIComponent(slugParam)}`);
      } else {
        setError({ type: 'notfound', message: 'ID atau slug menu tidak diberikan' });
        setMenu(null);
        setLoading(false);
        return;
      }

      // Backend may return the menu object directly, or wrap it as { data: ... } or { menu: ... }
      const row = resp?.data?.data ?? resp?.data?.menu ?? resp?.data;
      if (!row) {
        setError({ type: 'notfound', message: 'Menu tidak ditemukan' });
        setMenu(null);
        setLoading(false);
        return;
      }

      const mapped = normalizeMenuRow(row, idParam ?? slugParam);
      setMenu(mapped);
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
    let mounted = true;
    if (mounted) fetchMenu();
    return () => { mounted = false; };
  }, [fetchMenu]);

  const totalMenuReviews = useMemo(() => (menu?.reviews || 0) + localReviews.length, [menu?.reviews, localReviews]);
  const computedMenuAverage = useMemo(() => {
    const localSum = localReviews.reduce((s, r) => s + Number(r.rating || 0), 0);
    const baseReviews = menu?.reviews || 0;
    const baseRating = menu?.rating || 0;
    const total = baseReviews + localReviews.length;
    if (total === 0) return baseRating || 0;
    return ((baseRating * baseReviews) + localSum) / total;
  }, [menu?.rating, menu?.reviews, localReviews]);

  const handleSubmitMenuReview = (e) => {
    e.preventDefault();
    const name = reviewName.trim() || "Anonim";
    const rating = Number(reviewRating) || 0;
    const comment = reviewComment.trim();
    if (rating < 1 || rating > 5) return alert("Rating harus antara 1 dan 5");
    if (!comment) return alert("Tolong isi komentar ulasan Anda.");
    const newR = { id: Date.now(), name, rating, comment, date: new Date().toISOString(), media: reviewMedia };
    const updated = [newR, ...localReviews];
    setLocalReviews(updated);
    try { localStorage.setItem(reviewsKey, JSON.stringify(updated)); } catch (err) { console.warn(err); }
    setReviewName(""); setReviewRating(5); setReviewComment("");
  };

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

  const waLink = `https://wa.me/${menu.restaurant.phone}?text=Halo%20${menu.restaurant.name},%20Saya%20tertarik%20dengan%20menu%20${menu.name}%20yang%20ada%20di%20RasoSehat.`;

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="lg:sticky lg:top-28 h-fit">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-green-500/50">
              <img src={menu.image} alt={menu.name} className="w-full h-96 object-cover" />
            </div>

            <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Utensils className="w-6 h-6 text-green-500" /> Informasi Penjual
              </h3>
              <Link to={`/restaurant/${menu.restaurant.slug}`} className="text-base font-semibold text-gray-700 mb-2 hover:text-green-600 transition-colors underline">
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
                  <span>{computedMenuAverage.toFixed(1)}</span>
                </div>
                <span className="text-gray-500 text-base">| {totalMenuReviews} Terjual</span>
              </div>
            </div>

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

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><MessageSquare className="w-6 h-6 text-green-500" /> Penilaian Produk</h2>
              <div className="bg-gray-50 rounded-xl p-4 shadow-inner space-y-4">
                {/* review tags, form, local reviews (unchanged) */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded-full">Enak banget (1.3 RB)</span>
                  <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded-full">Sangat bergizi (800)</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full">Kualitas baik (150)</span>
                </div>

                <form onSubmit={handleSubmitMenuReview} className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <input value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Nama (opsional)" className="col-span-2 px-3 py-2 border rounded-lg" />
                    <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} className="px-3 py-2 border rounded-lg">
                      <option value={5}>5 — Sangat Baik</option>
                      <option value={4}>4 — Bagus</option>
                      <option value={3}>3 — Cukup</option>
                      <option value={2}>2 — Kurang</option>
                      <option value={1}>1 — Buruk</option>
                    </select>
                  </div>
                  <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} placeholder="Tulis komentar singkat tentang menu..." className="w-full px-3 py-2 border rounded-lg mb-3" />
                  <div className="flex items-center gap-3 mb-3">
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaSelect} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm">Tambah Foto/Video</button>
                    {reviewMedia && (
                      <div className="flex items-center gap-2">
                        {reviewMedia.type === 'image' ? <img src={reviewMedia.dataUrl} alt={reviewMedia.name} className="w-16 h-16 object-cover rounded-md border" /> : <video src={reviewMedia.dataUrl} className="w-24 h-16 rounded-md border" />}
                        <button type="button" onClick={() => setReviewMedia(null)} className="text-xs text-red-600">Hapus</button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg">Kirim Ulasan</button>
                  </div>
                </form>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Ulasan Lokal Terbaru</h4>
                  {localReviews.length === 0 ? <div className="text-sm text-gray-600">Belum ada ulasan lokal. Jadilah yang pertama!</div> : (
                    <div className="space-y-3">
                      {localReviews.map(r => (
                        <div key={r.id} className="bg-white p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-sm">{r.name}</div>
                            <div className="flex items-center text-yellow-500 text-sm">{r.rating} <Star className="w-4 h-4 fill-current ml-1" /></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{new Date(r.date).toLocaleString()}</p>
                          <p className="mt-2 text-gray-700 text-sm">{r.comment}</p>
                          {r.media && (
                            <div className="mt-3">{r.media.type === 'image' ? <img src={r.media.dataUrl} alt={r.media.name} className="w-full max-h-60 object-cover rounded-lg" /> : <video src={r.media.dataUrl} controls className="w-full max-h-60 rounded-lg" />}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showNutritionModal && <NutritionModal data={menu.nutrition} onClose={() => setShowNutritionModal(false)} menu={menu} />}
      </AnimatePresence>
    </div>
  );
}