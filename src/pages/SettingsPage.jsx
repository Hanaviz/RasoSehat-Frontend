import React from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from "framer-motion";
import { Settings, Lock, ChevronRight, LogOut } from "lucide-react";

// Komponen Reusable untuk setiap item pengaturan
const SettingItem = ({ title, description, icon: Icon, onClick }) => (
  <button
    // type="button" dihilangkan karena tombol utama di PageLayout sudah diperbaiki
    onClick={onClick}
    className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer w-full text-left border border-gray-100 hover:border-green-300 group"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-full bg-green-500/10 text-green-600 group-hover:bg-green-500/20">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-semibold text-lg text-gray-800 group-hover:text-green-700">
          {title}
        </h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-transform duration-300" />
  </button>
);

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleSettingClick = (settingName) => {
    // For Ubah Kata Sandi navigate to dedicated page
    if (settingName === 'Ubah Kata Sandi') {
      navigate('/settings/change-password');
      return;
    }
    if (settingName === 'Logout') {
      try { logout(); } catch (e) { /* ignore */ }
      navigate('/signin');
      return;
    }
    alert(`Membuka pengaturan: ${settingName}. (Simulasi)`);
  };

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-green-50 via-white to-gray-50 pt-24 md:pt-28 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Utama (Konsisten dengan ProfilePage) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8" /> Pengaturan Aplikasi
          </h1>
          <p className="text-green-100">
            Sesuaikan preferensi, notifikasi, dan keamanan akun RasoSehat Anda.
          </p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Section: Akun & Keamanan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-4"
        >
          <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
            Akun & Keamanan
          </h3>
          <SettingItem
            title="Ubah Kata Sandi"
            description="Perbarui kata sandi Anda secara berkala untuk keamanan."
            icon={Lock}
            onClick={() => handleSettingClick("Ubah Kata Sandi")}
          />

          <SettingItem
            title="Logout"
            description="Keluar dari akun Anda saat ini."
            icon={LogOut}
            onClick={() => handleSettingClick("Logout")}
          />
        </motion.div>
        {/* Other settings removed (notifications, language, 2FA, support) per project preference */}
      </div>
    </div>
  );
}