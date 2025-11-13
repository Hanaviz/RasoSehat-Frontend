// src/pages/RestaurantDetailPage.jsx

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Utensils, MapPin, Star, Phone, Clock, MessageSquare, Briefcase, Globe, CheckCircle, AlertTriangle, ChevronRight, Menu, Loader } from 'lucide-react'; 
import { motion } from 'framer-motion';

// Mock Data (Simulasi data Restoran dari API Laravel)
const mockRestaurantData = {
  'healthy-corner': {
    id: 1,
    name: 'Healthy Corner',
    slug: 'healthy-corner',
    tagline: 'Pusat Makanan Segar, Rendah Kalori, dan Tinggi Protein.',
    description: 'Menyajikan hidangan sehat harian dengan fokus rendah kalori dan tinggi protein, ideal untuk mahasiswa Unand dan sekitarnya. Semua menu diverifikasi berdasarkan komposisi dan metode masak.',
    address: 'Jl. Limau Manih No. 12, Padang',
    latitude: -0.9144, 
    longitude: 100.4650,
    whatsapp: '6281234567890',
    socialMedia: 'instagram.com/healthycornerpadang',
    operatingHours: 'Senin - Sabtu: 09:00 - 21:00',
    rating: 4.8,
    reviewsCount: 150,
    jenisUsaha: 'Perorangan',
    verified: true, 
    // Data Menu (Diperkaya untuk demo kategori)
    menu: [
        { id: 1, name: "Rainbow Buddha Bowl", slug: 'buddha-bowl', price: '25.000', healthTag: 'Rendah Kolesterol', category: 'Salad & Bowl', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
        { id: 2, name: "Ayam Panggang Keto", slug: 'ayam-panggang-keto', price: '45.000', healthTag: 'Tinggi Protein', category: 'Main Course', image: 'https://images.unsplash.com/photo-1559400262-e2c7a5f973c9?w=400&h=300&fit=crop' },
        { id: 3, name: "Smoothie Green Goddess", slug: 'green-goddess-smoothie', price: '18.000', healthTag: 'Rendah Kalori', category: 'Minuman Sehat', image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400&h=300&fit=crop' },
        { id: 4, name: "Steak Salmon Oven", slug: 'salmon-oven', price: '65.000', healthTag: 'Tinggi Omega-3', category: 'Main Course', image: 'https://images.unsplash.com/photo-1532551466723-5e921e10696b?w=400&h=300&fit=crop' },
    ],
    // Mock Rating details
    ratingDetails: [
        { label: 'Rasa', score: 4.9 },
        { label: 'Kualitas Bahan', score: 4.7 },
        { label: 'Kebersihan', score: 4.8 },
    ],
  },
};

// =========================================================================
// KOMPONEN MENU CARD (Responsive)
// =========================================================================
const MenuCard = ({ menu }) => (
    <motion.div 
        // Mengurangi padding dan shadow untuk mobile, diperbesar di desktop
        className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 transform hover:lg:scale-[1.01] border border-gray-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <Link to={`/menu/${menu.slug}`} className="block h-32 sm:h-40 overflow-hidden"> 
            <img 
                src={menu.image} 
                alt={menu.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
        </Link>
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
            <div>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold w-fit ${
                    menu.healthTag.includes('Rendah') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                    {menu.healthTag}
                </span>
                <Link to={`/menu/${menu.slug}`} className="font-bold text-gray-800 hover:text-green-600 transition-colors text-base sm:text-lg mt-1 block line-clamp-2">
                    {menu.name}
                </Link>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <p className="text-green-600 font-extrabold text-lg sm:text-xl">Rp {menu.price}</p>
                <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current"/>
                    <span className="text-sm text-gray-700 ml-1">4.7</span>
                </div>
            </div>
        </div>
    </motion.div>
);

export default function RestaurantDetailPage() {
    const { slug } = useParams();
    const restaurant = mockRestaurantData[slug] || mockRestaurantData['healthy-corner'];
    
    // Group menu by category
    const menuByCategory = restaurant.menu.reduce((acc, menu) => {
        const category = menu.category || 'Lain-lain';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(menu);
        return acc;
    }, {});

    if (!restaurant) {
        return (
             <div className="min-h-screen pt-28 text-center p-8">
                <h1 className="text-3xl font-bold text-red-600">404: Toko Tidak Ditemukan</h1>
                <p className="text-gray-600 mt-4">Toko dengan slug {slug} tidak dapat ditemukan. Kembali ke <Link to="/" className="text-green-600 hover:underline">Beranda</Link>.</p>
            </div>
        );
    }

    const waLink = `https://wa.me/${restaurant.whatsapp}?text=Halo%20${restaurant.name},%20Saya%20ingin%20bertanya%20mengenai%20menu%20sehat%20Anda%20yang%20ada%20di%20RasoSehat.`;
    
    // Cek apakah toko buka (mock sederhana)
    const isStoreOpen = true; 

    return (
        <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* HERO SECTION: Informasi Utama Restoran (Responsive) */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    // Mengurangi padding untuk mobile: p-4 sm:p-6 md:p-8
                    className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl border-t-8 border-green-600 mb-6 sm:mb-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                        
                        {/* Detail Kiri: Nama & Tagline */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-1 sm:mb-2">
                                {restaurant.name}
                            </h1>
                            <p className="text-lg sm:text-xl font-medium text-green-600 mb-3 sm:mb-4">{restaurant.tagline}</p>
                            <p className="text-sm sm:text-base text-gray-700 max-w-4xl">{restaurant.description}</p>
                        </div>
                        
                        {/* Detail Kanan: Rating & Status (Responsive Stacking) */}
                        <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
                            <div className="flex items-center gap-2">
                                <span className="text-4xl sm:text-5xl font-black text-yellow-500">{restaurant.rating}</span>
                                <Star className="w-6 h-6 sm:w-8 sm:h-8 fill-current text-yellow-500"/>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">{restaurant.reviewsCount} Ulasan • 75% Diproses</p>
                            
                            {/* Status Badge Group */}
                            <div className={`p-2 rounded-lg font-semibold text-xs sm:text-sm flex-shrink-0 flex items-center gap-2 ${restaurant.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} w-full justify-center md:justify-end`}>
                                {restaurant.verified ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} 
                                {restaurant.verified ? 'Terverifikasi RasoSehat' : 'Verifikasi Tertunda'}
                            </div>
                            <div className={`p-2 rounded-lg font-semibold text-xs sm:text-sm flex-shrink-0 flex items-center gap-2 ${isStoreOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} w-full justify-center md:justify-end`}>
                                <Clock className="w-4 h-4" /> {isStoreOpen ? 'BUKA' : 'TUTUP'} {isStoreOpen ? `(Sampai ${restaurant.operatingHours.split(': ')[1]})` : ''}
                            </div>
                        </div>
                    </div>
                </motion.div>


                {/* MAIN CONTENT GRID (Responsive) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                    
                    {/* Kolom Kiri: SIDEBAR - Kontak, Info, Aksi (Sticky ONLY on LG+) */}
                    <div className="lg:col-span-1">
                        
                        {/* Wrapper Sticky untuk Kontak & Rating (Hanya Sticky di Desktop) */}
                        <div
                            className="lg:sticky lg:top-28 space-y-4 sm:space-y-6" // HANYA sticky di breakpoint lg
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-4 sm:space-y-6" // Wrapper animasi
                            >

                                {/* Kartu Kontak & Aksi (Responsive) */}
                                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-green-600"/> Detail Lokasi
                                    </h3>
                                    
                                    <div className="space-y-3 sm:space-y-4">
                                        {/* Alamat */}
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                                            <div>
                                                <p className="font-semibold text-gray-700 text-sm">Alamat</p>
                                                <p className="text-xs sm:text-sm text-gray-600">{restaurant.address}</p>
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
                                        
                                        {/* Jam Operasional */}
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-700 text-sm">Jam Operasional</p>
                                                <p className="text-xs sm:text-sm text-gray-600">{restaurant.operatingHours}</p>
                                            </div>
                                        </div>

                                        {/* Jenis Usaha */}
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-700 text-sm">Jenis Usaha</p>
                                                <p className="text-xs sm:text-sm text-gray-600">{restaurant.jenisUsaha}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Tombol Aksi Cepat (Responsive Grid) */}
                                    <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                                        <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-300 shadow-lg"
                                        >
                                            <Phone className="w-4 h-4 sm:w-5 sm:h-5"/> Chat via WhatsApp
                                        </a>
                                        {restaurant.socialMedia && (
                                            <a
                                                href={`https://${restaurant.socialMedia}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors duration-300"
                                            >
                                                <Globe className="w-4 h-4 sm:w-5 sm:h-5"/> Sosial Media
                                            </a>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Kartu Detail Rating (Responsive) */}
                                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-green-600"/> Rincian Penilaian
                                    </h3>
                                    <div className="space-y-3">
                                        {restaurant.ratingDetails.map((detail, index) => (
                                            <div key={index} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">{detail.label}</span>
                                                <span className="font-bold text-gray-800 flex items-center gap-1">
                                                    {detail.score} <Star className="w-3 h-3 fill-current text-yellow-500"/>
                                                </span>
                                            </div>
                                        ))}
                                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm sm:text-base font-bold">
                                            <span className="text-gray-800">Rata-rata</span>
                                            <span className="text-green-600 flex items-center gap-1">
                                                {restaurant.rating} <Star className="w-4 h-4 fill-current text-green-600"/>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Daftar Menu & Ulasan (Responsive) */}
                    <div className="lg:col-span-3 space-y-6 sm:space-y-8">
                        
                        {/* Daftar Menu per Kategori */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100"
                        >
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-5 border-b pb-2 flex items-center gap-2">
                                <Utensils className="w-6 h-6 text-green-600"/> Daftar Menu Sehat ({restaurant.menu.length})
                            </h3>
                            
                            {/* Loop melalui kategori menu */}
                            {Object.keys(menuByCategory).map((category, index) => (
                                <div key={index} className="mb-6 sm:mb-8">
                                    <div className="flex items-center justify-between mt-4 sm:mt-6 mb-3 sm:mb-4">
                                        <h4 className="text-lg sm:text-xl font-bold text-gray-700 flex items-center gap-2">
                                            <Menu className="w-5 h-5 text-green-500"/> {category}
                                        </h4>
                                        <Link to={`/restaurant/${slug}?category=${category.toLowerCase()}`} className="text-xs sm:text-sm font-medium text-green-600 hover:text-green-700 flex items-center">
                                            Lihat Semua ({menuByCategory[category].length}) <ChevronRight className="w-4 h-4"/>
                                        </Link>
                                    </div>
                                    {/* Grid Menu: 1 kolom di HP, 2 kolom di tablet, 3 kolom di desktop */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                        {menuByCategory[category].map(menu => (
                                            <MenuCard key={menu.id} menu={menu} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Ulasan Singkat */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100"
                        >
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-5 border-b pb-2 flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-green-600"/> Ulasan Pengguna
                            </h3>
                            <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="text-2xl sm:text-3xl font-extrabold text-yellow-500 mb-2 flex items-center justify-center">
                                    {restaurant.rating} <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-2"/>
                                </p>
                                <p className="text-sm sm:text-base text-gray-700">Berdasarkan **{restaurant.reviewsCount}** ulasan yang terverifikasi.</p>
                                <Link to={`/reviews/${restaurant.slug}`} className="mt-3 sm:mt-4 inline-block text-green-600 hover:underline font-semibold text-sm sm:text-base transition-colors">
                                    Baca Semua Ulasan →
                                </Link>
                            </div>
                        </motion.div>

                    </div>
                </div>

            </div>
        </div>
    );
}