// src/pages/RestaurantDetailPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Utensils, MapPin, Star, Phone, Clock, MessageSquare, Briefcase, Globe, CheckCircle, AlertTriangle, ChevronRight, Menu, Loader } from 'lucide-react'; 
import { motion } from 'framer-motion';
import HeroMenuCard from '../components/HeroMenuCard';
import api, { unwrap, makeImageUrl } from '../utils/api';

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

// Using shared HeroMenuCard component for menu presentation

export default function RestaurantDetailPage() {
    const { slug } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Local Reviews (client-side only) - declare hooks at top level to preserve Hooks order
    const [localReviews, setLocalReviews] = useState([]);
    const [reviewName, setReviewName] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const reviewsStorageKey = `rs_reviews_${slug || 'unknown'}`;

    useEffect(() => {
        try {
            const raw = localStorage.getItem(reviewsStorageKey);
            if (raw) setLocalReviews(JSON.parse(raw));
        } catch (err) {
            console.warn('Failed to load local reviews', err);
        }
    }, [reviewsStorageKey]);

    // Helper: build a safe slug from various possible values
    const buildSafeSlug = (candidate) => {
        if (!candidate && !restaurant) return '';
        const src = candidate ?? restaurant?.slug ?? restaurant?.nama_restoran ?? restaurant?.name ?? '';
        const s = String(src || '').trim();
        if (!s) return '';
        return s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    };

    // Simple fetch helper that requests the backend slug endpoint and unwraps response
    async function fetchRestaurantBySlug(s) {
        const res = await api.get(`/restaurants/slug/${encodeURIComponent(s)}`);
        return unwrap(res);
    }

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError('');
            // Debug: log slug
            console.log('[RestaurantDetailPage] slug from useParams:', slug, typeof slug);
            // Validate slug: allow empty string but not null/undefined
            if (slug === null || slug === undefined) {
                console.warn('[RestaurantDetailPage] slug is null or undefined');
                setError('Slug tidak tersedia.');
                setLoading(false);
                return;
            }
            try {
                const payload = await fetchRestaurantBySlug(slug);
                console.log('[RestaurantDetailPage] fetch payload:', payload);
                if (!mounted) return;
                if (payload && payload.restaurant) {
                    // Normalize restaurant fields from backend (which may use Indonesian keys)
                    const r = payload.restaurant;
                    const normalizedRestaurant = {
                        id: r.id ?? r.restoran_id ?? null,
                        name: r.nama_restoran || r.name || r.nama || '',
                        slug: r.slug || null,
                        tagline: r.tagline || r.slogan || '',
                        description: r.deskripsi || r.description || '',
                        address: r.alamat || r.address || '',
                        latitude: r.latitude ?? r.lat ?? null,
                        longitude: r.longitude ?? r.lng ?? null,
                        no_telepon: r.no_telepon || r.phone || r.phone_admin || '',
                        whatsapp: r.no_telepon || r.whatsapp || r.phone_admin || '',
                        socialMedia: r.social_media || r.socialMedia || r.social_media_handle || '',
                        operatingHours: r.operating_hours || r.operatingHours || r.operatingHoursString || '',
                        rating: Number(r.rating ?? r.nilai ?? 0) || 0,
                        reviewsCount: Number(r.reviews ?? r.reviewsCount ?? r.ulasan_count ?? 0) || 0,
                        jenisUsaha: r.jenis_usaha || r.jenisUsaha || '',
                        verified: (r.status_verifikasi && String(r.status_verifikasi).toLowerCase() === 'disetujui') || Boolean(r.verified) || Boolean(r.verified_at),
                        maps_link: r.maps_link || r.mapsLink || null,
                        maps_latlong: r.maps_latlong || r.mapsLatLong || null,
                        foto: r.foto || r.foto_ktp || r.photo || null,
                        ratingDetails: Array.isArray(r.ratingDetails) ? r.ratingDetails : (r.rating_details || []),
                        // keep original raw for debugging if needed
                        _raw: r,
                    };

                    // Normalize menus to consistent field names
                    const rawMenus = Array.isArray(payload.menus) ? payload.menus : [];
                    const normalizedMenus = rawMenus.map(m => {
                        const rawImg = m.foto_path || m.foto || m.foto_url || m.image || m.photo || null;
                        const imageUrl = rawImg ? makeImageUrl(rawImg) : 'https://via.placeholder.com/400x300.png?text=No+Image';
                        return {
                            id: m.id,
                            name: m.nama_menu || m.name || m.nama || '',
                            slug: m.slug || null,
                            price: m.harga ?? m.price ?? m.price_display ?? null,
                            // Normalize image using makeImageUrl so frontend receives resolvable URLs
                            image: imageUrl,
                            category: m.kategori || m.nama_kategori || m.category || m.kategori_nama || 'Lain-lain',
                            kalori: m.kalori ?? m.calories ?? null,
                            rating: m.rating ?? null,
                            _raw: m,
                        };
                    });

                    setRestaurant(normalizedRestaurant);
                    setMenus(normalizedMenus);
                } else {
                    setError('Toko tidak ditemukan.');
                }
            } catch (e) {
                console.error('Failed to load restaurant by slug', e);
                // If 404, set error, else network error
                if (e.response && e.response.status === 404) {
                    setError('Toko tidak ditemukan.');
                } else {
                    setError('Gagal memuat data restoran. Periksa koneksi internet.');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [slug]);

    // compute combined reviews and average safely (declare hooks/memos before any early returns)
    const totalReviews = useMemo(() => {
        const baseCount = Number(restaurant?.reviewsCount ?? restaurant?.reviews ?? 0);
        return baseCount + localReviews.length;
    }, [restaurant?.reviewsCount, restaurant?.reviews, localReviews.length]);

    const computedAverage = useMemo(() => {
        const localSum = localReviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
        const baseCount = Number(restaurant?.reviewsCount ?? restaurant?.reviews ?? 0);
        const baseRating = Number(restaurant?.rating ?? 0);
        const total = baseCount + localReviews.length;
        if (total === 0) return baseRating || 0;
        return ((baseRating * baseCount) + localSum) / total;
    }, [restaurant?.rating, restaurant?.reviewsCount, restaurant?.reviews, localReviews]);

    // Group menu by category
    const menuByCategory = (menus || []).reduce((acc, menu) => {
        const category = menu.category || menu.nama_kategori || menu.kategori || menu.category_name || 'Lain-lain';
        if (!acc[category]) acc[category] = [];
        acc[category].push(menu);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="min-h-screen-safe flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
                    <p className="text-gray-700">Memuat data restoran...</p>
                </div>
            </div>
        );
    }

    if (error || !restaurant) {
        const shownSlug = slug || 'tidak tersedia';
        const is404 = error === 'Toko tidak ditemukan.';
        return (
            <div className="min-h-screen-safe pt-28 text-center p-8">
                {is404 ? (
                    <>
                        <h1 className="text-3xl font-bold text-red-600">404: Toko Tidak Ditemukan</h1>
                        <p className="text-gray-600 mt-4">Toko dengan slug <strong>{shownSlug}</strong> tidak dapat ditemukan. Kembali ke <Link to="/" className="text-green-600 hover:underline">Beranda</Link>.</p>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-red-600">Error</h1>
                        <p className="text-gray-600 mt-4">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Coba Lagi</button>
                    </>
                )}
            </div>
        );
    }

    const phoneForWa = restaurant.no_telepon || restaurant.whatsapp || restaurant.phone || '';
    const waLink = `https://wa.me/${String(phoneForWa).replace(/\D+/g, '')}?text=Halo%20${restaurant.name},%20Saya%20ingin%20bertanya%20mengenai%20menu%20sehat%20Anda%20yang%20ada%20di%20RasoSehat.`;
    
    // Cek apakah toko buka (mock sederhana)
    const isStoreOpen = true; 

    

    const handleSubmitReview = (e) => {
        e.preventDefault();
        const name = reviewName.trim() || 'Anonim';
        const rating = Number(reviewRating) || 0;
        const comment = reviewComment.trim();
        if (rating < 1 || rating > 5) {
            alert('Berikan penilaian antara 1 dan 5.');
            return;
        }
        if (!comment) {
            alert('Tuliskan komentar/ulasan Anda.');
            return;
        }
        const newReview = {
            id: Date.now(),
            name,
            rating,
            comment,
            date: new Date().toISOString(),
        };
        const updated = [newReview, ...localReviews];
        setLocalReviews(updated);
        try {
            localStorage.setItem(reviewsStorageKey, JSON.stringify(updated));
        } catch (err) {
            console.warn('Failed to save review', err);
        }
        setReviewName('');
        setReviewRating(5);
        setReviewComment('');
    };

    return (
        <div className="min-h-screen-safe bg-gray-50 pt-24 md:pt-28 pb-12">
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
                                <span className="text-4xl sm:text-5xl font-black text-yellow-500">{computedAverage.toFixed(1)}</span>
                                <Star className="w-6 h-6 sm:w-8 sm:h-8 fill-current text-yellow-500"/>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">{totalReviews} Ulasan • 75% Diproses</p>
                            
                            {/* Status Badge Group */}
                            <div className={`p-2 rounded-lg font-semibold text-xs sm:text-sm flex-shrink-0 flex items-center gap-2 ${restaurant.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} w-full justify-center md:justify-end`}>
                                {restaurant.verified ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} 
                                {restaurant.verified ? 'Terverifikasi RasoSehat' : 'Verifikasi Tertunda'}
                            </div>
                            <div className={`p-2 rounded-lg font-semibold text-xs sm:text-sm flex-shrink-0 flex items-center gap-2 ${isStoreOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} w-full justify-center md:justify-end`}>
                                <Clock className="w-4 h-4" /> {isStoreOpen ? 'BUKA' : 'TUTUP'} {
                                    (() => {
                                        const oh = restaurant.operatingHours || restaurant.operating_hours || '';
                                        if (!oh) return '';
                                        // Try to extract time after colon if format like 'Senin - Jumat: 09:00 - 21:00'
                                        const parts = String(oh).split(': ');
                                        if (parts.length > 1) return `(Sampai ${parts.slice(1).join(': ')})`;
                                        return `(${oh})`;
                                    })()
                                }
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
                                                {restaurant.maps_link ? (
                                                    <a href={restaurant.maps_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Lihat di Google Maps</a>
                                                ) : (
                                                    <a href={`https://maps.google.com/?q=${restaurant.latitude},${restaurant.longitude}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Lihat di Google Maps</a>
                                                )}
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
                                        {(restaurant.ratingDetails || []).map((detail, index) => (
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
                                                {computedAverage.toFixed(1)} <Star className="w-4 h-4 fill-current text-green-600"/>
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
                                <Utensils className="w-6 h-6 text-green-600"/> Daftar Menu Sehat ({menus.length})
                            </h3>
                            
                            {/* Loop melalui kategori menu */}
                            {Object.keys(menuByCategory).map((category, index) => (
                                <div key={index} className="mb-6 sm:mb-8">
                                    <div className="flex items-center justify-between mt-4 sm:mt-6 mb-3 sm:mb-4">
                                        <h4 className="text-lg sm:text-xl font-bold text-gray-700 flex items-center gap-2">
                                            <Menu className="w-5 h-5 text-green-500"/> {category}
                                        </h4>
                                        <Link to={`/restaurant/${buildSafeSlug(restaurant.slug)}?category=${category.toLowerCase()}`} className="text-xs sm:text-sm font-medium text-green-600 hover:text-green-700 flex items-center">
                                            Lihat Semua ({menuByCategory[category].length}) <ChevronRight className="w-4 h-4"/>
                                        </Link>
                                    </div>
                                    {/* Grid Menu: 1 kolom di HP, 2 kolom di tablet, 3 kolom di desktop */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                        {menuByCategory[category].map(menu => (
                                            <HeroMenuCard
                                                key={menu.id}
                                                menu={{
                                                    ...menu,
                                                    image: menu.image || menu.foto || null,
                                                    name: menu.name || menu.nama_menu,
                                                    price: menu.price || menu.harga,
                                                    // provide restaurant-level contact and maps link
                                                    whatsappNumber: restaurant.no_telepon || restaurant.whatsapp || null,
                                                    mapsLink: restaurant.maps_link || restaurant.mapsLink || restaurant.maps_latlong || null,
                                                    // ensure restaurant slug is provided for navigation
                                                    restaurantSlug: restaurant.slug || null,
                                                    restaurantName: restaurant.name || menu.restaurantName || null,
                                                }}
                                            />
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
                            <div className="space-y-4">
                                <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl border border-gray-200">
                                    <p className="text-2xl sm:text-3xl font-extrabold text-yellow-500 mb-2 flex items-center justify-center">
                                        {computedAverage.toFixed(1)} <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-2"/>
                                    </p>
                                    <p className="text-sm sm:text-base text-gray-700">Berdasarkan <strong>{totalReviews}</strong> ulasan (termasuk ulasan lokal di browser Anda).</p>
                                </div>

                                {/* Submit Review Form (Client-side only) */}
                                <form onSubmit={handleSubmitReview} className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100">
                                    <h4 className="font-semibold text-gray-800 mb-3">Tulis Ulasan Anda</h4>
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
                                    <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} placeholder="Tulis komentar singkat tentang makanan atau layanan..." className="w-full px-3 py-2 border rounded-lg mb-3" />
                                    <div className="flex justify-end">
                                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg">Kirim Ulasan</button>
                                    </div>
                                </form>

                                {/* Recent Local Reviews */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800">Ulasan Terbaru (Lokal)</h4>
                                    {localReviews.length === 0 ? (
                                        <div className="text-sm text-gray-600">Belum ada ulasan lokal. Jadilah yang pertama menulis ulasan!</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {localReviews.slice(0, 6).map((r) => (
                                                <div key={r.id} className="bg-white p-3 rounded-lg border border-gray-100">
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-semibold text-sm">{r.name}</div>
                                                        <div className="flex items-center text-yellow-500 text-sm">
                                                            {r.rating} <Star className="w-4 h-4 fill-current ml-1" />
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{new Date(r.date).toLocaleString()}</p>
                                                    <p className="mt-2 text-gray-700 text-sm">{r.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>

            </div>
        </div>
    );
}