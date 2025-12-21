import React, { useState } from 'react';
import { makeImageUrl, API_ORIGIN } from '../utils/api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Search, Plus, Store, Eye, ThumbsUp, ArrowUpRight, 
    CheckCircle, Clock, Star, Edit2, BarChart3, Settings, ClipboardList
} from 'lucide-react'; 

// --- Mock Data (Harus ada di file ini jika tidak menggunakan state management global) ---
const mockStoreData = {
    isVerified: true, 
    name: 'Salad Delight',
    location: 'Kota Padang',
    stats: {
        visitors: 870,
        visitorsChange: 8, 
        menuViews: 845,
        menuViewsChange: 12,
        ratingsCount: 245,
        ratingsChange: 10,
    },
    menus: [
        {
            id: 1,
            name: "Green Goddess Smoothie",
            slug: "green-goddess-smoothie",
            image: "https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400&h=300&fit=crop",
            description: "Smoothie hijau dengan bayam, pisang, alpukat, dan protein powder",
            price: "18.000",
            rating: 4.6,
            distance: "0.8 km",
            prepTime: "5-10 menit",
            healthTag: "Smoothie"
        },
        {
            id: 2,
            name: "Tropical Fruit Bowl",
            slug: "tropical-fruit-bowl",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", 
            description: "Mangga, pisang, pepaya, jeruk lokal dengan yogurt dan granola",
            price: "12.000",
            rating: 4.5,
            distance: "1.5 km",
            prepTime: "5-8 menit",
            healthTag: "Buah Segar"
        }
    ],
};

// --- Mock Laporan Penjualan Tambahan ---
const mockSalesData = [
    { item: "Rainbow Buddha Bowl", sales: 120, revenue: "3.000.000" },
    { item: "Green Goddess Smoothie", sales: 90, revenue: "1.620.000" },
];
// --- End Mock Data ---


