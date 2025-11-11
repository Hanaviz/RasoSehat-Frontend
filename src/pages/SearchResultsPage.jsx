import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Search, MapPin, Star, Utensils, Heart, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data - Simulasi hasil dari Laravel API
const mockResults = [
  {
    id: 1,
    name: "Rainbow Buddha Bowl",
    slug: 'buddha-bowl',
    restaurant: 'Healthy Corner',
    price: '25.000',
    rating: 4.8,
    distance: 0.5,
    category: 'Vegetarian',
    healthTag: 'Rendah Kolesterol',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    description: "Bowl sehati dengan Quinoa, sayuran segar, alpukat, dan dressing lemon mustard.",
    time: '15-20 menit'
  },
  {
    id: 2,
    name: "Green Goddess Smoothie",
    slug: 'green-goddess-smoothie',
    restaurant: 'Fresh Juice Bar',
    price: '18.000',
    rating: 4.6,
    distance: 0.8,
    category: 'Rendah Kalori',
    healthTag: 'Tinggi Protein',
    image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400&h=300&fit=crop',
    description: "Smoothie hijau dengan bayam, pisang, alpukat, dan protein powder.",
    time: '5-10 menit'
  },
  {
    id: 3,
    name: "Ayam Panggang Keto",
    slug: 'ayam-panggang-keto',
    restaurant: 'Keto Kitchen Padang',
    price: '45.000',
    rating: 4.9,
    distance: 1.2,
    category: 'Tinggi Protein',
    healthTag: 'Rendah Karbo',
    image: 'https://images.unsplash.com/photo-1559400262-e2c7a5f973c9?w=400&h=300&fit=crop',
    description: "Paha ayam tanpa kulit dipanggang dengan bumbu rempah dan sayuran hijau.",
    time: '25-30 menit'
  },
  {
    id: 4,
    name: "Oatmeal Rendah Gula",
    slug: 'oatmeal-rendah-gula',
    restaurant: 'Morning Boost',
    price: '15.000',
    rating: 4.5,
    distance: 2.1,
    category: 'Rendah Gula',
    healthTag: 'Sarapan Sehat',
    image: 'https://images.unsplash.com/photo-1586523299778-e56847c234a6?w=400&h=300&fit=crop',
    description: "Oatmeal dengan buah beri dan pemanis alami Stevia.",
    time: '5-10 menit'
  }
];

const categories = [
  'Semua Kategori', 'Rendah Kalori', 'Rendah Gula', 'Tinggi Protein', 'Seimbang', 'Vegetarian'
];

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  // State Filter
  const [activeFilter, setActiveFilter] = useState('Semua Kategori');
  const [minRating, setMinRating] = useState(0);
  const [results, setResults] = useState(mockResults);
  const [filteredResults, setFilteredResults] = useState(mockResults);

  useEffect(() => {
    // 1. (API INTEGRATION STEP): Panggil API Laravel di sini 
    // const fetchedResults = await axios.get(`/api/search?q=${initialQuery}`); 
    // setResults(fetchedResults.data); 
    
    // 2. Terapkan Filter
    const applyFilters = () => {
      let tempResults = results.filter(item => {
        // Filter Kategori
        if (activeFilter !== 'Semua Kategori' && item.category !== activeFilter) {
          return false;
        }
        // Filter Rating
        if (item.rating < minRating) {
          return false;
        }
        // Filter Query (simulasi pencarian)
        if (initialQuery && !item.name.toLowerCase().includes(initialQuery.toLowerCase())) {
            return false;
        }
        return true;
      });
      setFilteredResults(tempResults);
    };

    applyFilters();
  }, [initialQuery, activeFilter, minRating, results]);


  // Komponen Card Hasil Pencarian
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

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Pencarian */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-md border-t-4 border-green-500">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Search className='w-7 h-7 text-green-600'/> Hasil Pencarian
            </h1>
            <p className="text-gray-600 mt-2 text-base">
                Menampilkan **{filteredResults.length}** menu untuk: 
                <span className="font-semibold text-green-700 ml-1">"{initialQuery || 'Semua'}"</span>
            </p>
        </div>

        {/* Layout Filter dan Hasil */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Kolom Kiri: Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-5 space-y-6 sticky top-28 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-3 mb-2">
                <Filter className='w-5 h-5'/> Filter Sehat
              </h3>

              {/* Filter Kategori Kesehatan */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Kategori Menu:</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveFilter(category)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                        activeFilter === category
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Rating */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-700">Minimum Rating: <span className='text-green-600'>{minRating || 'Semua'} Bintang</span></h4>
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
                <h4 className="font-semibold text-gray-700">Jarak Maksimum (km):</h4>
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
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredResults.map(item => (
                  <ResultCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
                <p className="text-xl font-semibold text-gray-700">Tidak ada hasil ditemukan.</p>
                <p className="text-gray-500 mt-2">Coba ganti kata kunci atau longgarkan filter Anda.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}