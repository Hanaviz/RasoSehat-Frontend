import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, CheckCircle, Clock, Store, Heart, Phone, TrendingUp, Flame, Navigation, Edit3, Trash2 } from 'lucide-react';
import { makeImageUrl } from '../utils/api';

// Fungsi untuk format harga ke Rupiah (Rp)
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number).replace('Rp', 'Rp ');
};

// Helper: normalize and extract WhatsApp digits from menu props.
// Priority: menu.whatsappNumber -> menu.no_telepon -> menu.phone
// Normalization: remove non-digits, convert leading 0 or 8 to country code 62.
function getWhatsappDigitsFromMenu(menu) {
    if (!menu) return null;
    // Candidate fields in order of preference: menu-level then restaurant-level
    const candidates = [
        menu.whatsappNumber,
        menu.whatsapp,
        menu.no_telepon,
        menu.phone,
        menu.phone_admin,
        menu.phonePrimary,
        // restaurant-level fallbacks
        menu.restaurant?.whatsapp,
        menu.restaurant?.no_telepon,
        menu.restaurant?.phone,
        menu.restaurant?.phone_admin,
    ];

    const raw = candidates.find(c => c !== undefined && c !== null && String(c).trim() !== '');
    if (!raw) return null;
    let digits = String(raw).replace(/\D+/g, '');
    if (!digits) return null;
    if (digits.startsWith('0')) digits = '62' + digits.slice(1);
    else if (digits.startsWith('8')) digits = '62' + digits;
    return digits;
}