// Komponen Kartu Statistik
const StatCard = ({ title, value, change, icon: Icon }) => (
    <motion.div
        className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex-1 min-w-[200px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
            <div className={`flex items-center text-sm font-medium ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                <ArrowUpRight className="w-4 h-4 mr-1 transform rotate-45" />
                <span>{change}%</span>
            </div>
        </div>
        <div className="text-4xl font-extrabold text-gray-900">{value}</div>
        <div className="text-xs text-gray-400 mt-1">
             Status Bulan Lalu
        </div>
    </motion.div>
);

// Komponen Kartu Menu Saya
const MyMenuCard = ({ menu }) => (
    <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform hover:scale-[1.02] transition-transform duration-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <div className="relative">
            <img src={menu.image} alt={menu.name} className="w-full h-40 object-cover" />
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full capitalize">
                {menu.healthTag}
            </span>
            <Link 
                to={`/menu/${menu.slug}`} 
                className="absolute top-2 right-2 bg-gray-800/70 hover:bg-gray-900/80 text-white text-xs font-bold px-3 py-1 rounded-full"
            >
                Buka
            </Link>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-lg text-gray-800 line-clamp-1">{menu.name}</h4>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{menu.description}</p>
            <div className="flex justify-between items-center mt-3">
                <p className="text-green-600 font-extrabold text-xl">Rp {menu.price}</p>
                <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" /> {menu.rating}
                </div>
            </div>
            <div className="flex items-center text-xs text-gray-400 mt-2">
                <Clock className="w-3 h-3 mr-1" /> {menu.prepTime}
            </div>
        </div>
    </motion.div>
);


export default function StoreDashboardVerified({ store = null, menus: menusProp = null }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Use provided store/menus when available, otherwise fall back to mock data
    const name = (store && (store.nama_restoran || store.name)) || mockStoreData.name;
    const location = (store && (store.alamat || store.location)) || mockStoreData.location;

    // stats: keep mock stats but adapt menuViews to number of menus when possible
    const stats = { ...mockStoreData.stats };

    // Normalize menus returned from backend to the UI shape expected by this component
    const mappedMenus = (Array.isArray(menusProp) && menusProp.length > 0)
                ? menusProp.map(m => {
                        const raw = m.foto_path || m.foto || m.image || '';
                        let image = makeImageUrl(raw);
                        if (!image && raw) {
                            if (String(raw).startsWith('/uploads')) image = API_ORIGIN + raw;
                            else if (!String(raw).includes('/')) image = API_ORIGIN + '/uploads/menu/' + raw;
                            else image = API_ORIGIN + '/' + String(raw).replace(/^\/+/, '');
                        }
                        return ({
                            id: m.id,
                            name: m.nama_menu || m.name || m.nama_restoran || 'Menu',
                            slug: m.slug || (m.nama_menu ? String(m.nama_menu).toLowerCase().replace(/\s+/g,'-') : ''),
                            image,
                            description: m.deskripsi || m.description || '',
                            price: (m.harga || m.price) ? String(m.harga || m.price) : '0',
                            rating: m.rating || 0,
                            prepTime: m.prep_time || m.prepTime || '',
                            healthTag: (m.diet_claims && Array.isArray(m.diet_claims) && m.diet_claims[0]) || ''
                        });
                })
        : mockStoreData.menus;

    // adapt stats menuViews to mappedMenus length for a bit more realistic numbers
    stats.menuViews = mappedMenus.length ? mappedMenus.length * 10 : stats.menuViews;

    // Filter menu berdasarkan searchTerm
    const filteredMenus = mappedMenus.filter(menu =>
        menu.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen-safe bg-gray-50 pt-12 md:pt-16 pb-12 px-4 sm:px-6 lg:px-8"> 
            <div className="max-w-7xl mx-auto">
                {/* Header Dashboard & Status */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-green-600 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8"
                >
                    <div className="flex flex-col md:flex-row items-start justify-between">
                        {/* Teks Kiri */}
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-4xl font-extrabold mb-1 flex items-center gap-3">
                                <Store className="w-9 h-9" /> Dashboard Penjual
                            </h1>
                            <p className="text-green-100 text-lg">
                                Selamat datang, {name} ({location})
                            </p>
                        </div>
                        {/* Tombol Kanan */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <span className="inline-flex items-center text-white bg-green-700 text-sm font-medium px-3 py-1 rounded-full">
                                <CheckCircle className="w-4 h-4 mr-1"/> Toko Terverifikasi
                            </span>
                            <Link 
                                to="/logout" 
                                className="bg-white text-green-700 hover:bg-gray-100 font-semibold py-2 px-6 rounded-full shadow-md transition-colors whitespace-nowrap"
                            >
                                Keluar
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Kartu Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard 
                        title="Pengunjung Toko" 
                        value={stats.visitors} 
                        change={stats.visitorsChange} 
                        icon={Store} 
                    />
                    <StatCard 
                        title="Menu Dilihat" 
                        value={stats.menuViews} 
                        change={stats.menuViewsChange} 
                        icon={Eye} 
                    />
                    <StatCard 
                        title="Penilaian" 
                        value={stats.ratingsCount} 
                        change={stats.ratingsChange} 
                        icon={ThumbsUp} 
                    />
                </div>
                
                {/* START: Tindakan Cepat & Laporan Penjualan (RESPONSIVE 2 KOLOM) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    
                    {/* Kolom 1: Tindakan Cepat (Pencarian & Edit) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="p-6 bg-white rounded-xl shadow-md border border-gray-100 space-y-4"
                    >
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2">
                             <ClipboardList className='w-5 h-5 text-green-600'/> Manajemen Toko
                        </h2>
                        
                        {/* Search Bar */}
                        <div className="relative flex-grow w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Cari menu makanan sehat saya..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        {/* Tombol Aksi */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <Link
                                to="/add-menu" 
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
                            >
                                <Plus className="w-5 h-5" /> Daftar Menu Baru
                            </Link>
                            <Link
                                to="/edit-store-profile" 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
                            >
                                <Settings className="w-5 h-5" /> Edit Profil Toko
                            </Link>
                        </div>
                    </motion.div>

                    {/* Kolom 2: Laporan Penjualan Mock */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100"
                    >
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                            <BarChart3 className='w-5 h-5 text-green-600'/> Laporan Penjualan (Mock)
                        </h2>
                        <p className='text-sm text-gray-500 mb-4'>Ringkasan performa menu terlaris bulan ini.</p>

                        <div className='space-y-3'>
                            {mockSalesData.map((data, index) => (
                                <div key={index} className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                                    <span className='font-semibold text-gray-800 flex items-center gap-2'>
                                        #{index + 1}. {data.item}
                                    </span>
                                    <div className='text-right'>
                                        <p className='text-sm font-bold text-green-700'>Rp {data.revenue}</p>
                                        <p className='text-xs text-gray-500'>{data.sales} porsi terjual</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link to="/sales-report" className="mt-4 inline-block text-green-600 hover:underline text-sm font-semibold">
                            Lihat Laporan Detail &rarr;
                        </Link>
                    </motion.div>
                </div>
                {/* END: Tindakan Cepat & Laporan Penjualan */}


                {/* Daftar Menu Saya (RESPONSIVE GRID) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="p-6 bg-white rounded-xl shadow-md border border-gray-100"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">Menu Makanan Saya</h2>
                    {filteredMenus.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMenus.map(menu => (
                                <MyMenuCard key={menu.id} menu={menu} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p className="text-xl font-semibold mb-3">Tidak ada menu ditemukan.</p>
                            <p>Coba cari dengan kata kunci lain atau tambahkan menu baru!</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}