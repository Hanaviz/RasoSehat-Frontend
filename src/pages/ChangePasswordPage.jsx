import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, KeyRound, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../components/ChangePasswordForm';

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-white pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <motion.button 
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-green-600 transition-colors duration-200 font-medium group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="hidden sm:inline">Kembali</span>
        </motion.button>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-green-600 to-green-500 px-6 py-8 text-white overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-400/20 rounded-full -ml-16 -mb-16 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                  className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Lock className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">Ubah Kata Sandi</h1>
                  <p className="text-green-50 text-sm mt-1">Perbarui kata sandi untuk keamanan akun</p>
                </div>
              </div>

              {/* Security Features */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex flex-wrap gap-3 pt-4 border-t border-white/20"
              >
                <div className="flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Enkripsi Aman</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>Perlindungan Data</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1.5">Tips Kata Sandi Kuat</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                    Minimal 8 karakter dengan kombinasi huruf, angka, dan simbol
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                    Hindari informasi pribadi yang mudah ditebak
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6">
            <ChangePasswordForm />
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Informasi Anda dilindungi dengan enkripsi end-to-end</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}