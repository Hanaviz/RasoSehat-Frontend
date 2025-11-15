import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Store, Utensils, CheckCircle, Clock, User, MapPin, Phone, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data untuk KPI
const mockKPI = {
  totalMerchants: 52,
  pendingVerification: 7,
  activeMenus: 128,
  reviewsToModerate: 15,
};

// Mock Data untuk Tabel Verifikasi Toko (DISINKRONKAN DENGAN FORM PENDAFTARAN)
const mockPendingMerchants = [
    { 
        id: 101, 
        name: 'Toko Sehat Bundo', 
        owner: 'Nori Dwi Yulianti', 
        date: '2025-11-14', 
        email: 'nori@sehatbundo.com',
        contact: '+62812XXXXX',
        address: 'Jl. Pemuda No. 5, Padang Barat',
        concept: 'Hanya menggunakan minyak zaitun dan gula Stevia. Semua bumbu dibuat dari rempah segar, tanpa pengawet atau MSG. Fokus pada menu masakan rumahan rendah kalori.',
        docUrl: 'https://placehold.co/300x200/4ade80/white?text=Foto+Dapur',
        openHours: '09:00 - 21:00'
    },
    { 
        id: 102, 
        name: 'Vegan Padang Bowl', 
        owner: 'Ria Fitri', 
        date: '2025-11-13', 
        email: 'ria@veganpadang.com',
        contact: '+62813XXXXX',
        address: 'Jl. Andalas No. 10, Limau Manih',
        concept: '100% nabati, fokus pada makanan lokal Padang yang dimodifikasi tanpa santan atau minyak kelapa sawit. Protein dari tempe, tahu, dan jamur.',
        docUrl: 'https://placehold.co/300x200/4ade80/white?text=Foto+Konsep',
        openHours: '10:00 - 18:00'
    },
];

// Mock Data untuk Tabel Verifikasi Menu
const mockPendingMenus = [
    { id: 201, menuName: 'Ayam Rendah Garam', merchant: 'Toko Sehat Bundo', category: 'Tinggi Protein', status: 'Pending Review' },
    { id: 202, menuName: 'Salad Sayur Kampung', merchant: 'Vegan Padang Bowl', category: 'Vegetarian', status: 'Pending Review' },
];

