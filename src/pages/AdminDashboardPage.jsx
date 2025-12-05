import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Utensils, CheckCircle, Clock, User, MapPin, Phone, Mail, X, LogOut, MessageSquare, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import AdminUserManagement from '../components/AdminUserManagement';
import { useAuth } from '../context/AuthContext';

// Determine backend origin from API base URL so document links point to backend
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/api\/?$/i, '');

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
const VerificationModal = ({ type, data, onClose, onVerify, onReject }) => {
  const [note, setNote] = React.useState('');
  return (
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
              <p className='text-sm flex items-center gap-2'><Mail size={16}/> <strong>Email:</strong> {data.ownerEmail || data.email || '-'}</p>
              <p className='text-sm flex items-center gap-2'><Phone size={16}/> <strong>Kontak WA:</strong> {data.contact}</p>
              <p className='text-sm flex items-center gap-2'><Clock size={16}/> <strong>Jam Buka:</strong> {data.openHours || data.operatingHours || '-'}</p>
              <p className='text-sm flex items-center gap-2'><strong>Saluran Pemesanan:</strong> {data.salesChannels || '-'}</p>
              <p className='text-sm flex items-center gap-2'><strong>Website / Sosial Media:</strong> {data.socialMedia || '-'}</p>
              <p className='text-sm flex items-center gap-2'><strong>Kategori Toko:</strong> {data.storeCategory || '-'}</p>
              <p className='text-sm flex items-center gap-2'><strong>Fokus Kesehatan:</strong> {(data.healthFocus && data.healthFocus.length) ? data.healthFocus.join(', ') : '-'}</p>
              <p className='text-sm flex items-center gap-2'><strong>Jenis Lemak Dominan:</strong> {data.dominantFat || '-'}</p>
              <p className='text-sm flex items-center gap-2'><strong>Metode Masak:</strong> {(data.cookingMethods && data.cookingMethods.length) ? data.cookingMethods.join(', ') : '-'}</p>
              <p className='text-sm flex items-start gap-2'><MapPin size={16} className='flex-shrink-0 mt-1'/> <strong>Koordinat Maps:</strong> {data.mapsLatLong || '-'}</p>
              <p className='text-sm flex items-start gap-2'><MapPin size={16} className='flex-shrink-0 mt-1'/> <strong>Alamat:</strong> {data.address}</p>
              <p className='text-sm flex items-start gap-2'><Clock size={16} className='flex-shrink-0 mt-1'/> <strong>Tanggal Pengajuan:</strong> {data.date}</p>
            </div>
            
            {/* Kolom Kanan: Konsep & Bukti */}
            <div className='bg-green-50 rounded-xl p-4 space-y-3 border border-green-200'>
              <h4 className='font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2'><CheckCircle size={20}/> Konsep Kesehatan Toko</h4>
              <p className='text-gray-700 italic border-l-2 pl-3 border-green-500 text-sm leading-relaxed'>
                {data.concept}
              </p>
              <h4 className='font-bold text-sm text-gray-800 mt-4'>Document</h4>
              <div className='space-y-3'>
                {data.documents && data.documents.length > 0 ? (
                  data.documents.map((doc, idx) => (
                    <div key={idx} className='flex items-center gap-3'>
                        {String(doc).match(/\.(jpg|jpeg|png)$/i) ? (
                        <img src={String(doc).startsWith('/') ? API_ORIGIN + doc : doc} alt={`doc-${idx}`} className='w-28 h-20 object-cover rounded border' />
                      ) : (
                        <div className='w-28 h-20 flex items-center justify-center rounded border bg-white text-xs text-gray-600'>File</div>
                      )}
                      <div className='flex flex-col'>
                        <a href={String(doc).startsWith('/') ? API_ORIGIN + doc : doc} target='_blank' rel='noreferrer' className='text-sm text-green-700 underline'>Lihat / Unduh</a>
                        <span className='text-xs text-gray-500'>{String(doc).split('/').pop()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  data.docUrl ? (
                    <img src={data.docUrl} alt="Dokumen Pendukung" className="w-full rounded-lg border border-gray-300" />
                  ) : (
                    <p className='text-sm text-gray-600'>Tidak ada dokumen yang diunggah.</p>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bagian 2: Detail Menu */}
        {type === 'menu' && (
          <div className='p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4'>
            <h4 className='font-bold text-lg text-gray-800'>Detail Audit Menu {data.nama_menu || data.menuName}</h4>
            
            {/* Informasi Dasar */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700'>Nama Menu</label>
                <p className='text-gray-900'>{data.nama_menu || 'N/A'}</p>
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700'>Deskripsi</label>
                <p className='text-gray-900'>{data.deskripsi || 'N/A'}</p>
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700'>Harga</label>
                <p className='text-gray-900'>Rp {data.harga ? Number(data.harga).toLocaleString('id-ID') : 'N/A'}</p>
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700'>Status Verifikasi</label>
                <p className='text-gray-900'>{data.status_verifikasi || 'N/A'}</p>
              </div>
            </div>

            {/* Bahan Baku dan Metode Masak */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700'>Bahan Baku</label>
                <p className='text-gray-900'>{data.bahan_baku || 'N/A'}</p>
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700'>Metode Masak</label>
                <p className='text-gray-900'>{data.metode_masak || 'N/A'}</p>
              </div>
            </div>

            {/* Klaim Diet */}
            <div>
              <label className='block text-sm font-semibold text-gray-700'>Klaim Diet</label>
              <p className='text-gray-900'>
                {data.diet_claims ? (Array.isArray(data.diet_claims) ? data.diet_claims.join(', ') : data.diet_claims) : 'N/A'}
              </p>
            </div>

            {/* Nilai Gizi */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Nilai Gizi per Porsi</label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div>
                  <span className='text-xs text-gray-500'>Kalori</span>
                  <p className='font-semibold'>{data.kalori || 0} kkal</p>
                </div>
                <div>
                  <span className='text-xs text-gray-500'>Protein</span>
                  <p className='font-semibold'>{data.protein || 0} g</p>
                </div>
                <div>
                  <span className='text-xs text-gray-500'>Lemak</span>
                  <p className='font-semibold'>{data.lemak || 0} g</p>
                </div>
                <div>
                  <span className='text-xs text-gray-500'>Gula</span>
                  <p className='font-semibold'>{data.gula || 0} g</p>
                </div>
                <div>
                  <span className='text-xs text-gray-500'>Serat</span>
                  <p className='font-semibold'>{data.serat || 0} g</p>
                </div>
                <div>
                  <span className='text-xs text-gray-500'>Lemak Jenuh</span>
                  <p className='font-semibold'>{data.lemak_jenuh || 0} g</p>
                </div>
              </div>
            </div>

            {/* Foto */}
            {data.foto && (
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Foto Menu</label>
                <img src={data.foto.startsWith('/') ? `${API_ORIGIN}${data.foto}` : data.foto} alt="Foto Menu" className="w-32 h-32 object-cover rounded-lg border" />
              </div>
            )}

            {/* Catatan Admin */}
            {data.catatan_admin && (
              <div>
                <label className='block text-sm font-semibold text-gray-700'>Catatan Admin Sebelumnya</label>
                <p className='text-gray-900'>{data.catatan_admin}</p>
              </div>
            )}
          </div>
        )}

        {/* Bagian 3: Feedback/Note Section */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-2'>Catatan Admin (Wajib diisi jika Tolak):</label>
          <textarea 
            rows="3" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tuliskan feedback atau permintaan koreksi kepada Merchant di sini..."
            className="w-full p-3 border rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Footer Aksi */}
      <div className="p-5 flex justify-end gap-3 border-t">
        <button onClick={() => onReject(data.id, note)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md flex items-center gap-2 transition-colors">
          <X size={20} /> Tolak & Kirim Catatan
        </button>
        <button onClick={() => onVerify(data.id, note)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md flex items-center gap-2 transition-colors">
          <CheckCircle size={20} /> Verifikasi & Kirim Undangan
        </button>
      </div>
    </motion.div>
    </div>
  );
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('merchants');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [pendingMerchants, setPendingMerchants] = useState([]);
  const [pendingMenus, setPendingMenus] = useState([]);
  const [_loading, setLoading] = useState(false);
  const [_error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if we know user is an authenticated admin
    const fetchPending = async () => {
      // If still determining auth state, wait
      if (isLoading) return;

      if (!isAuthenticated || !isAdmin) {
        // redirect to sign-in for non-admin users
        console.warn('[AdminDashboard] blocked: user not admin or not authenticated');
        navigate('/signin');
        return;
      }

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
        // If 403 from server, treat as unauthorized and redirect
        const status = e?.response?.status;
        if (status === 401 || status === 403) {
          setError('Akses ditolak: Anda tidak memiliki izin admin. Silakan login sebagai admin.');
          navigate('/signin');
          return;
        }
        setError('Gagal memuat data pending. Pastikan Anda login sebagai admin.');
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  const handleVerify = async (id, note = '') => {
    try {
      // If verifying a menu, call the menu verify endpoint and remove from pendingMenus
      if (selectedItem && selectedItem.type === 'menu') {
        await api.put(`/admin/verify/menu/${id}`, { status: 'approved' });
        setPendingMenus(prev => prev.filter(m => Number(m.id) !== Number(id)));
        setSelectedItem(null);
        alert('Menu berhasil diverifikasi.');
        return;
      }

      // Otherwise treat as restaurant verification
      await api.patch(`/admin/restaurants/${id}/verify`, { status: 'approved', note });
      setPendingMerchants(prev => prev.filter(p => Number(p.id) !== Number(id)));
      setSelectedItem(null);
      alert('Restoran berhasil diverifikasi dan pemilik telah diberi tahu.');
    } catch (e) {
      console.error('verify error', e);
      alert('Gagal memverifikasi. Periksa konsol.');
    }
  };

  const handleReject = async (id, note = '') => {
    // For restaurant rejection, note is required
    if ((!note || !note.trim()) && (!selectedItem || selectedItem.type !== 'menu')) {
      alert('Mohon isi catatan admin ketika menolak permohonan.');
      return;
    }

    try {
      if (selectedItem && selectedItem.type === 'menu') {
        // Menu verify endpoint doesn't currently accept a note in backend, send status only
        await api.put(`/admin/verify/menu/${id}`, { status: 'rejected' });
        setPendingMenus(prev => prev.filter(m => Number(m.id) !== Number(id)));
        setSelectedItem(null);
        alert('Menu ditolak.');
        return;
      }

      await api.patch(`/admin/restaurants/${id}/verify`, { status: 'rejected', note });
      setPendingMerchants(prev => prev.filter(p => Number(p.id) !== Number(id)));
      setSelectedItem(null);
      alert('Permohonan ditolak dan catatan telah dikirimkan ke pemilik.');
    } catch (e) {
      console.error('reject error', e);
      alert('Gagal memproses penolakan. Periksa konsol.');
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
            // Robust document parsing: support multiple shapes stored in DB or returned by API
            const parseDocuments = (item) => {
              try {
                if (!item) return [];
                // If API already returned an array
                if (Array.isArray(item.documents)) return item.documents.filter(Boolean);

                // If API returned a JSON string in `documents`
                if (typeof item.documents === 'string') {
                  try {
                    const parsed = JSON.parse(item.documents);
                    if (Array.isArray(parsed)) return parsed.filter(Boolean);
                    if (parsed && typeof parsed === 'object') {
                      return ([...(Array.isArray(parsed.foto_ktp) ? parsed.foto_ktp : []), ...(Array.isArray(parsed.dokumen_usaha) ? parsed.dokumen_usaha : []), ...(Array.isArray(parsed.npwp) ? parsed.npwp : [])]).filter(Boolean);
                    }
                  } catch { void 0; }
                }

                // Try documents_json field
                let dj = item.documents_json;
                if (typeof dj === 'string') {
                  try { dj = JSON.parse(dj); } catch { void 0; }
                }
                if (Array.isArray(dj)) return dj.filter(Boolean);
                if (dj && typeof dj === 'object') {
                  return ([...(Array.isArray(dj.foto_ktp) ? dj.foto_ktp : []), ...(Array.isArray(dj.dokumen_usaha) ? dj.dokumen_usaha : []), ...(Array.isArray(dj.npwp) ? dj.npwp : [])]).filter(Boolean);
                }

                // Fallback to single-file columns
                return [item.foto_ktp, item.dokumen_usaha, item.npwp].filter(Boolean);
              } catch {
                return [];
              }
            };

            const derivedDocs = parseDocuments(m);

            const row = {
              id: m.id,
              name: m.nama_restoran || m.name || '—',
              owner: m.owner_name || m.user_id || m.owner || '—',
              ownerEmail: m.owner_email || m.ownerEmail || m.email || '-',
              concept: m.deskripsi || '—',
              address: m.alamat || m.address || '—',
              date: m.created_at || m.tanggal || '—',
              contact: m.no_telepon || m.phone_admin || m.contact || '—',
              operatingHours: m.operating_hours || m.openHours || null,
              salesChannels: m.sales_channels || null,
              socialMedia: m.social_media || null,
              storeCategory: m.store_category || null,
              healthFocus: (m.health_focus && typeof m.health_focus === 'string') ? (() => { try { return JSON.parse(m.health_focus); } catch { return [m.health_focus]; } })() : (m.health_focus || []),
              dominantFat: m.dominant_fat || m.dominantFat || null,
              cookingMethods: (m.dominant_cooking_method && typeof m.dominant_cooking_method === 'string') ? (() => { try { return JSON.parse(m.dominant_cooking_method); } catch { return [m.dominant_cooking_method]; } })() : (m.dominant_cooking_method || m.dominantCookingMethod || []),
              mapsLatLong: m.maps_latlong || m.mapsLatLong || null,
              documents: (derivedDocs && derivedDocs.length) ? derivedDocs : ([m.foto_ktp, m.dokumen_usaha, m.npwp].filter(Boolean)),
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
                    onClick={async () => {
                      // try to fetch fresh, normalized restaurant object from server
                      try {
                        const res = await api.get(`/admin/restaurant/${row.id}`);
                        const r = res.data;
                        setSelectedItem({ type: 'merchant', ...r });
                        return;
                      } catch (e) {
                        // fallback to row-derived data if API call fails
                        console.warn('Could not fetch restaurant detail, using row data fallback', e);
                        setSelectedItem({
                          type: 'merchant',
                          id: row.id,
                          name: row.name,
                          owner: row.owner,
                          ownerEmail: row.ownerEmail,
                          contact: row.contact,
                          openHours: row.operatingHours,
                          address: row.address,
                          date: row.date,
                          concept: row.concept,
                          salesChannels: row.salesChannels,
                          socialMedia: row.socialMedia,
                          storeCategory: row.storeCategory,
                          healthFocus: row.healthFocus,
                          dominantFat: row.dominantFat,
                          cookingMethods: row.cookingMethods,
                          mapsLatLong: row.mapsLatLong,
                          documents: row.documents,
                        });
                      }
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
        onClick={() => setActiveTab('users')} 
        className={`group w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
          activeTab === 'users' 
            ? 'bg-white text-green-700 shadow-lg scale-105' 
            : 'text-white hover:bg-green-600/50 hover:translate-x-1'
        }`}
      >
        <div className={`p-2 rounded-lg ${activeTab === 'users' ? 'bg-green-100' : 'bg-green-600/30'}`}>
          <User size={20} className={activeTab === 'users' ? 'text-green-700' : 'text-white'}/>
        </div>
        <span className="flex-1">Manajemen Pengguna</span>
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
                  className={`tab text-gray-700 font-semibold text-xs ${activeTab === 'users' ? 'tab-active !bg-green-600 !text-white shadow-lg' : 'hover:bg-green-200'}`}
                  onClick={() => setActiveTab('users')}
                >
                  Pengguna
                </a>
                <a 
                  role="tab" 
                  className={`tab text-gray-700 font-semibold text-xs ${activeTab === 'merchants' ? 'tab-active !bg-green-600 !text-white shadow-lg' : 'hover:bg-green-200'}`}
                  onClick={() => setActiveTab('merchants')}
                >
                  Toko ({pendingMerchants.length})
                </a>
                <a 
                  role="tab" 
                  className={`tab text-gray-700 font-semibold text-xs ${activeTab === 'menus' ? 'tab-active !bg-green-600 !text-white shadow-lg' : 'hover:bg-green-200'}`}
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

                {activeTab === 'users' && (
                  <AdminUserManagement />
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
            onVerify={handleVerify}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}