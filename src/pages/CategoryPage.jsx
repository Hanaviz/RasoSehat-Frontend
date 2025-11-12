import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, Star, Utensils, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data - Simulasi hasil per kategori
const mockCategoryData = {
  'rendah-gula': {
    name: 'Rendah Gula',
    description: 'Pilihan menu yang dirancang khusus dengan pemanis alami atau tanpa gula tambahan, ideal untuk penderita diabetes atau mereka yang menjalani diet rendah gula.',
    colorClass: 'bg-red-500/10 text-red-700 border-red-300',
    results: [
      { id: 4, name: "Oatmeal Stevia Beri", slug: 'oatmeal-rendah-gula', restaurant: 'Morning Boost', price: '15.000', rating: 4.5, distance: 2.1, healthTag: 'Sarapan Sehat', image: 'https://images.unsplash.com/photo-1586523299778-e56847c234a6?w=400&h=300&fit=crop', time: '5-10 menit' },
      { id: 5, name: "Smoothie Protein Cokelat", slug: 'smoothie-protein', restaurant: 'Fresh Fuel', price: '30.000', rating: 4.7, distance: 1.5, healthTag: 'Tinggi Protein', image: 'https://images.unsplash.com/photo-1559132179-88029676e8a8?w=400&h=300&fit=crop', time: '10-15 menit' }
    ]
  },
  'rendah-kalori': {
    name: 'Rendah Kalori',
    description: 'Menu yang difokuskan untuk membantu program penurunan berat badan atau menjaga asupan kalori harian. Setiap porsi dijamin di bawah 500 Kkal.',
    colorClass: 'bg-green-500/10 text-green-700 border-green-300',
    results: [
      { id: 2, name: "Green Goddess Smoothie", slug: 'green-goddess-smoothie', restaurant: 'Fresh Juice Bar', price: '18.000', rating: 4.6, distance: 0.8, healthTag: 'Tinggi Protein', image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400&h=300&fit=crop', time: '5-10 menit' },
      { id: 6, name: "Salad Ayam Panggang", slug: 'salad-ayam', restaurant: 'Grill Sehat', price: '35.000', rating: 4.4, distance: 1.0, healthTag: 'Rendah Karbo', image: 'https://images.unsplash.com/photo-1540189549336-e6113b295982?w=400&h=300&fit=crop', time: '10-15 menit' }
    ]
  },
  'tinggi-protein': {
    name: 'Tinggi Protein',
    description: 'Makanan yang ideal untuk para atlet, pecinta fitness, atau siapa saja yang ingin meningkatkan massa otot. Kaya akan protein hewani dan nabati.',
    colorClass: 'bg-blue-500/10 text-blue-700 border-blue-300',
    results: [
      { id: 3, name: "Ayam Panggang Keto", slug: 'ayam-panggang-keto', restaurant: 'Keto Kitchen Padang', price: '45.000', rating: 4.9, distance: 1.2, healthTag: 'Rendah Karbo', image: 'https://images.unsplash.com/photo-1559400262-e2c7a5f973c9?w=400&h=300&fit=crop', time: '25-30 menit' }
    ]
  }
};

// Komponen Card Hasil Pencarian (Diambil dari SearchResultsPage)
const ResultCard = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
    >
      <Link to={`/menu/${item.slug}`} className="block">
        <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
      </Link>
      
      <div className="p-4 space-y-2">
        <Link to={`/menu/${item.slug}`}>
            <h3 className="text-lg font-bold text-gray-800 hover:text-green-600 transition-colors">{item.name}</h3>
        </Link>
        <div className="flex items-center justify-between text-sm text-gray-500">
            <p className="font-semibold text-gray-700">{item.restaurant}</p>
            <div className={`px-2 py-0.5 rounded text-xs font-semibold ${
                item.healthTag.includes('Rendah') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
                {item.healthTag}
            </div>
        </div>

        <div className="flex items-center justify-between border-t pt-2 border-gray-100">
          <div className="flex items-center gap-1 text-yellow-500 text-sm">
            <Star className="w-4 h-4 fill-current"/>
            <span className="font-semibold text-gray-700">{item.rating}</span>
          </div>
          <p className="flex items-center gap-1 text-xs text-gray-600">
            <MapPin className="w-3 h-3"/> {item.distance} km
          </p>
          <p className="text-green-600 font-bold">Rp {item.price}</p>
        </div>
      </div>
    </motion.div>
);

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const categoryInfo = mockCategoryData[categorySlug];
  
  if (!categoryInfo) {
    return (
      <div className="min-h-screen pt-28 text-center p-8">
        <h1 className="text-3xl font-bold text-red-600">404: Kategori Tidak Ditemukan</h1>
        <p className="text-gray-600 mt-4">Kategori {categorySlug} belum tersedia. Kembali ke <Link to="/" className="text-green-600 hover:underline">Beranda</Link>.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Kategori */}
        <div className={`mb-8 p-6 rounded-2xl shadow-xl border-t-8 ${categoryInfo.colorClass} border-green-500/50 bg-white`}>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 flex items-center gap-3">
                <Utensils className='w-8 h-8 text-green-600'/> {categoryInfo.name}
            </h1>
            <p className="text-gray-600 mt-3 text-base max-w-3xl">
                {categoryInfo.description}
            </p>
            <p className="text-sm font-semibold text-green-700 mt-3">
                Ditemukan **{categoryInfo.results.length}** menu sehat di kategori ini.
            </p>
        </div>

        {/* Filter & Konten */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Kolom Kiri: Filter Sidebar (Disederhanakan untuk Kategori Page) */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-5 space-y-4 sticky top-28 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-3 mb-2">
                        <Filter className='w-5 h-5'/> Saring Menu
                    </h3>
                    
                    {/* Filter Kriteria Tambahan */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 text-sm">Rating Minimum:</h4>
                        <input type="range" min="0" max="5" step="0.5" className="w-full h-2 bg-gray-200 rounded-lg"/>
                    </div>
                    
                    {/* Filter Tipe Makanan */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        <h4 className="font-semibold text-gray-700 text-sm">Tipe Makanan:</h4>
                        <select className="select select-sm select-bordered w-full text-sm bg-gray-50">
                            <option>Semua Tipe</option>
                            <option>Main Course</option>
                            <option>Snack / Dessert</option>
                            <option>Minuman</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Kolom Kanan: Daftar Hasil */}
            <div className="lg:col-span-3">
                {categoryInfo.results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryInfo.results.map(item => (
                            <ResultCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
                        <p className="text-xl font-semibold text-gray-700">Belum ada menu di kategori ini.</p>
                        <p className="text-gray-500 mt-2">Segera daftar menu Anda jika memenuhi kriteria **{categoryInfo.name}**!</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}