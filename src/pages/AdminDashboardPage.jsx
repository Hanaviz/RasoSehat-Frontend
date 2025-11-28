import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Utensils, CheckCircle, Clock, User, MapPin, Phone, Mail, X, LogOut, MessageSquare, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

// State will hold live data from backend

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

// Komponen Modal Detail Verifikasi
const VerificationModal = ({ type, data, onClose, onVerify, onReject }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl" 
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
              <p className='text-sm flex items-center gap-2'><User size={16}/> <strong>Nama Pemilik:</strong> {data.owner}</p>
              <p className='text-sm flex items-center gap-2'><Mail size={16}/> <strong>Email:</strong> {data.email}</p>
              <p className='text-sm flex items-center gap-2'><Phone size={16}/> <strong>Kontak WA:</strong> {data.contact}</p>
              <p className='text-sm flex items-center gap-2'><Clock size={16}/> <strong>Jam Buka:</strong> {data.openHours}</p>
              <p className='text-sm flex items-start gap-2'><MapPin size={16} className='flex-shrink-0 mt-1'/> <strong>Alamat:</strong> {data.address}</p>
              <p className='text-sm flex items-start gap-2'><Clock size={16} className='flex-shrink-0 mt-1'/> <strong>Tanggal Pengajuan:</strong> {data.date}</p>
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

        {/* Bagian 2: Detail Menu */}
        {type === 'menu' && (
          <div className='p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3'>
            <h4 className='font-bold text-lg text-gray-800'>Detail Audit Menu {data.menuName}</h4>
            <p className='text-gray-700 italic'>[Placeholder untuk detail Gizi, Bahan, dan Metode Masak dari Menu]</p>
            <p className='text-xs text-red-500'>*Implementasi detail menu memerlukan integrasi API yang lengkap.*</p>
          </div>
        )}

        {/* Bagian 3: Feedback/Note Section */}
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('merchants');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [pendingMerchants, setPendingMerchants] = useState([]);
  const [pendingMenus, setPendingMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiOrigin = (() => {
    try {
      return api.defaults.baseURL.replace(/\/api$/, '');
    } catch (e) {
      return 'http://localhost:3000';
    }
  })();

  useEffect(() => {
    // Fetch pending restaurants and menus
    const fetchPending = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resR, resM] = await Promise.all([
          api.get('/admin/pending/restaurants'),
          api.get('/admin/pending/menus').catch(() => ({ data: [] }))
        ]);

        // support both raw array or { data: [...] }
        const merchants = Array.isArray(resR.data) ? resR.data : (resR.data && resR.data.data ? resR.data.data : []);
        const menus = Array.isArray(resM.data) ? resM.data : (resM.data && resM.data.data ? resM.data.data : []);

        setPendingMerchants(merchants);
        setPendingMenus(menus);
      } catch (e) {
        console.error('Failed to fetch pending items', e);
        setError('Gagal memuat data pending. Pastikan Anda login sebagai admin.');
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  const handleVerify = async (id) => {
    try {
      await api.put(`/admin/verify/restaurant/${id}`, { status: 'approved' });
      setPendingMerchants(prev => prev.filter(p => Number(p.id) !== Number(id)));
      setSelectedItem(null);
    } catch (e) {
      console.error('verify error', e);
      alert('Gagal memverifikasi restoran. Periksa konsol.');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/verify/restaurant/${id}`, { status: 'rejected' });
      setPendingMerchants(prev => prev.filter(p => Number(p.id) !== Number(id)));
      setSelectedItem(null);
    } catch (e) {
      console.error('reject error', e);
      alert('Gagal menolak restoran. Periksa konsol.');
    }
  };
  
  const handleAdminLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate('/signin');
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
          {pendingMerchants.map(m => {
            const row = {
              id: m.id,
              name: m.nama_restoran || m.name || '—',
              owner: m.user_id || m.owner || '—',
              concept: m.deskripsi || '—',
              address: m.alamat || '—',
              date: m.created_at || m.tanggal || '—',
              contact: m.no_telepon || '—',
              docUrl: m.foto_ktp || m.dokumen_usaha || null,
            };

            return (
              <tr key={row.id} className='hover:bg-green-50/50 transition-colors'>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.owner}</td>
                <td>{(row.concept || '').substring(0, 60)}{row.concept && row.concept.length > 60 ? '...' : ''}</td>
                <td>{row.date ? new Date(row.date).toLocaleString() : '—'}</td>
                <td>
                  <button 
                    onClick={() => {
                      const docFull = row.docUrl && String(row.docUrl).startsWith('/') ? apiOrigin + row.docUrl : row.docUrl;
                      setSelectedItem({ type: 'merchant', ...row, docUrl: docFull });
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                  >
                    Tinjau
                  </button>
                </td>
              </tr>
            );
          })}
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
          {pendingMenus.map(m => (
            <tr key={m.id} className='hover:bg-yellow-50/50 transition-colors'>
              <td>{m.id}</td>
              <td>{m.nama_menu || m.namaMenu || m.menuName}</td>
              <td>{m.nama_restoran || m.restoran_nama || m.merchant}</td>
              <td>{m.kategori || '-'}</td>
              <td><span className='text-yellow-600 font-medium'>{m.status_verifikasi || m.status || '-'}</span></td>
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

  // Komponen Sidebar Navigasi
  const Sidebar = () => (
    <nav className='space-y-3'>
      <button 
        onClick={() => setActiveTab('dashboard')} 
        className={`group w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
          activeTab === 'dashboard' 
            ? 'bg-white text-green-700 shadow-lg scale-105' 
            : 'text-white hover:bg-green-600/50 hover:translate-x-1'
        }`}
      >
        <div className={`p-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-green-100' : 'bg-green-600/30'}`}>
          <LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'text-green-700' : 'text-white'}/>
        </div>
        <span className="flex-1">Ringkasan</span>
      </button>
      
      <button 
        onClick={() => setActiveTab('merchants')} 
        className={`group w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
          activeTab === 'merchants' 
            ? 'bg-white text-green-700 shadow-lg scale-105' 
            : 'text-white hover:bg-green-600/50 hover:translate-x-1'
        }`}
      >
        <div className={`p-2 rounded-lg ${activeTab === 'merchants' ? 'bg-green-100' : 'bg-green-600/30'}`}>
          <Store size={20} className={activeTab === 'merchants' ? 'text-green-700' : 'text-white'}/>
        </div>
        <span className="flex-1">Verifikasi Toko</span>
        {pendingMerchants.length > 0 && (
          <span className='px-2.5 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-md'>
            {pendingMerchants.length}
          </span>
        )}
      </button>
      
      <button 
        onClick={() => setActiveTab('menus')} 
        className={`group w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
          activeTab === 'menus' 
            ? 'bg-white text-green-700 shadow-lg scale-105' 
            : 'text-white hover:bg-green-600/50 hover:translate-x-1'
        }`}
      >
        <div className={`p-2 rounded-lg ${activeTab === 'menus' ? 'bg-green-100' : 'bg-green-600/30'}`}>
          <Utensils size={20} className={activeTab === 'menus' ? 'text-green-700' : 'text-white'}/>
        </div>
        <span className="flex-1">Verifikasi Menu</span>
        {pendingMenus.length > 0 && (
          <span className='px-2.5 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold shadow-md'>
            {pendingMenus.length}
          </span>
        )}
      </button>

      <button 
        onClick={() => setActiveTab('moderation')} 
        className={`group w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
          activeTab === 'moderation' 
            ? 'bg-white text-green-700 shadow-lg scale-105' 
            : 'text-white hover:bg-green-600/50 hover:translate-x-1'
        }`}
      >
        <div className={`p-2 rounded-lg ${activeTab === 'moderation' ? 'bg-green-100' : 'bg-green-600/30'}`}>
          <MessageSquare size={20} className={activeTab === 'moderation' ? 'text-green-700' : 'text-white'}/>
        </div>
        <span className="flex-1">Moderasi Ulasan</span>
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* 1. Sidebar Navigasi (Desktop) - UPGRADED dengan Gradient Hijau */}
      <div className='hidden md:flex flex-col w-72 bg-gradient-to-b from-green-600 via-green-700 to-green-800 text-white p-6 sticky top-0 h-screen shadow-2xl'>
        {/* Logo Header dengan Efek Glassmorphism */}
        <div className='flex items-center gap-3 mb-10 pb-6 border-b border-white/20 backdrop-blur-sm bg-white/10 rounded-2xl p-4 shadow-lg'>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
            <img src="/logo-RasoSehat.png" alt="Logo" className="w-10 h-10 rounded-full"/>
          </div>
          <div>
            <span className='text-xl font-extrabold text-white tracking-tight'>RasoSehat</span>
            <p className='text-xs text-green-100 font-medium'>Admin Panel</p>
          </div>
        </div>
        
        <Sidebar />
        
        {/* Logout Button dengan Gradient */}
        <div className='mt-auto pt-6'>
          <button 
            onClick={handleAdminLogout} 
            className='w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-white'
          >
            <LogOut size={20}/> 
            <span>Logout Admin</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1">
        
        {/* Header Mobile & Tablet dengan Gradient */}
        <header className='md:hidden sticky top-0 z-40 bg-gradient-to-r from-green-600 to-green-700 shadow-lg p-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-3'>
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
                <img src="/logo-RasoSehat.png" alt="Logo" className="w-7 h-7 rounded-full"/>
              </div>
              <div>
                <span className="text-lg font-bold text-white">Admin Panel</span>
                <p className="text-xs text-green-100">RasoSehat</p>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className='p-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl transition-all shadow-md'
            >
              <Menu size={22}/>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <LayoutDashboard className='w-8 h-8 text-green-700'/>
              </div>
              Dashboard Verifikasi
            </h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KpiCard title="Toko Menunggu" value={pendingMerchants.length} icon={Store} color="text-red-500 border-red-500"/>
              <KpiCard title="Menu Baru (Audit)" value={pendingMenus.length} icon={Utensils} color="text-yellow-500 border-yellow-500"/>
              <KpiCard title="Total Menu Aktif" value={pendingMenus.length} icon={CheckCircle} color="text-green-600 border-green-600"/>
              <KpiCard title="Total Toko Terdaftar" value={pendingMerchants.length} icon={User} color="text-blue-500 border-blue-500"/>
            </div>

            {/* Kontainer Utama Tab */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {/* Tab Navigation (Mobile) */}
              <div role="tablist" className="tabs tabs-boxed mb-6 bg-gradient-to-r from-green-50 to-green-100 md:hidden flex-wrap p-1">
                <a 
                  role="tab" 
                  className={`tab text-gray-700 font-semibold ${activeTab === 'merchants' ? 'tab-active !bg-green-600 !text-white shadow-lg' : 'hover:bg-green-200'}`}
                  onClick={() => setActiveTab('merchants')}
                >
                  Toko ({pendingMerchants.length})
                </a>
                <a 
                  role="tab" 
                  className={`tab text-gray-700 font-semibold ${activeTab === 'menus' ? 'tab-active !bg-green-600 !text-white shadow-lg' : 'hover:bg-green-200'}`}
                  onClick={() => setActiveTab('menus')}
                >
                  Menu ({pendingMenus.length})
                </a>
                <a 
                  role="tab" 
                  className={`tab text-gray-700 font-semibold ${activeTab === 'moderation' ? 'tab-active !bg-green-600 !text-white shadow-lg' : 'hover:bg-green-200'}`}
                  onClick={() => setActiveTab('moderation')}
                >
                  Ulasan
                </a>
              </div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'dashboard' && (
                  <div className='space-y-6'>
                    <p className='text-sm text-gray-600'>Selamat datang di panel admin RasoSehat. Berikut ringkasan aktivitas platform.</p>
                    
                    {/* Quick Stats */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200'>
                        <h4 className='font-bold text-green-800 mb-3 flex items-center gap-2'>
                          <Store size={18}/> Aktivitas Toko
                        </h4>
                        <div className='space-y-2 text-sm text-gray-700'>
                          <p className='flex justify-between'><span>Menunggu Verifikasi</span> <span className='font-bold text-red-600'>{pendingMerchants.length}</span></p>
                          <p className='flex justify-between'><span>Total Terdaftar</span> <span className='font-bold text-green-600'>{pendingMerchants.length}</span></p>
                          <p className='flex justify-between'><span>Toko Aktif Bulan Ini</span> <span className='font-bold text-blue-600'>48</span></p>
                        </div>
                      </div>
                      
                      <div className='bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-5 border border-yellow-200'>
                        <h4 className='font-bold text-yellow-800 mb-3 flex items-center gap-2'>
                          <Utensils size={18}/> Aktivitas Menu
                        </h4>
                        <div className='space-y-2 text-sm text-gray-700'>
                          <p className='flex justify-between'><span>Menunggu Audit</span> <span className='font-bold text-yellow-600'>{pendingMenus.length}</span></p>
                          <p className='flex justify-between'><span>Total Menu Aktif</span> <span className='font-bold text-green-600'>{pendingMenus.length}</span></p>
                          <p className='flex justify-between'><span>Menu Ditolak</span> <span className='font-bold text-red-600'>5</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className='bg-gray-50 rounded-xl p-5 border border-gray-200'>
                      <h4 className='font-bold text-gray-800 mb-4 flex items-center gap-2'>
                        <Clock size={18}/> Aktivitas Terbaru
                      </h4>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-3 text-sm p-3 bg-white rounded-lg border'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          <span className='text-gray-600'>Toko <strong>"Warung Sehat Ibu"</strong> berhasil diverifikasi</span>
                          <span className='ml-auto text-xs text-gray-400'>2 jam lalu</span>
                        </div>
                        <div className='flex items-center gap-3 text-sm p-3 bg-white rounded-lg border'>
                          <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                          <span className='text-gray-600'>Menu <strong>"Nasi Merah Rendang"</strong> menunggu audit</span>
                          <span className='ml-auto text-xs text-gray-400'>5 jam lalu</span>
                        </div>
                        <div className='flex items-center gap-3 text-sm p-3 bg-white rounded-lg border'>
                          <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                          <span className='text-gray-600'>Pendaftaran baru dari <strong>"Toko Sehat Bundo"</strong></span>
                          <span className='ml-auto text-xs text-gray-400'>1 hari lalu</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                    Fitur Moderasi Ulasan akan ditambahkan di fase selanjutnya.
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Modal Sidebar Mobile dengan Gradient Hijau */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 150 }}
              className="w-72 bg-gradient-to-b from-green-600 via-green-700 to-green-800 text-white p-6 h-screen shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Logo Header Mobile */}
              <div className='flex items-center gap-3 mb-10 pb-6 border-b border-white/20 backdrop-blur-sm bg-white/10 rounded-2xl p-4 shadow-lg'>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <img src="/logo-RasoSehat.png" alt="Logo" className="w-10 h-10 rounded-full"/>
                </div>
                <div>
                  <span className='text-xl font-extrabold text-white tracking-tight'>RasoSehat</span>
                  <p className='text-xs text-green-100 font-medium'>Admin Panel</p>
                </div>
              </div>
              
              <Sidebar />
              
              {/* Logout Button Mobile */}
              <div className='mt-8 pt-6'>
                <button 
                  onClick={handleAdminLogout} 
                  className='w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl text-white'
                >
                  <LogOut size={20}/> 
                  <span>Logout Admin</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Verifikasi */}
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