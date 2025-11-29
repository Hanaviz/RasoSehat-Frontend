import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import HeroSidebar from '../components/HeroSidebar';
import { useAuth } from '../context/AuthContext';

export default function StoreSignUp() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [allowed, setAllowed] = useState(!!token);

  useEffect(() => {
    // Basic guard: only allow access when a token query param exists.
    // Note: real one-time validation should be implemented server-side.
    setAllowed(!!token);
  }, [token]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setErrorMessage('');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email tidak valid';
    if (!form.password || form.password.length < 6) e.password = 'Password minimal 6 karakter';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return setErrorMessage('Periksa isian sebelum melanjutkan');

    setIsLoading(true);
    if (!allowed) {
      setErrorMessage('Akses tidak valid. Gunakan tautan pendaftaran yang dikirim melalui email.');
      setIsLoading(false);
      return;
    }

    try {
      const payload = { name: form.name, email: form.email, password: form.password, phone: form.phone, role: 'penjual', signup_token: token };
      const result = await register(payload);
      setIsLoading(false);
      if (result.success) {
        setIsSuccess(true);
        // After sign up, send user to register store page to complete store info
        setTimeout(() => navigate('/register-store'), 900);
      } else {
        setErrorMessage(result.message || 'Pendaftaran gagal');
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
                <h2 className="text-3xl font-bold text-gray-800">Daftar sebagai Penjual</h2>
                <p className="text-gray-600">Buat akun penjual untuk mengelola toko dan menu Anda.</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pemilik</label>
                  <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" />
                  {errors.name && <p className="text-xs text-red-600 mt-2">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="pemilik@tokoku.id" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" />
                  {errors.email && <p className="text-xs text-red-600 mt-2">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => handleChange('password', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                  {errors.password && <p className="text-xs text-red-600 mt-2">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon (opsional)</label>
                  <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="08xx..." className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>

                <button type="submit" disabled={isLoading || isSuccess} className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 disabled:opacity-50">{isLoading ? 'Memproses...' : isSuccess ? 'Berhasil' : 'Daftar'}</button>

                <div className="text-center">
                  <Link to="/store-signin" className="text-green-600 hover:text-green-700 font-semibold">Sudah memiliki akun penjual? Masuk</Link>
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
