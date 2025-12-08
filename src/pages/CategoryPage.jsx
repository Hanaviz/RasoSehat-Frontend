import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroMenuCard from '../components/HeroMenuCard';
import api, { unwrap, makeImageUrl } from '../utils/api';

// Static categories (same as HeroSection) to resolve slug -> display name
const allCategories = [
  { name: 'Rendah Gula', slug: 'rendah-gula' },
  { name: 'Rendah Kalori', slug: 'rendah-kalori' },
  { name: 'Tinggi Protein', slug: 'tinggi-protein' },
  { name: 'Seimbang', slug: 'seimbang' },
  { name: 'Vegetarian / Vegan', slug: 'vegetarian-vegan' },
  { name: 'Rendah Lemak Jenuh', slug: 'rendah-lemak-jenuh' },
  { name: 'Kids Friendly', slug: 'kids-friendly' },
  { name: 'Gluten Free', slug: 'gluten-free' },
  { name: 'Organik', slug: 'organik' },
];

// Map display category names to backend diet_claim keys (same as HeroSection)
const claimKeyMap = {
  'Rendah Kalori': 'low_calorie',
  'Rendah Gula': 'low_sugar',
  'Tinggi Protein': 'high_protein',
  'Tinggi Serat': 'high_fiber',
  'Seimbang': 'balanced',
  'Vegetarian / Vegan': 'vegan',
  'Rendah Lemak Jenuh': 'low_saturated_fat',
  'Kids Friendly': 'kids_friendly',
  'Gluten Free': 'gluten_free',
  'Organik': 'organic'
};

export default function CategoryPage() {
  const { categorySlug } = useParams();
  // find category metadata
  const categoryMeta = allCategories.find((c) => c.slug === categorySlug);
  if (!categoryMeta) {
    return (
      <div className="min-h-screen pt-28 text-center p-8">
        <h1 className="text-3xl font-bold text-red-600">404: Kategori Tidak Ditemukan</h1>
        <p className="text-gray-600 mt-4">Kategori {categorySlug} belum tersedia. Kembali ke <Link to="/" className="text-green-600 hover:underline">Beranda</Link>.</p>
      </div>
    );
  }

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchByCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const displayName = categoryMeta.name;
        const key = claimKeyMap[displayName];
        if (!key) throw new Error('Kategori tidak didukung oleh mapping klaim.');
        const resp = await api.get(`/menus/by-category/${encodeURIComponent(key)}`);
        const payload = unwrap(resp) || [];
        if (cancelled) return;
        const normalized = (payload || []).map((m) => {
          const restaurantName = m.nama_restoran || m.restaurant_name || m.restaurant || '';
          const restaurantSlug = (restaurantName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
          const name = m.nama_menu || m.name || '';
          const slug = m.slug || (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
          return {
            id: m.id,
            name,
            slug,
            price: m.harga || m.price || 0,
            rating: m.rating || 4.5,
            prepTime: m.prepTime || m.time || '10-20 min',
            image: makeImageUrl(m.foto || m.image) || 'https://placehold.co/400x300/4ade80/white?text=RasoSehat',
            restaurantName,
            restaurantSlug,
            description: m.deskripsi || m.description || '',
            isVerified: (m.status_verifikasi === 'disetujui') || false,
            calories: m.kalori || m.calories || null,
          };
        });
        setMenus(normalized);
      } catch (e) {
        console.error('[CategoryPage] fetch error', e);
        setError(e?.message || String(e));
        setMenus([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchByCategory();
    return () => { cancelled = true; };
  }, [categorySlug]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Kategori */}
        <div className={`mb-8 p-6 rounded-2xl shadow-xl border-t-8 bg-white`}>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 flex items-center gap-3">
                <Utensils className='w-8 h-8 text-green-600'/> {categoryMeta.name}
            </h1>
            <p className="text-gray-600 mt-3 text-base max-w-3xl">
                Menampilkan menu untuk kategori {categoryMeta.name}.
            </p>
            <p className="text-sm font-semibold text-green-700 mt-3">
                Ditemukan **{menus.length}** menu sehat di kategori ini.
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
                {loading ? (
                    <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">Loading...</div>
                ) : error ? (
                    <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">Error: {error}</div>
                ) : menus.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
                        <p className="text-xl font-semibold text-gray-700">Belum ada menu untuk kategori ini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menus.map((m) => (
                            <HeroMenuCard key={m.id} menu={m} />
                        ))}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}