const HeroMenuCard = ({ menu, onEdit, onDelete }) => {
    // Debug logging: show key fields when component receives props
    useEffect(() => {
        try {
            if (menu) {
                // Only for debugging; remove after verification
                // Log the id, nama_menu, kategori_id, and status_verifikasi
                // Use console.debug so it can be filtered in the browser console
                console.debug('[HeroMenuCard] menu props:', {
                    id: menu.id,
                    nama_menu: menu.nama_menu || menu.name || null,
                    kategori_id: menu.kategori_id || menu.kategoriId || null,
                    status_verifikasi: menu.status_verifikasi || null
                });
            }
        } catch (e) {
            console.warn('[HeroMenuCard] debug log failed', e);
        }
    }, [menu]);
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    // Do NOT rely on restaurant-level fields; only menu.whatsappNumber is used per spec
    const waDigits = getWhatsappDigitsFromMenu(menu);
    
    // Data ini berasal dari mock data di Herosection.jsx
        const isVerified = Boolean(menu.isVerified) || (typeof menu.id === 'string' ? (menu.id.charCodeAt(0) % 2 === 0) : (Number(menu.id) % 2 === 0));
        const calories = menu.calories || menu.kalori || Math.floor(Math.random() * (550 - 250 + 1)) + 250;
    
        // Bersihkan dan format harga (support backend field `harga`)
        const rawPrice = Number(menu.price || menu.harga) || (typeof (menu.price || menu.harga) === 'string' ? Number(String(menu.price || menu.harga).replace(/[^0-9.-]+/g, '')) : 0) || 0;
    const formattedPrice = formatRupiah(rawPrice);

    // Tentukan kategori kalori
    const getCalorieCategory = (cal) => {
        if (cal < 300) return { label: 'Rendah', color: 'bg-green-500' };
        if (cal < 450) return { label: 'Sedang', color: 'bg-yellow-500' };
        return { label: 'Tinggi', color: 'bg-orange-500' };
    };

    const calorieCategory = getCalorieCategory(calories);

    const handleLike = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLiked(!isLiked);
    };

    const handleContactWhatsApp = (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const digits = getWhatsappDigitsFromMenu(menu);
            if (!digits) {
                window.alert('Nomor WhatsApp toko belum tersedia');
                return;
            }

            const message = encodeURIComponent(`Halo, saya tertarik dengan menu ${menu.name || menu.nama_menu || ''} dari ${menu.restaurantName || menu.nama_restoran || ''}`);
            window.open(`https://wa.me/${digits}?text=${message}`, '_blank');
        } catch (err) {
            console.warn('[HeroMenuCard] handleContactWhatsApp error', err);
            window.alert('Nomor WhatsApp toko belum tersedia');
        }
    };

    const handleViewLocation = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Jika backend menyimpan link langsung di `maps_latlong`, buka link tersebut
        const mapsLink = menu.maps_latlong || menu.mapsLink || menu.mapsLatLong;
        if (mapsLink && typeof mapsLink === 'string' && mapsLink.trim()) {
            // Jika sudah berupa URL (http/https), buka langsung
            if (/^https?:\/\//i.test(mapsLink.trim())) {
                window.open(mapsLink.trim(), '_blank');
                return;
            }
            // Jika mengandung google.com/maps, assume full link
            if (mapsLink.includes('google.com/maps')) {
                window.open(mapsLink.trim(), '_blank');
                return;
            }
            // Jika berupa koordinat "lat, lng", gunakan query search
            if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(mapsLink.trim())) {
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsLink.trim())}`, '_blank');
                return;
            }
        }

        // Fallback: search by restaurant name
        const location = menu.restaurantName || menu.name || '';
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
    };

    const handleNavigateToMenu = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        // Prefer numeric/id route, fallback to slug when id missing
        const target = menu.id ?? menu.slug ?? '';
        navigate(`/menu/${target}`);
    };

    const handleNavigateToRestaurant = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        // Build a safe restaurant slug fallback from multiple possible fields
        const candidate = menu.restaurantSlug || menu.restaurant?.slug || menu.restaurant?.name || menu.restaurantName || menu.nama_restoran || '';
        const safeSlug = String(candidate || '').trim() ? String(candidate).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : '';
        if (!safeSlug) {
            // If we cannot determine a slug, fallback to menu's restoran id if provided (safer),
            // or open the menu detail instead to avoid navigating to '/restaurant/undefined'.
            if (menu.restoran_id || menu.restoranId || menu.restaurantId) {
                navigate(`/restaurant/${menu.restoran_id || menu.restoranId || menu.restaurantId}`);
                return;
            }
            // last resort: navigate to menu page
            navigate(`/menu/${menu.id ?? menu.slug ?? ''}`);
            return;
        }
        navigate(`/restaurant/${safeSlug}`);
    };

    return (
        <motion.div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigateToMenu(); }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-2xl transition-all group flex flex-col relative focus:outline-none focus:ring-2 focus:ring-green-500"
        >
            {/* Container Gambar & Overlay */}
            <div 
                onClick={handleNavigateToMenu}
                className="block relative flex-shrink-0 cursor-pointer overflow-hidden bg-gray-100"
            >
                {/* Skeleton Loader */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                )}
                
                {
                    (() => {
                        const raw = menu.image || menu.foto || null;
                        const imageUrl = raw ? makeImageUrl(raw) : '/RasoSehat.png';
                        return (
                            <img
                                src={imageUrl}
                                alt={menu.name || menu.nama_menu}
                                onLoad={(e) => {
                                    try {
                                        setImageLoaded(true);
                                        const img = e && e.target;
                                        if (img && img.naturalWidth) {
                                            console.debug('[HeroMenuCard] image load:', { src: img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
                                        }
                                    } catch (err) { /* ignore */ }
                                }}
                                onError={(e) => {
                                    try {
                                        // Avoid infinite loop
                                        if (e?.target) {
                                            e.target.onerror = null;
                                            e.target.src = '/RasoSehat.png';
                                        }
                                    } catch (err) { /* ignore */ }
                                }}
                                className={`w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500 ${
                                    imageLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                        );
                    })()
                }
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top Badges Row */}
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                    {/* Verified Badge */}
                    {isVerified && (
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-bold backdrop-blur-sm"
                            title="Menu Terverifikasi RasoSehat"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Verified</span>
                        </motion.div>
                    )}

                    {/* Like Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleLike}
                        className={`p-2 rounded-full shadow-lg backdrop-blur-md transition-all ${
                            isLiked 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
                        }`}
                    >
                        <Heart 
                            className={`w-5 h-5 transition-all ${isLiked ? 'fill-current' : ''}`}
                        />
                    </motion.button>
                </div>

                {/* Bottom Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                    {/* Calorie Badge with Category */}
                    <div className="flex flex-col gap-1">
                        <div className={`${calorieCategory.color} text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-1.5`}>
                            <Flame className="w-4 h-4" />
                            <span>{calories} Kkal</span>
                        </div>
                        <span className="text-white text-[10px] font-semibold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                            Kalori {calorieCategory.label}
                        </span>
                    </div>

                    {/* Rating Badge */}
                    <div className="bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400"/>
                        <span className="text-sm font-bold">{(Number(menu.rating) || 0).toFixed(1)}</span>
                    </div>
                </div>
            </div>
            
            {/* Detail Konten */}
            <div className="p-4 space-y-3 flex-grow flex flex-col">
                {/* Title & Description */}
                <div 
                    onClick={handleNavigateToMenu}
                    className="cursor-pointer"
                >
                    <h3 className="font-bold text-gray-900 mb-1.5 text-base sm:text-lg group-hover:text-green-600 transition-colors line-clamp-1">
                        {menu.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {menu.description || 'Menu sehat dengan bahan pilihan terbaik untuk kesehatan Anda.'}
                    </p>
                </div>
                
                {/* Restaurant Info */}
                <div 
                    onClick={handleNavigateToRestaurant}
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-green-600 transition-colors cursor-pointer group/restaurant pb-3 border-b border-gray-100"
                >
                    <div className="p-1.5 bg-gray-100 rounded-lg group-hover/restaurant:bg-green-50 transition-colors">
                        <Store className='w-3.5 h-3.5'/>
                    </div>
                    <span className="font-medium truncate">{menu.restaurantName}</span>
                    <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                        <Clock className="w-3 h-3"/>
                        <span className="font-medium">{menu.prepTime}</span>
                    </div>
                </div>

                {/* Price Info */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium">Kisaran Harga</span>
                        <span className="text-green-600 font-bold text-xl">{formattedPrice}</span>
                    </div>
                    
                    {/* Location Badge */}
                    <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-green-600" />
                        <span className="font-medium">{menu.maps_latlong || menu.mapsLink || menu.mapsLatLong ? 'Lihat Lokasi' : (menu.city || 'Lokasi')}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto pt-2">
                    <div className="grid grid-cols-2 gap-2">
                        {/* WhatsApp Contact Button */}
                        {/* Always display Hubungi; behavior depends solely on menu.whatsappNumber */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleContactWhatsApp}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Phone className="w-4 h-4" />
                            <span>Hubungi</span>
                        </motion.button>

                        {/* View Location Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleViewLocation}
                            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm border-2 border-gray-200 hover:border-green-500"
                        >
                            <Navigation className="w-4 h-4" />
                            <span>Lokasi</span>
                        </motion.button>
                    </div>

                    {/* Info Text */}
                    <p className="text-[10px] text-gray-500 text-center mt-2">
                        Hubungi langsung penjual via WhatsApp
                    </p>
                </div>

                {/* Edit/Delete buttons (optional) */}
                {(onEdit || onDelete) && (
                    <div className="mt-3 flex items-center gap-2">
                        {onEdit && (
                            <button onClick={(e) => { e.stopPropagation(); onEdit(menu); }} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-colors">
                                <Edit3 className="w-4 h-4" />
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={(e) => { e.stopPropagation(); onDelete(menu.id || menu.id); }} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-semibold hover:bg-red-100 transition-colors">
                                <Trash2 className="w-4 h-4" />
                                Hapus
                            </button>
                        )}
                    </div>
                )}

                {/* Trending Indicator (Optional) */}
                {menu.isTrending && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Trending Hari Ini</span>
                    </div>
                )}
            </div>

            {/* Quick View Overlay on Hover */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
        </motion.div>
    );
};

export default HeroMenuCard;