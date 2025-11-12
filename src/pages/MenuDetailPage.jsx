import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  Star,
  Phone,
  Utensils,
  Heart,
  AlertTriangle,
  MessageSquare,
  ChevronDown,
  CheckCircle,
  Save,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data - Ganti ini dengan pemanggilan API Laravel nanti
const mockMenuData = {
  "buddha-bowl": {
    name: "Rainbow Buddha Bowl",
    slug: "buddha-bowl",
    category: "Vegetarian",
    healthTag: "Seimbang & Rendah Kolesterol",
    price: "25.000",
    rating: 4.8,
    reviews: 125,
    description:
      "Bowl sehati dengan Quinoa organik, campuran sayuran segar, alpukat, buncis, chickpeas, dan dressing tahini lemon mustard. Rasanya ringan, menyegarkan, dan sangat mengenyangkan.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    restaurant: {
      name: "Healthy Corner",
      address: "Jl. Limau Manih No. 12, Padang",
      phone: "62812xxxxxxx", // Ganti dengan nomor WA asli
      distance: "0.5 km",
    },
    nutrition: {
      servingSize: "1 porsi (350g)",
      calories: "420 Kkal",
      protein: "22g",
      carbs: "55g",
      fat: "15g",
      fiber: "12g",
      sugar: "6g",
      sodium: "150mg",
      cholesterol: "0mg",
    },
    ingredients: [
      "Quinoa Organik",
      "Baby Spinach",
      "Tomat Cherry",
      "Alpukat",
      "Buncis Rebus",
      "Tahini Dressing",
      "Lemon Mustard",
    ],
    cookingMethod:
      "Semua bahan disajikan mentah/rebus, dressing dibuat tanpa gula tambahan.",
    allergens: ["Sesame (from Tahini)"],
    verified: true,
  },
};

