import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react'; 

export default function StoreVerificationPending() {
    return (
        <div className="min-h-screen-safe bg-gray-50 flex items-center justify-center p-4 pt-12 md:pt-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-8 max-w-lg text-center border-t-8 border-yellow-500"
            >
                <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-yellow-600">
                    <Clock className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-3">Toko Anda Sedang Diverifikasi</h1>
                <p className="text-gray-600 mb-6">
                    Terima kasih telah mendaftarkan toko Anda di RasoSehat. Tim kami sedang meninjau dokumen dan informasi yang Anda berikan.
                </p>
                <p className="text-gray-500 text-sm">
                    Proses verifikasi biasanya memakan waktu 1-2 hari kerja. Anda akan menerima notifikasi setelah toko Anda aktif.
                </p>
                <Link 
                    to="/" 
                    className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                    Kembali ke Beranda
                </Link>
            </motion.div>
        </div>
    );
}