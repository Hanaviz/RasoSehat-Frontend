// src/pages/MyStorePage.jsx (Placeholder)

import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Edit2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyStorePage() {
  const isVerified = false; // Ganti dengan status verifikasi toko (dari backend)
  
  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 md:p-12 bg-white rounded-3xl shadow-2xl border-t-8 border-green-600 space-y-6"
        >
            <div className="flex items-center gap-4 border-b pb-4">
                <Utensils className="w-10 h-10 text-green-600"/>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">Dashboard Toko Anda</h1>
                    <p className="text-gray-600">Selamat datang, Healthy Corner! Kelola menu dan informasi toko di sini.</p>
                </div>
            </div>

            {/* Status Verifikasi (Penting untuk RPL) */}
            <div className={`p-5 rounded-xl ${isVerified ? 'bg-green-100 border-green-500' : 'bg-yellow-100 border-yellow-500'} border-2`}>
                <div className="flex items-center gap-3">
                    {isVerified ? (
                        <CheckCircle className="w-6 h-6 text-green-700" />
                    ) : (
                        <AlertTriangle className="w-6 h-6 text-yellow-700" />
                    )}
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">
                            {isVerified ? 'Verifikasi Selesai!' : 'Menunggu Verifikasi Admin'}
                        </h3>
                        <p className="text-sm text-gray-700">
                            {isVerified 
                                ? 'Toko Anda telah diverifikasi. Mulai tambahkan menu sehat Anda!'
                                : 'Pengajuan toko Anda sedang ditinjau. Anda dapat mulai mengelola menu sambil menunggu verifikasi identitas (2x24 jam).'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Tombol Aksi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <Link
                    to="/menu-management" // Asumsikan route untuk manajemen menu
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all duration-300 hover:scale-[1.01]"
                >
                    <Edit2 size={20} /> Kelola Menu (Verifikasi)
                </Link>
                <Link
                    to="/store-settings"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-300 hover:scale-[1.01]"
                >
                    <Utensils size={20} /> Edit Info Toko
                </Link>
                <Link
                    to="/store-reports"
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-300 hover:scale-[1.01]"
                >
                    <BarChart size={20} /> Laporan Penjualan (Mock)
                </Link>
            </div>
            
        </motion.div>
      </div>
    </div>
  );
}

// Tambahkan ikon di sini agar tidak perlu import dari lucide-react di tempat lain
import { AlertTriangle, BarChart } from 'lucide-react';