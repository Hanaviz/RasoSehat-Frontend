import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Utensils, MapPin, Star, Phone, Clock, MessageSquare, Briefcase, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data (Simulasi data Restoran dari API Laravel)
const mockRestaurantData = {
  'healthy-corner': {
    id: 1,
    name: 'Healthy Corner',
    slug: 'healthy-corner',
    description: 'Pusat makanan sehat harian dengan fokus rendah kalori dan tinggi protein, menyajikan hidangan segar untuk mahasiswa Unand dan sekitarnya.',
    address: 'Jl. Limau Manih No. 12, Padang',
    latitude: -0.9144, // Contoh koordinat Padang
    longitude: 100.4650,
    whatsapp: '6281234567890',
    socialMedia: 'instagram.com/healthycornerpadang',
    operatingHours: 'Senin - Sabtu: 09:00 - 21:00',
    rating: 4.8,
    reviewsCount: 150,
    jenisUsaha: 'Perorangan',
    verified: true,
    // Data Menu (Hanya contoh)
    menu: [
        { id: 1, name: "Rainbow Buddha Bowl", slug: 'buddha-bowl', price: '25.000', healthTag: 'Rendah Kolesterol', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
        { id: 2, name: "Ayam Panggang Keto", slug: 'ayam-panggang-keto', price: '45.000', healthTag: 'Tinggi Protein', image: 'https://images.unsplash.com/photo-1559400262-e2c7a5f973c9?w=400&h=300&fit=crop' },
        { id: 3, name: "Smoothie Green Goddess", slug: 'green-goddess-smoothie', price: '18.000', healthTag: 'Rendah Kalori', image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400&h=300&fit=crop' },
    ],
  },
};

// Komponen Reusable Card Menu
const MenuCard = ({ menu }) => (
    <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex hover:shadow-xl transition-shadow duration-300"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <img src={menu.image} alt={menu.name} className="w-24 h-24 object-cover flex-shrink-0" />
        <div className="p-3 flex-1">
            <Link to={`/menu/${menu.slug}`} className="font-bold text-gray-800 hover:text-green-600 transition-colors text-base line-clamp-1">
                {menu.name}
            </Link>
            <div className={`mt-1 px-2 py-0.5 rounded text-xs font-semibold w-fit ${
                menu.healthTag.includes('Rendah') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
                {menu.healthTag}
            </div>
            <p className="text-green-600 font-extrabold text-lg mt-1">Rp {menu.price}</p>
        </div>
    </motion.div>
);


export default function RestaurantDetailPage() {
    const { slug } = useParams();
    const restaurant = mockRestaurantData[slug] || mockRestaurantData['healthy-corner'];

    if (!restaurant) {
        return <div className="min-h-screen pt-28 text-center p-8"><h1 className="text-3xl font-bold text-red-600">404: Toko Tidak Ditemukan</h1></div>;
    }

    const waLink = `https://wa.me/${restaurant.whatsapp}?text=Halo%20${restaurant.name},%20Saya%20ingin%20bertanya%20mengenai%20menu%20sehat%20Anda.`;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Utama Restoran */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border-t-8 border-green-500 mb-8"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{restaurant.name}</h1>
                            <p className="text-lg text-gray-600 max-w-3xl">{restaurant.description}</p>
                            
                            <div className="flex items-center gap-4 mt-3 text-sm">
                                <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                                    <Star className="w-4 h-4 fill-current"/> {restaurant.rating} ({restaurant.reviewsCount} Ulasan)
                                </span>
                                <span className="flex items-center gap-1 text-gray-600">
                                    <Briefcase className="w-4 h-4"/> Jenis Usaha: {restaurant.jenisUsaha}
                                </span>
                            </div>
                        </div>
                        
                        {/* Status (Mock) */}
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm flex-shrink-0">
                            <CheckCircle className="w-4 h-4 inline mr-1" /> Terverifikasi RasoSehat
                        </div>
                    </div>
                </motion.div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Kolom Kiri: Detail Kontak & Info */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Kartu Kontak & Operasional (Sticky) */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-green-600"/> Hubungi & Lokasi
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-gray-700">Alamat</p>
                                        <p className="text-sm text-gray-600">{restaurant.address}</p>
                                        <a 
                                            href={`https://maps.google.com/?q=${restaurant.latitude},${restaurant.longitude}`}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:underline"
                                        >
                                            Lihat di Google Maps
                                        </a>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-700">Jam Operasional</p>
                                        <p className="text-sm text-gray-600">{restaurant.operatingHours}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Tombol Aksi Cepat */}
                            <div className="mt-6 space-y-3">
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
                                >
                                    <Phone className="w-5 h-5"/> Chat via WhatsApp
                                </a>
                                {restaurant.socialMedia && (
                                    <a
                                        href={`https://${restaurant.socialMedia}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-300"
                                    >
                                        <Globe className="w-5 h-5"/> Kunjungi Sosial Media
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Menu dan Ulasan */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Daftar Menu */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
                        >
                            <h3 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-2 flex items-center gap-2">
                                <Utensils className="w-6 h-6 text-green-600"/> Menu Sehat ({restaurant.menu.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {restaurant.menu.map(menu => (
                                    <MenuCard key={menu.id} menu={menu} />
                                ))}
                            </div>
                        </motion.div>

                        {/* Ulasan */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
                        >
                            <h3 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-2 flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-green-600"/> Ulasan Pengguna
                            </h3>
                            <div className="text-center p-8 bg-gray-50 rounded-xl">
                                <p className="text-3xl font-extrabold text-yellow-500 mb-2 flex items-center justify-center">
                                    {restaurant.rating} <Star className="w-7 h-7 fill-current ml-2"/>
                                </p>
                                <p className="text-gray-700">Berdasarkan {restaurant.reviewsCount} ulasan.</p>
                                <Link to={`/reviews/${restaurant.slug}`} className="mt-4 inline-block text-green-600 hover:underline font-semibold">
                                    Lihat semua ulasan
                                </Link>
                            </div>
                        </motion.div>

                    </div>
                </div>

            </div>
        </div>
    );
}