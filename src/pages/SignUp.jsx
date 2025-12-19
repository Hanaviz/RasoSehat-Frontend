import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import HeroSidebar from '../components/HeroSidebar';
import { useAuth } from '../context/AuthContext'; // <-- IMPORT BARU

export default function SignUpPage() { // <-- NAMA COMPONENT DIPERBAIKI (TADI MASIH SignInPage)
  const [formData, setFormData] = useState({
    nama: '',
    tanggalLahir: { day: '', month: '', year: '' },
    jenisKelamin: '',
    nomorHP: '', // Digunakan sebagai Email/Username
    kataSandi: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(''); // <-- Tambah state error
  
  const navigate = useNavigate();
  const { register } = useAuth(); // <-- Ambil fungsi register dari AuthContext

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setErrorMessage('');
  };

  const handleDateChange = (part, value) => {
    setFormData(prev => ({
      ...prev,
      tanggalLahir: {
        ...prev.tanggalLahir,
        [part]: value
      }
    }));
    setErrors(prev => ({ ...prev, tanggalLahir: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nama || !formData.nama.trim()) newErrors.nama = 'Nama wajib diisi';
    const { day, month, year } = formData.tanggalLahir;
    if (!day || !month || !year) newErrors.tanggalLahir = 'Tanggal lahir harus lengkap';
    if (!formData.jenisKelamin) newErrors.jenisKelamin = 'Pilih jenis kelamin';
    if (!formData.nomorHP || !formData.nomorHP.trim() || !formData.nomorHP.includes('@')) newErrors.nomorHP = 'Email wajib diisi dan format harus valid';
    if (!formData.kataSandi || formData.kataSandi.length < 6) newErrors.kataSandi = 'Kata sandi minimal 6 karakter';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => { // <-- JADIKAN ASYNC
    e.preventDefault(); // Mencegah form reload

    if (!validate()) {
        setErrorMessage('Mohon perbaiki isian yang salah.');
        return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    const registrationData = {
        name: formData.nama,
        email: formData.nomorHP, // Menggunakan nomorHP/email field untuk email registrasi
        password: formData.kataSandi,
        // Data lain (Tanggal Lahir, Gender) dapat ditambahkan ke tabel users/profile nanti
    };

    // Include birth date and gender if available
    const { day, month, year } = formData.tanggalLahir;
    if (day && month && year) {
      // Build YYYY-MM-DD
      const dd = String(day).padStart(2, '0');
      const mm = String(month).padStart(2, '0');
      registrationData.birth_date = `${year}-${mm}-${dd}`;
    }
    if (formData.jenisKelamin) registrationData.gender = formData.jenisKelamin;

    const result = await register(registrationData); // <-- PANGGIL FUNGSI REGISTER DARI CONTEXT

    setIsLoading(false);
    
    if (result.success) {
        setIsSuccess(true);
        // alert(result.message); // Opsional: Tampilkan pesan sukses dari backend
        
        setTimeout(() => {
            navigate('/signin'); // Arahkan ke halaman login
        }, 1100);
    } else {
        setErrorMessage(result.message); // Tampilkan error dari backend
        setIsSuccess(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  return (
    <motion.div className="min-h-screen-safe flex" initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.36 }}>
      <style>{`
        .fade-in-up { animation: fadeUp .5s cubic-bezier(.2,.9,.2,1) both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px);} to { opacity: 1; transform: translateY(0);} }
        .card-hover { transition: transform .28s cubic-bezier(.2,.9,.2,1), box-shadow .28s; }
        .card-hover:hover { transform: translateY(-6px) scale(1.007); box-shadow: 0 18px 40px rgba(2,6,23,0.12); }
        .input-focus { transition: box-shadow .18s, transform .18s; }
        .input-focus:focus { box-shadow: 0 6px 20px rgba(16,185,129,0.12); transform: translateY(-1px); }
        .btn-press:active { transform: translateY(1px) scale(.995); }
        .decorative-blob { filter: blur(34px); opacity: .12; pointer-events: none; }
        @media (max-width: 1023px) { .decorative-blob { display: none; } }
      `}</style>
      {/* Left Side - Hero Sidebar */}
      <HeroSidebar />

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50 relative">
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

          <form onSubmit={handleSubmit}>
            <motion.div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 card-hover relative z-20" whileHover={{ translateY: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800 fade-in-up">Daftar Sekarang</h2>
                <p className="text-gray-600 fade-in-up">
                  Sudah punya akun RasoSehat?{' '}
                  <Link to="/signin" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                    Masuk
                  </Link>
                </p>
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
                {/* Nama */}
                <div>
                  <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama
                  </label>
                  <input
                    id="nama"
                    type="text"
                    value={formData.nama}
                    onChange={(e) => handleChange('nama', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                  />
                  {errors.nama && (
                    <p className="text-xs text-red-600 mt-2">{errors.nama}</p>
                  )}
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="number"
                      placeholder="DD"
                      value={formData.tanggalLahir.day}
                      onChange={(e) => handleDateChange('day', e.target.value)}
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-center"
                      min="1"
                      max="31"
                    />
                    <input
                      type="number"
                      placeholder="MM"
                      value={formData.tanggalLahir.month}
                      onChange={(e) => handleDateChange('month', e.target.value)}
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-center"
                      min="1"
                      max="12"
                    />
                    <input
                      type="number"
                      placeholder="YYYY"
                      value={formData.tanggalLahir.year}
                      onChange={(e) => handleDateChange('year', e.target.value)}
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-center"
                      min="1900"
                      max="2025" // Updated max year
                    />
                  </div>
                  {errors.tanggalLahir && (
                    <p className="text-xs text-red-600 mt-2">{errors.tanggalLahir}</p>
                  )}
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin
                  </label>
                  <div className="relative">
                    <select
                      id="jenisKelamin"
                      value={formData.jenisKelamin}
                      onChange={(e) => handleChange('jenisKelamin', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                  </div>
                  {errors.jenisKelamin && (
                    <p className="text-xs text-red-600 mt-2">{errors.jenisKelamin}</p>
                  )}
                </div>

                {/* Nomor HP / Email */}
                <div>
                  <label htmlFor="nomorHP" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="nomorHP"
                    type="email"
                    value={formData.nomorHP}
                    onChange={(e) => handleChange('nomorHP', e.target.value)}
                    placeholder="Masukkan email aktif"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none input-no-autofill"
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    autoComplete="email"
                  />
                  {errors.nomorHP && (
                    <p className="text-xs text-red-600 mt-2">{errors.nomorHP}</p>
                  )}
                </div>

                {/* Kata Sandi */}
                <div>
                  <label htmlFor="kataSandi" className="block text-sm font-medium text-gray-700 mb-2">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      id="kataSandi"
                      type={showPassword ? "text" : "password"}
                      value={formData.kataSandi}
                      onChange={(e) => handleChange('kataSandi', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none pr-12 input-no-autofill"
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.kataSandi && (
                    <p className="text-xs text-red-600 mt-2">{errors.kataSandi}</p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit" // <-- Ubah ke type submit
                  disabled={isLoading || isSuccess}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl btn-press"
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
                      <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Daftar</motion.span>
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
                  <Link to="/signin" className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                    Udah punya akun?
                  </Link>
                </div>
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