const NutritionModal = ({ data, onClose }) => {
  const nutritionPoints = [
    {
      label: "Kalori Total",
      value: data.calories,
      unit: "Kkal",
      color: "text-red-500",
    },
    {
      label: "Protein",
      value: data.protein,
      unit: "g",
      color: "text-blue-500",
    },
    {
      label: "Karbohidrat",
      value: data.carbs,
      unit: "g",
      color: "text-yellow-500",
    },
    {
      label: "Lemak Total",
      value: data.fat,
      unit: "g",
      color: "text-orange-500",
    },
    { label: "Gula", value: data.sugar, unit: "g", color: "text-red-600" },
    {
      label: "Kolesterol",
      value: data.cholesterol,
      unit: "mg",
      color: "text-green-600",
    },
    { label: "Serat", value: data.fiber, unit: "g", color: "text-green-500" },
    {
      label: "Natrium (Sodium)",
      value: data.sodium,
      unit: "mg",
      color: "text-gray-500",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-green-500">
          <h3 className="text-xl font-bold text-white">
            Detail Gizi per {data.servingSize}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {nutritionPoints.map((point, index) => (
              <div
                key={index}
                className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="text-xs font-semibold text-gray-500">
                  {point.label}
                </span>
                <span className={`text-xl font-extrabold ${point.color}`}>
                  {point.value}
                  <span className="text-base font-normal ml-1 text-gray-700">
                    {point.unit}
                  </span>
                </span>
              </div>
            ))}
          </div>
          // Inside NutritionModal, adjust the Verification section:
          <div className="mt-4 p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
              <CheckCircle size={20} />
              <span>Verifikasi RasoSehat: {menu.healthTag}</span>{" "}
              {/* Tampilkan kategori yang diverifikasi */}
            </div>
            <p className="text-sm text-gray-700">
              Menu ini telah diverifikasi oleh tim kami berdasarkan tinjauan
              **Bahan Baku** ({menu.ingredients.join(", ")}) dan **Metode
              Masak** ({menu.cookingMethod}).
            </p>
            {/* Tambahkan peringatan jika ada */}
            {menu.allergens.length > 0 && (
              <p className="text-xs text-red-500 mt-2">
                Peringatan: {menu.allergens.join(", ")}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function MenuDetailPage() {
  const { slug } = useParams();
  const menu = mockMenuData[slug] || mockMenuData["buddha-bowl"]; // Fallback
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  // Fallback jika menu tidak ditemukan
  if (!menu) {
    return (
      <div className="min-h-screen pt-28 text-center p-8">
        <h1 className="text-3xl font-bold text-red-600">
          404: Menu Tidak Ditemukan
        </h1>
        <p className="text-gray-600 mt-4">
          Maaf, menu dengan ID {slug} tidak dapat ditemukan. Kembali ke{" "}
          <Link to="/" className="text-green-600 hover:underline">
            Beranda
          </Link>
          .
        </p>
      </div>
    );
  }

  // Handle WhatsApp Link
  const waLink = `https://wa.me/${menu.restaurant.phone}?text=Halo%20${menu.restaurant.name},%20Saya%20tertarik%20dengan%20menu%20${menu.name}%20yang%20ada%20di%20RasoSehat.`;

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Kolom Kiri: Gambar dan Info Produk */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-28 h-fit"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-green-500/50">
              <img
                src={menu.image}
                alt={menu.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Tombol Konektor & Waktu (Fixed for Desktop, but still responsive) */}
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Utensils className="w-6 h-6 text-green-500" /> Informasi
                Penjual
              </h3>
              <p className="text-base font-semibold text-gray-700 mb-2">
                {menu.restaurant.name}
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm">
                    {menu.restaurant.address} - ({menu.restaurant.distance})
                  </p>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <p className="text-sm font-semibold">
                    Buka (Tutup jam 21:00)
                  </p>{" "}
                  {/* Mock Status */}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-500/50 hover:scale-[1.01]"
                >
                  <Phone className="w-5 h-5" /> Hubungi (WA)
                </a>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-300 hover:scale-[1.01]">
                  <MapPin className="w-5 h-5" /> Lihat Lokasi
                </button>
              </div>
            </div>
          </motion.div>

          {/* Kolom Kanan: Deskripsi, Gizi, & Review */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8"
          >
            {/* Header Produk */}
            <div className="space-y-4">
              <span
                className={`px-4 py-1 rounded-full text-sm font-bold shadow-md ${
                  menu.category === "Vegetarian"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-blue-100 text-blue-700 border border-blue-300"
                }`}
              >
                {menu.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                {menu.name}
              </h1>

              <div className="flex items-center gap-4 text-xl">
                <span className="text-green-600 font-extrabold">
                  Rp {menu.price}
                </span>
                <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                  <Star className="w-5 h-5 fill-current" />
                  <span>{menu.rating}</span>
                </div>
                <span className="text-gray-500 text-base">
                  | {menu.reviews} Terjual
                </span>
              </div>
            </div>

            {/* Deskripsi dan Info Gizi (Interaktif) */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
                Deskripsi dan Komposisi
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {menu.description}
              </p>

              {/* Klaim Kesehatan dan Verifikasi */}
              <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500 shadow-inner">
                <p className="text-sm font-semibold text-green-700 mb-1">
                  Klaim Menu:
                </p>
                <p className="text-lg font-extrabold text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" /> {menu.healthTag}
                </p>
              </div>

              {/* Detail Komposisi dan Cara Masak */}
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                <div className="p-4">
                  <h4 className="font-semibold text-gray-700 mb-1">
                    Bahan Utama:
                  </h4>
                  <p className="text-sm text-gray-600">
                    {menu.ingredients.join(", ")}.
                  </p>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-700 mb-1">
                    Metode Masak:
                  </h4>
                  <p className="text-sm text-gray-600">{menu.cookingMethod}</p>
                </div>
                {menu.allergens.length > 0 && (
                  <div className="p-4 bg-red-50">
                    <h4 className="font-semibold text-red-700 mb-1 flex items-center gap-2">
                      <AlertTriangle size={18} /> Peringatan Alergen:
                    </h4>
                    <p className="text-sm text-red-600">
                      {menu.allergens.join(", ")}.
                    </p>
                  </div>
                )}
              </div>

              {/* Tombol Modal Gizi */}
              <button
                onClick={() => setShowNutritionModal(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Save className="w-5 h-5" /> Lihat Tabel Nilai Gizi Rinci
              </button>
            </div>

            {/* Ulasan Produk */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-green-500" /> Penilaian
                Produk
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
                {/* Ulasan Mock-up dari gambar */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded-full">
                    Enak banget (1.3 RB)
                  </span>
                  <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded-full">
                    Sangat bergizi (800)
                  </span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full">
                    Kualitas baik (150)
                  </span>
                </div>

                {/* Contoh Review */}
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-800 italic mb-2">
                    "Gila, makanannya juara banget! Rasanya nendang di lidah,
                    bumbunya meresap sempurna. Porsinya juga pas, bikin kenyang
                    tapi nggak eneg. Cocok buat yang doyan makan tapi pengen
                    yang gak ribet. Wajib coba deh, dijamin ketagihan!"
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    N******k* | 1 minggu lalu
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal untuk Detail Gizi */}
      <AnimatePresence>
        {showNutritionModal && (
          <NutritionModal
            data={menu.nutrition}
            onClose={() => setShowNutritionModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
