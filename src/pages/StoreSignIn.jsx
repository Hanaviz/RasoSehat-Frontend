import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import HeroSidebar from '../components/HeroSidebar';
import { useAuth } from '../context/AuthContext';

export default function StoreSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Mohon isi email dan password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email, password });
      setIsLoading(false);
      if (result.success) {
        setIsSuccess(true);
        // If login succeeds, redirect to seller dashboard or home
        setTimeout(() => navigate('/my-store'), 600);
      } else {
        setErrorMessage(result.message || 'Login gagal. Periksa kredensial.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Gagal terhubung ke server. Coba lagi.');
    }
  };

  const pageVariants = { initial: { opacity: 0, y: 12 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -10 } };

  return (
    <motion.div className="min-h-screen flex" initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.36 }}>
      <HeroSidebar />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50 relative">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <motion.div className="bg-white rounded-2xl shadow-xl p-8 space-y-6" whileHover={{ translateY: -4 }}>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">Masuk sebagai Penjual</h2>
                <p className="text-gray-600">Akses dashboard toko Anda untuk mengelola menu dan pesanan.</p>
              </div>

              <AnimatePresence>
                {errorMessage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                    <p className="text-sm font-semibold">{errorMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pemilik@tokoku.id" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukan password" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading || isSuccess} className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 disabled:opacity-50">
                  {isLoading ? 'Memproses...' : isSuccess ? 'Berhasil' : 'Masuk'}
                </button>

                <div className="text-center">
                  <Link to="/store-signup" className="text-green-600 hover:text-green-700 font-semibold">Daftar sebagai penjual</Link>
                </div>
              </div>
            </motion.div>
          </form>
          <p className="text-center text-xs text-gray-500 mt-6">© 2025 RasoSehat</p>
        </div>
      </div>
    </motion.div>
  );
}
