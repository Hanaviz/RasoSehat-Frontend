import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { unwrap, makeImageUrl } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, TrendingUp, Clock, CheckCircle, XCircle, Edit3, Trash2, 
  Plus, Star, MapPin, Phone, Globe, Package, ChevronRight, AlertCircle, LogOut 
} from 'lucide-react';
import HeroMenuCard from '../components/HeroMenuCard';

export default function MyStorePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [menuStats, setMenuStats] = useState({ totalMenu: 0, pending: 0, approved: 0, rejected: 0 });
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchMyStore = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get('/my-store');
        const payload = unwrap(res) || res?.data || {};
        const success = res?.data?.success ?? true;
        if (success) {
          setRestaurant(payload.restaurant || null);
          setMenus(payload.menus || []);
          setMenuStats(payload.menuStats || { totalMenu: 0, pending: 0, approved: 0, rejected: 0 });
        } else {
          setRestaurant(null);
          setMenus([]);
          setMenuStats({ totalMenu: 0, pending: 0, approved: 0, rejected: 0 });
        }
      } catch (err) {
        console.error('Failed to fetch my-store', err);
        setError(err.response?.data?.message || 'Gagal memuat data toko.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyStore();
  }, [isAuthenticated, user]);

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/menus/${deleteTarget}`);
      setMenus((prev) => prev.filter(m => m.id !== deleteTarget));
      setToast({ type: 'success', message: 'Menu berhasil dihapus' });
    } catch (err) {
      console.error('Delete menu failed', err);
      setToast({ type: 'error', message: 'Gagal hapus menu' });
    } finally {
      setDeleteTarget(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const cancelDelete = () => setDeleteTarget(null);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.03, boxShadow: '0 20px 40px rgba(5, 150, 105, 0.15)' }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      disetujui: {
        icon: CheckCircle,
        text: 'Disetujui',
        className: 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white shadow-lg'
      },
      ditolak: {
        icon: XCircle,
        text: 'Ditolak',
        className: 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white shadow-lg'
      },
      pending: {
        icon: Clock,
        text: 'Menunggu',
        className: 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow-lg'
      }
    };

    const { icon: Icon, text, className } = config[status] || config.pending;

    return (
      <motion.span 
        className={className}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon className="w-3 h-3" />
        {text}
      </motion.span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <motion.div 
            className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-700 font-medium">Memuat data toko...</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-6"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Coba Lagi
          </button>
        </div>
      </motion.div>
    );
  }

  // No restaurant state
  if (!restaurant) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-6"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-12 text-center">
          <motion.div 
            className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Store className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Mulai Berjualan Sekarang!</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            Daftarkan toko Anda dan jangkau lebih banyak pelanggan yang mencari makanan sehat di Padang
          </p>
          <motion.button 
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            onClick={() => window.location.href = '/register-store'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-6 h-6" />
            Daftarkan Toko Sekarang
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Main dashboard
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        
        {/* Header: Restaurant Info */}
        <motion.div 
          className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-3xl shadow-2xl mb-6 overflow-hidden"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Left: Store Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center overflow-hidden">
                    {restaurant.foto ? (
                      <img
                        src={makeImageUrl(restaurant.foto)}
                        alt={restaurant.nama_restoran}
                        className="w-full h-full object-cover"
                        onError={(e) => { console.warn('Failed to load restaurant foto', e); }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{restaurant.nama_restoran}</h1>
                    <StatusBadge status={restaurant.status_verifikasi} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-green-100" />
                    <div>
                      <p className="text-xs text-green-100 mb-1">Alamat</p>
                      <p className="text-sm font-medium">{restaurant.alamat}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 mt-1 flex-shrink-0 text-green-100" />
                    <div>
                      <p className="text-xs text-green-100 mb-1">Telepon</p>
                      <p className="text-sm font-medium">{restaurant.no_telepon || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-1 flex-shrink-0 text-green-100" />
                    <div>
                      <p className="text-xs text-green-100 mb-1">Jam Operasional</p>
                      <p className="text-sm font-medium">{restaurant.operating_hours || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 mt-1 flex-shrink-0 text-green-100" />
                    <div>
                      <p className="text-xs text-green-100 mb-1">Media Sosial</p>
                      <p className="text-sm font-medium">{restaurant.social_media || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Buttons */}
              <div className="flex gap-2">
                <motion.button 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/my-store/edit')}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Toko
                </motion.button>
                <motion.button 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                  onClick={() => { logout(); navigate('/signin'); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {[
            { 
              label: 'Total Menu', 
              value: menuStats.totalMenu, 
              icon: Package,
              bgGradient: 'from-blue-500 to-blue-600',
              bgLight: 'bg-blue-50'
            },
            { 
              label: 'Disetujui', 
              value: menuStats.approved, 
              icon: CheckCircle,
              bgGradient: 'from-green-500 to-green-600',
              bgLight: 'bg-green-50'
            },
            { 
              label: 'Menunggu', 
              value: menuStats.pending, 
              icon: Clock,
              bgGradient: 'from-yellow-500 to-orange-500',
              bgLight: 'bg-yellow-50'
            },
            { 
              label: 'Ditolak', 
              value: menuStats.rejected, 
              icon: XCircle,
              bgGradient: 'from-red-500 to-red-600',
              bgLight: 'bg-red-50'
            }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-shadow"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgGradient} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <motion.h3 
                className="text-3xl font-bold text-gray-900"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1, type: "spring" }}
              >
                {stat.value}
              </motion.h3>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Menu List */}
        <motion.div 
          className="bg-white rounded-3xl shadow-2xl p-6 md:p-8"
          variants={cardVariants}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              Daftar Menu
            </h2>
            <motion.button 
              className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/add-menu')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">Tambah Menu</span>
            </motion.button>
          </div>

          {menus.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Menu</h3>
              <p className="text-gray-600 mb-6">Mulai tambahkan menu makanan sehat Anda</p>
              <motion.button 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate('/add-menu')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                Tambah Menu Pertama
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {menus.map((menu) => (
                <HeroMenuCard
                  key={menu.id}
                  menu={{
                    ...menu,
                    image: menu.foto || menu.image || null,
                    name: menu.nama_menu || menu.name,
                    price: menu.harga || menu.price,
                    restaurantName: restaurant?.nama_restoran || menu.restaurantName || '',
                    // pass restaurant phone so contact button can use the store number
                    whatsappNumber: restaurant?.no_telepon || menu.whatsappNumber || menu.no_telepon || null,
                    // pass restaurant maps link so the card's Lokasi button opens the saved Google Maps link
                    mapsLink: restaurant?.maps_link || restaurant?.mapsLink || menu.mapsLink || menu.maps_latlong || null
                  }}
                  onEdit={(m) => navigate('/edit-menu/' + encodeURIComponent(m.id))}
                  onDelete={(id) => handleDeleteClick(id)}
                />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Floating Action Button */}
        <motion.button
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full shadow-2xl flex items-center justify-center z-50"
          onClick={() => navigate('/add-menu')}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Confirmation modal component (framer-motion)
function ConfirmDeleteModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-6 z-50 w-full max-w-md shadow-2xl"
      >
        <h3 className="text-lg font-bold mb-3">Hapus Menu</h3>
        <p className="text-sm text-gray-600 mb-6">Yakin ingin menghapus menu ini? Tindakan tidak dapat dibatalkan.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border">Batal</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white">Hapus</button>
        </div>
      </motion.div>
    </div>
  );
}

// Small toast
function SmallToast({ item }) {
  if (!item) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 p-3 rounded-lg shadow-lg ${item.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
      <div className="font-semibold text-sm">{item.type === 'success' ? 'Berhasil' : 'Gagal'}</div>
      <div className="text-sm">{item.message}</div>
    </div>
  );
}