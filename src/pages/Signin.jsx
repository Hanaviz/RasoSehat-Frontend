import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import HeroSidebar from '../components/HeroSidebar';
import { useAuth } from '../context/AuthContext'; // <-- IMPORT BARU

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // <-- Tambah state error
  
  const navigate = useNavigate();
  const { login } = useAuth(); // <-- Ambil fungsi login dari AuthContext

  const handleSubmit = async (e) => { // <-- JADIKAN ASYNC
    e.preventDefault(); // Mencegah reload form
    
    setErrorMessage(''); // Reset error message
    if (!email || !password) {
      setErrorMessage('Mohon isi email dan password');
      return;
    }
    
    setIsLoading(true);
    
    try {
        const credentials = { email, password };
        const result = await login(credentials); // <-- PANGGIL FUNGSI LOGIN DARI CONTEXT

        if (result.success) {
            setIsSuccess(true);
            
            // Hapus logika localStorage & setTimeout mock
            setTimeout(() => {
                navigate('/'); // Arahkan ke beranda setelah berhasil
            }, 700);

        } else {
            // Tampilkan pesan error dari backend
            setErrorMessage(result.message || 'Login gagal. Periksa koneksi.');
            setIsLoading(false);
            setIsSuccess(false);
        }

    } catch (error) {
        // Ini menangani error jika server Express tidak terjangkau
        setErrorMessage('Gagal terhubung ke server. Coba lagi.');
        setIsLoading(false);
        setIsSuccess(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  return (
    <motion.div
      className="min-h-screen flex"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.36 }}
    >
      {/* Inline styles for small, local animations to keep component self-contained */}
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px);} to { opacity: 1; transform: translateY(0);} }
        .fade-in-up { animation: fadeUp .5s cubic-bezier(.2,.9,.2,1) both; }
        .delay-1 { animation-delay: .06s; }
        .delay-2 { animation-delay: .14s; }
        .delay-3 { animation-delay: .22s; }
        .delay-4 { animation-delay: .30s; }
        .card-hover { transition: transform .28s cubic-bezier(.2,.9,.2,1), box-shadow .28s; will-change: transform; }
        .card-hover:hover { transform: translateY(-6px) scale(1.007); box-shadow: 0 18px 40px rgba(2,6,23,0.12); }
        .input-focus { transition: box-shadow .18s, transform .18s; }
        .input-focus:focus { box-shadow: 0 6px 20px rgba(16,185,129,0.12); transform: translateY(-1px); }
        .btn-press:active { transform: translateY(1px) scale(.995); }
        .decorative-blob { filter: blur(34px); opacity: .12; pointer-events: none; }
        @media (max-width: 1023px) { .decorative-blob { display: none; } }
      `}</style>
      {/* Left Side - Hero Sidebar */}
      <HeroSidebar />

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50 relative">
        {/* decorative blurred blob behind the form (desktop) */}
        <div className="absolute -left-12 -top-12 w-44 h-44 rounded-full bg-gradient-to-tr from-green-300 to-green-500 decorative-blob" style={{mixBlendMode: 'screen'}} />
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M12 16C13.1 16 14 16.9 14 18C14 19.1 13.1 20 12 20C10.9 20 10 19.1 10 18C10 16.9 10.9 16 12 16M18 8C19.1 8 20 8.9 20 10C20 11.1 19.1 12 18 12C16.9 12 16 11.1 16 10C16 8.9 16.9 8 18 8M6 8C7.1 8 8 8.9 8 10C8 11.1 7.1 12 6 12C4.9 12 4 11.1 4 10C4 8.9 4.9 8 6 8Z" fill="white"/>
                <circle cx="12" cy="10" r="6" stroke="white" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">RasoSehat</h2>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <motion.div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 card-hover relative z-20"
              whileHover={{ translateY: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800 fade-in-up delay-1">Selamat Datang</h2>
                <p className="text-gray-600 fade-in-up delay-2">Temukan makanan sehat di sekitar anda</p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                  {errorMessage && (
                      <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative overflow-hidden"
                      >
                          <p className="text-sm font-semibold">{errorMessage}</p>
                      </motion.div>
                  )}
              </AnimatePresence>

              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh: sehat@gmail.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none input-focus fade-in-up delay-2"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukan password anda"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none pr-12 input-focus fade-in-up delay-3"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit" // <-- Ubah ke type submit
                  disabled={isLoading || isSuccess}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl btn-press fade-in-up delay-4"
                  whileTap={{ scale: 0.995 }}
                >
                  <AnimatePresence mode="wait">
                    {isLoading && (
                      <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </motion.span>
                    )}

                    {!isLoading && !isSuccess && (
                      <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Submit</motion.span>
                    )}

                    {isSuccess && (
                      <motion.span key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                          <path d="M6 10l2 2 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Berhasil
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <div className="text-center">
                  <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                    Lupa Password?
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 text-center">
                <p className="text-gray-600 text-sm">
                  Belum punya akun?{' '}
                  <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                    Daftar sekarang
                  </Link>
                </p>
              </div>
            </motion.div>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
              © 2025 RasoSehat. Semua hak dilindungi
            </p>
        </div>
      </div>
    </motion.div>
  );
}