// Komponen Card KPI
const KpiCard = ({ title, value, icon: Icon, color }) => (
    <div className={`p-4 rounded-xl shadow-md border-l-4 ${color} bg-white transition-shadow hover:shadow-lg`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">{value}</h2>
            </div>
            <Icon className={`w-8 h-8 ${color}`} strokeWidth={1.5} />
        </div>
    </div>
);

// Komponen Modal Detail Verifikasi (DITINGKATKAN)
const VerificationModal = ({ type, data, onClose, onVerify, onReject }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl" // Modal lebih lebar
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-5 border-b flex justify-between items-center bg-green-600 rounded-t-2xl">
                <h3 className="text-xl font-bold text-white">{type === 'merchant' ? `Tinjauan Toko: ${data.name}` : `Audit Menu: ${data.menuName}`}</h3>
                <button onClick={onClose} className="p-1 rounded-full text-white hover:bg-white/20 transition-colors">
                    <X size={24} />
                </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Bagian 1: Detail Toko */}
                {type === 'merchant' && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Kolom Kiri: Info Kontak & Pemilik */}
                        <div className='bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200'>
                            <h4 className='font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2'><User size={20}/> Detail Kepemilikan</h4>
                            <p className='text-sm flex items-center gap-2'><User size={16}/> **Nama Pemilik:** {data.owner}</p>
                            <p className='text-sm flex items-center gap-2'><Mail size={16}/> **Email:** {data.email}</p>
                            <p className='text-sm flex items-center gap-2'><Phone size={16}/> **Kontak WA:** {data.contact}</p>
                            <p className='text-sm flex items-center gap-2'><Clock size={16}/> **Jam Buka:** {data.openHours}</p>
                            <p className='text-sm flex items-start gap-2'><MapPin size={16} className='flex-shrink-0 mt-1'/> **Alamat:** {data.address}</p>
                            <p className='text-sm flex items-start gap-2'><Clock size={16} className='flex-shrink-0 mt-1'/> **Tanggal Pengajuan:** {data.date}</p>
                        </div>
                        
                        {/* Kolom Kanan: Konsep & Bukti */}
                        <div className='bg-green-50 rounded-xl p-4 space-y-3 border border-green-200'>
                            <h4 className='font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2'><CheckCircle size={20}/> Konsep Kesehatan Toko</h4>
                            <p className='text-gray-700 italic border-l-2 pl-3 border-green-500 text-sm leading-relaxed'>
                                {data.concept}
                            </p>
                            <h4 className='font-bold text-sm text-gray-800 mt-4'>Bukti Visual (Mock):</h4>
                            <img 
                                src={data.docUrl} 
                                alt="Dokumen Pendukung" 
                                className="w-full rounded-lg border border-gray-300"
                            />
                        </div>
                    </div>
                )}

                {/* Bagian 2: Detail Menu (Jika type='menu') */}
                {type === 'menu' && (
                    <div className='p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3'>
                        <h4 className='font-bold text-lg text-gray-800'>Detail Audit Menu {data.menuName}</h4>
                        <p className='text-gray-700 italic'>[Placeholder untuk detail Gizi, Bahan, dan Metode Masak dari Menu]</p>
                        <p className='text-xs text-red-500'>*Implementasi detail menu memerlukan integrasi API yang lengkap.*</p>
                    </div>
                )}


                {/* Bagian 3: Feedback/Note Section (Penting untuk RPL) */}
                <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Catatan Admin (Wajib diisi jika Tolak):</label>
                    <textarea 
                        rows="3" 
                        placeholder="Tuliskan feedback atau permintaan koreksi kepada Merchant di sini..."
                        className="w-full p-3 border rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                </div>
            </div>

            {/* Footer Aksi */}
            <div className="p-5 flex justify-end gap-3 border-t">
                <button onClick={() => onReject(data.id)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md flex items-center gap-2 transition-colors">
                    <X size={20} /> Tolak
                </button>
                <button onClick={() => onVerify(data.id)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md flex items-center gap-2 transition-colors">
                    <CheckCircle size={20} /> Verifikasi & Setujui
                </button>
            </div>
        </motion.div>
    </div>
);


export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState('merchants');
    const [selectedItem, setSelectedItem] = useState(null);

    const handleVerify = (id) => {
        alert(`Item ID ${id} berhasil diverifikasi!`);
        setSelectedItem(null);
        // Di aplikasi nyata, panggil API Laravel untuk mengubah status database
    };

    const handleReject = (id) => {
        alert(`Item ID ${id} ditolak. Feedback akan dikirim.`);
        setSelectedItem(null);
        // Di aplikasi nyata, panggil API Laravel
    };

    // Tampilan Tabel Merchant
    const renderMerchantTable = () => (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
            <table className="table w-full">
                <thead>
                    <tr className='bg-gray-100 text-gray-700'>
                        <th>ID</th>
                        <th>Nama Toko</th>
                        <th>Pemilik</th>
                        <th>Konsep Utama</th>
                        <th>Diajukan</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {mockPendingMerchants.map(m => (
                        <tr key={m.id} className='hover:bg-green-50/50 transition-colors'>
                            <td>{m.id}</td>
                            <td>{m.name}</td>
                            <td>{m.owner}</td>
                            <td>{m.concept.substring(0, 40)}...</td>
                            <td>{m.date}</td>
                            <td>
                                <button 
                                    // PENTING: Mengirim seluruh objek data ke modal
                                    onClick={() => setSelectedItem({ type: 'merchant', ...m })}
                                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                                >
                                    Tinjau
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Tampilan Tabel Menu
    const renderMenuTable = () => (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
            <table className="table w-full">
                <thead>
                    <tr className='bg-gray-100 text-gray-700'>
                        <th>ID</th>
                        <th>Nama Menu</th>
                        <th>Restoran</th>
                        <th>Kategori Klaim</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {mockPendingMenus.map(m => (
                        <tr key={m.id} className='hover:bg-yellow-50/50 transition-colors'>
                            <td>{m.id}</td>
                            <td>{m.menuName}</td>
                            <td>{m.merchant}</td>
                            <td>{m.category}</td>
                            <td><span className='text-yellow-600 font-medium'>{m.status}</span></td>
                            <td>
                                <button 
                                    onClick={() => setSelectedItem({ type: 'menu', ...m })}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                                >
                                    Audit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 pt-24 md:pt-28 pb-12">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-6 flex items-center gap-3">
                    <LayoutDashboard className='w-10 h-10 text-green-600'/> Dashboard Admin
                </h1>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KpiCard title="Toko Menunggu" value={mockKPI.pendingVerification} icon={Store} color="text-red-500 border-red-500"/>
                    <KpiCard title="Menu Baru (Audit)" value={mockPendingMenus.length} icon={Utensils} color="text-yellow-500 border-yellow-500"/>
                    <KpiCard title="Total Menu Aktif" value={mockKPI.activeMenus} icon={CheckCircle} color="text-green-600 border-green-600"/>
                    <KpiCard title="Total Toko Terdaftar" value={mockKPI.totalMerchants} icon={User} color="text-blue-500 border-blue-500"/>
                </div>

                {/* Kontainer Utama */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    {/* Tab Navigation */}
                    <div role="tablist" className="tabs tabs-boxed mb-6 bg-gray-100">
                        <a 
                            role="tab" 
                            className={`tab text-gray-700 font-semibold ${activeTab === 'merchants' ? 'tab-active bg-green-600 !text-white shadow-md' : 'hover:bg-gray-200'}`}
                            onClick={() => setActiveTab('merchants')}
                        >
                            Verifikasi Toko ({mockPendingMerchants.length})
                        </a>
                        <a 
                            role="tab" 
                            className={`tab text-gray-700 font-semibold ${activeTab === 'menus' ? 'tab-active bg-green-600 !text-white shadow-md' : 'hover:bg-gray-200'}`}
                            onClick={() => setActiveTab('menus')}
                        >
                            Verifikasi Menu ({mockPendingMenus.length})
                        </a>
                        <a 
                            role="tab" 
                            className={`tab text-gray-700 font-semibold ${activeTab === 'moderation' ? 'tab-active bg-green-600 !text-white shadow-md' : 'hover:bg-gray-200'}`}
                            onClick={() => setActiveTab('moderation')}
                        >
                            Moderasi Ulasan
                        </a>
                    </div>

                    {/* Tab Content */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'merchants' && (
                            <div className='space-y-4'>
                                <p className='text-sm text-gray-600'>Tinjau pengajuan toko baru dan konsep kesehatan yang mereka ajukan.</p>
                                {renderMerchantTable()}
                            </div>
                        )}
                        {activeTab === 'menus' && (
                            <div className='space-y-4'>
                                <p className='text-sm text-gray-600'>Audit menu yang baru ditambahkan untuk memverifikasi klaim gizi dan bahan baku.</p>
                                {renderMenuTable()}
                            </div>
                        )}
                        {activeTab === 'moderation' && (
                            <div className="p-4 text-center text-gray-600">
                                Fitur Moderasi Ulasan akan ditambahkan di fase selanjutnya (Backend Logic).
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
            
            {/* Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <VerificationModal 
                        type={selectedItem.type} 
                        data={selectedItem} 
                        onClose={() => setSelectedItem(null)}
                        onVerify={() => handleVerify(selectedItem.id)}
                        onReject={() => handleReject(selectedItem.id)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}