import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Upload, Utensils, Zap, ShoppingBag, Leaf, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { unwrap } from '../utils/api';
import HEALTH_CLAIMS from '../utils/healthClaims';
import { useAuth } from '../context/AuthContext'; 

// --- Reusable UI Components ---

const FormCard = ({ title, children, icon: Icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-5">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3 border-b pb-2">
            <Icon className="w-6 h-6 text-green-600" /> {title}
        </h3>
        {children}
    </div>
);

const InputGroup = ({ label, helper, type = 'text', value, onChange, placeholder, required = false, isFull = true, min = 0 }) => (
    <div className={isFull ? 'w-full' : 'flex-1'}>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {helper && <p className="text-xs text-gray-500 mb-2">{helper}</p>}
        {type === 'textarea' ? (
            <textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
            />
        )}
    </div>
);

const MultiSelectTag = ({ label, options, selected, onToggle, helper }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        {helper && <p className="text-xs text-gray-500 mb-2">{helper}</p>}
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onToggle(option)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors font-medium ${
                        selected.includes(option)
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

// --- Data Konfigurasi ---
const DIET_CLAIMS = HEALTH_CLAIMS;
const COOKING_METHODS = ['Panggang', 'Kukus', 'Rebus', 'Tumis (Minim Minyak)', 'Air Fryer', 'Goreng'];


// =================================================================
// KOMPONEN UTAMA: ADD MENU PAGE
// =================================================================

export default function AddMenuPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nama_menu: '',
        deskripsi: '',
        bahan_baku: '',
        metode_masak: '',
        diet_claims: [],
        kalori: '',
        protein: '',
        gula: '',
        lemak: '',
        serat: '',
        lemak_jenuh: '',
        harga: '',
        foto: null,
        kategori_id: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [categoriesRes, storeRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/my-store')
                ]);
                const cats = unwrap(categoriesRes) || [];
                const storePayload = unwrap(storeRes) || {};
                setCategories(cats);
                setRestaurant(storePayload.restaurant || null);
            } catch (err) {
                console.error('Failed to fetch data', err);
                setError('Gagal memuat data. Silakan coba lagi.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);
    
    const handleToggleArray = useCallback((field, item) => {
        setFormData(prev => {
            const currentArray = prev[field];
            const newArray = currentArray.includes(item)
                ? currentArray.filter(i => i !== item)
                : [...currentArray, item];
            return { ...prev, [field]: newArray };
        });
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleChange('foto', file);
        }
    };

    const handleNext = () => {
        // Logika validasi minimal antar sesi
        if (step === 1) {
            if (!formData.nama_menu || !formData.harga || !formData.kategori_id || !formData.foto) {
                alert("Mohon lengkapi Nama Menu, Harga, Kategori, dan Foto Menu.");
                return;
            }
        } else if (step === 2) {
             if (!formData.kalori || !formData.protein || !formData.bahan_baku || !formData.lemak) {
                alert("Mohon lengkapi estimasi Kalori, Protein, Lemak, dan Daftar Bahan Baku.");
                return;
            }
        }
        setStep(step + 1);
    };

    const handleSubmit = async () => {
        // 1. Final Validation
        if (formData.diet_claims.length === 0 || !formData.metode_masak) {
            alert("Mohon tentukan minimal satu Klaim Diet dan Metode Memasak.");
            return;
        }
        if (!restaurant) {
            alert("Restoran tidak ditemukan. Pastikan Anda memiliki toko terdaftar.");
            return;
        }

        // 2. Prepare FormData (ensure all keys match DB columns)
        const fd = new FormData();
        // FormData stores values as strings or Blobs; convert numbers to strings
        fd.append('restoran_id', String(restaurant.id));
        fd.append('kategori_id', String(formData.kategori_id));
        fd.append('nama_menu', String(formData.nama_menu || ''));
        fd.append('deskripsi', String(formData.deskripsi || ''));
        fd.append('bahan_baku', String(formData.bahan_baku || ''));
        fd.append('metode_masak', String(formData.metode_masak || ''));
        fd.append('diet_claims', JSON.stringify(formData.diet_claims || []));
        fd.append('kalori', String(formData.kalori || '0'));
        fd.append('protein', String(formData.protein || '0'));
        fd.append('gula', String(formData.gula || '0'));
        fd.append('lemak', String(formData.lemak || '0'));
        fd.append('serat', String(formData.serat || '0'));
        fd.append('lemak_jenuh', String(formData.lemak_jenuh || '0'));
        fd.append('harga', String(formData.harga || '0'));
        if (formData.foto) {
            // append file object under key 'foto'
            fd.append('foto', formData.foto, formData.foto.name);
        }

        // Debug: preview FormData keys (can't directly console.log fd contents in all envs)
        try {
            const preview = {};
            for (const pair of fd.entries()) {
                // for files, show name only
                if (pair[1] instanceof File) preview[pair[0]] = pair[1].name;
                else preview[pair[0]] = pair[1];
            }
            console.log('[DEBUG AddMenuPage] FormData preview:', preview);
        } catch (e) {
            console.log('[DEBUG AddMenuPage] Could not preview FormData', e);
        }

        try {
            const res = await api.post('/menus', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const payload = unwrap(res) || {};
            const success = res?.data?.success ?? true;
            if (success) {
                alert("Menu berhasil diajukan! Menunggu Verifikasi Admin.");
                navigate('/my-store');
            } else {
                alert("Gagal mengajukan menu. Silakan coba lagi.");
            }
        } catch (err) {
            console.error('Failed to submit menu', err);
            alert(err.response?.data?.message || "Terjadi kesalahan saat mengajukan menu.");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
                    <p className="text-gray-700 font-medium">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-red-600" />
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
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-12 md:pt-16 pb-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                className="max-w-4xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <header className="mb-8 flex items-center justify-between">
                    <button onClick={() => navigate('/my-store')} className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2 font-medium">
                        <ChevronLeft size={24} /> Kembali ke Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Daftar Menu Baru</h1>
                </header>

                <div className="bg-white p-6 rounded-2xl shadow-xl border-t-8 border-green-500">
                    
                    {/* Progress Bar (UI/UX Improvement) */}
                    <div className="mb-8">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-green-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <p className="text-sm text-gray-600 mt-2 text-center">Langkah {step} dari 3: {step === 1 ? 'Detail Dasar' : step === 2 ? 'Nutrisi & Bahan' : 'Klaim Kesehatan'}</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* -------------------- STEP 1: DETAIL DASAR -------------------- */}
                        {step === 1 && (
                            <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                
                                {/* Kiri: Data Produk */}
                                <motion.div variants={itemVariants} className="space-y-5">
                                    <FormCard title="Informasi Dasar Menu" icon={Utensils}>
                                        <InputGroup label="Nama Menu" value={formData.nama_menu} onChange={(e) => handleChange('nama_menu', e.target.value)} placeholder="Contoh: Nasi Goreng Sehat" required />
                                        <InputGroup label="Deskripsi" type="textarea" value={formData.deskripsi} onChange={(e) => handleChange('deskripsi', e.target.value)} placeholder="Jelaskan secara singkat manfaat dan isinya..." />
                                        <div className="flex gap-4">
                                            <InputGroup label="Harga Jual (Rp)" type="number" value={formData.harga} onChange={(e) => handleChange('harga', e.target.value)} placeholder="25000" required isFull={false} min={0} />
                                        </div>
                                    </FormCard>
                                </motion.div>

                                {/* Kanan: Foto & Kategori */}
                                <motion.div variants={itemVariants} className="space-y-5">
                                    <FormCard title="Foto Produk" icon={Upload}>
                                        <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                                            {formData.foto ? (
                                                <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                                                    <img src={URL.createObjectURL(formData.foto)} alt="Preview" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => handleChange('foto', null)} className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1'><CheckCircle className='w-4 h-4'/></button>
                                                </div>
                                            ) : (
                                                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                            )}
                                            <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} className="hidden" required />
                                            <label htmlFor="file-upload" className="cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md">
                                                {formData.foto ? `Ubah Foto (${formData.foto.name})` : 'Pilih Foto Produk (Wajib)'}
                                            </label>
                                        </div>
                                    </FormCard>

                                    <FormCard title="Pengkategorian Menu" icon={ShoppingBag}>
                                        <select value={formData.kategori_id} onChange={(e) => handleChange('kategori_id', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm appearance-none" required>
                                            <option value="">Pilih Kategori Utama...</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>)}
                                        </select>
                                    </FormCard>
                                </motion.div>
                            </motion.div>
                        )}
                        
                        {/* -------------------- STEP 2: NUTRISI & BAHAN -------------------- */}
                        {step === 2 && (
                            <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                
                                {/* Kiri: Data Nutrisi Kuantitatif */}
                                <motion.div variants={itemVariants} className="space-y-5">
                                    <FormCard title="Nilai Gizi Makro per Porsi" icon={Zap}>
                                        <p className="text-sm text-gray-600 mb-3">Masukkan data per **{formData.porsi || 'porsi standar'}** (Wajib untuk verifikasi).</p>
                                        <InputGroup label="Kalori Total (Kkal)" type="number" value={formData.kalori} onChange={(e) => handleChange('kalori', e.target.value)} placeholder="450" required />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="Protein (Gram)" type="number" value={formData.protein} onChange={(e) => handleChange('protein', e.target.value)} placeholder="25" required isFull={false} />
                                            <InputGroup label="Lemak Total (Gram)" type="number" value={formData.lemak} onChange={(e) => handleChange('lemak', e.target.value)} placeholder="10" required isFull={false} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="Gula (Gram)" type="number" value={formData.gula} onChange={(e) => handleChange('gula', e.target.value)} placeholder="5" required isFull={false} min={0} />
                                            <InputGroup label="Lemak Jenuh (Gram)" type="number" value={formData.lemak_jenuh} onChange={(e) => handleChange('lemak_jenuh', e.target.value)} placeholder="2" isFull={false} min={0} />
                                        </div>
                                        <InputGroup label="Serat (Fiber) (Gram)" type="number" value={formData.serat} onChange={(e) => handleChange('serat', e.target.value)} placeholder="8" min={0} />
                                    </FormCard>
                                </motion.div>

                                {/* Kanan: Bahan Baku & Proses Memasak */}
                                <motion.div variants={itemVariants} className="space-y-5">
                                    <FormCard title="Detail Bahan & Proses (Wajib Verifikasi)" icon={Leaf}>
                                        <InputGroup 
                                            label="Daftar Bahan Baku Mentah" 
                                            helper="Pisahkan dengan koma. Wajib sebutkan jenis minyak/pemanis."
                                            type="textarea" 
                                            value={formData.bahan_baku} 
                                            onChange={(e) => handleChange('bahan_baku', e.target.value)} 
                                            placeholder="Contoh: Dada ayam, Quinoa, Baby Spinach, Minyak Zaitun, Stevia..." 
                                            required 
                                        />
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Metode Memasak Utama</label>
                                        <select value={formData.metode_masak} onChange={(e) => handleChange('metode_masak', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm appearance-none" required>
                                            <option value="">Pilih Metode...</option>
                                            {COOKING_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                                        </select>
                                        <p className="text-xs text-gray-500 pt-1">Metode ini digunakan Admin untuk menentukan klaim rendah lemak/kolesterol.</p>
                                    </FormCard>
                                </motion.div>
                            </motion.div>
                        )}
                        
                        {/* -------------------- STEP 3: KLAIM VERIFIKASI -------------------- */}
                        {step === 3 && (
                            <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                                
                                <motion.div variants={itemVariants} className="space-y-5">
                                    <FormCard title="Klaim Kesehatan & Alergen" icon={CheckCircle}>
                                        
                                        <MultiSelectTag
                                            label="Klaim Diet Spesifik (Wajib Pilih Minimal Satu)"
                                            helper="Pilih kategori yang Anda yakini sesuai dengan data nutrisi yang dimasukkan."
                                            options={DIET_CLAIMS}
                                            selected={formData.diet_claims}
                                            onToggle={(item) => handleToggleArray('diet_claims', item)}
                                        />
                                        
                                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-300 text-sm text-yellow-800 font-medium mt-5">
                                            ⚠️ Menu ini akan ditinjau Admin. Klaim diet harus sesuai dengan data nutrisi dan bahan baku mentah yang Anda masukkan.
                                        </div>
                                    </FormCard>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* -------------------- FOOTER & NAVIGASI -------------------- */}
                    <footer className="mt-8 pt-6 border-t flex justify-between">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-8 rounded-xl transition-colors"
                            >
                                <ChevronLeft size={20} className="inline mr-2" /> Kembali
                            </button>
                        )}
                        
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className={`font-semibold py-3 px-8 rounded-xl transition-all shadow-lg ${
                                    step === 1 ? 'ml-auto' : '' // Posisikan ke kanan jika di step 1
                                } bg-green-600 hover:bg-green-700 text-white`}
                            >
                                Lanjut &rarr;
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="ml-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg"
                            >
                                Ajukan Menu untuk Verifikasi
                            </button>
                        )}
                    </footer>

                </div>
            </motion.div>
        </div>
    );
}

// Tambahkan komponen ini ke App.jsx:
// import AddMenuPage from "./pages/AddMenuPage";
// <Route path="/add-menu" element={<AddMenuPage />} />