import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Upload, Utensils, Zap, ShoppingBag, Leaf, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

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
const CATEGORIES = ['Salad', 'Smoothie', 'Masakan Padang Sehat', 'Keto', 'Vegan', 'Camilan Sehat'];
const DIET_CLAIMS = ['Rendah Kalori', 'Rendah Gula', 'Tinggi Protein', 'Rendah Lemak Jenuh', 'Vegan', 'Vegetarian', 'Gluten-Free'];
const COOKING_METHODS = ['Panggang', 'Kukus', 'Rebus', 'Tumis (Minim Minyak)', 'Air Fryer', 'Goreng'];
const ALLERGENS = ['Kacang', 'Gluten', 'Susu', 'Telur', 'Kerang', 'Seafood'];


// =================================================================
// KOMPONEN UTAMA: ADD MENU PAGE
// =================================================================

export default function AddMenuPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nama: '',
        deskripsi: '',
        harga: '',
        porsi: '',
        kategori: '',
        foto: null,
        
        // Nutrisi & Verifikasi
        kalori: '',
        protein: '',
        gula: '',
        lemak: '',
        bahanBaku: '',
        metodeMasak: '',
        dietClaims: [],
        allergens: [],
        // Tambahan yang direkomendasikan
        lemakJenuh: '', 
        serat: '', 
    });

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
            if (!formData.nama || !formData.harga || !formData.kategori || !formData.foto) {
                alert("Mohon lengkapi Nama, Harga, Kategori, dan Foto Menu.");
                return;
            }
        } else if (step === 2) {
             if (!formData.kalori || !formData.protein || !formData.bahanBaku || !formData.lemak) {
                alert("Mohon lengkapi estimasi Kalori, Protein, Lemak, dan Daftar Bahan Baku.");
                return;
            }
        }
        setStep(step + 1);
    };

    const handleSubmit = () => {
        // 1. Final Validation
        if (formData.dietClaims.length === 0 || !formData.metodeMasak) {
            alert("Mohon tentukan minimal satu Klaim Diet dan Metode Memasak.");
            return;
        }

        // 2. Submission Logic (Simulasi kirim ke backend)
        console.log("Submitting Menu Data:", formData);
        
        // Di sini panggil API ke Laravel Controller (RestoranController atau MenuController)
        
        alert("Menu berhasil diajukan! Menunggu Verifikasi Admin.");
        navigate('/my-store'); 
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
                                        <InputGroup label="Nama Menu" value={formData.nama} onChange={(e) => handleChange('nama', e.target.value)} placeholder="Contoh: Nasi Goreng Sehat" required />
                                        <InputGroup label="Deskripsi" type="textarea" value={formData.deskripsi} onChange={(e) => handleChange('deskripsi', e.target.value)} placeholder="Jelaskan secara singkat manfaat dan isinya..." required />
                                        <div className="flex gap-4">
                                            <InputGroup label="Harga Jual (Rp)" type="number" value={formData.harga} onChange={(e) => handleChange('harga', e.target.value)} placeholder="25000" required isFull={false} min={1000} />
                                            <InputGroup label="Porsi Standar" value={formData.porsi} onChange={(e) => handleChange('porsi', e.target.value)} placeholder="300 gram / 1 mangkok" required isFull={false} />
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
                                        <select value={formData.kategori} onChange={(e) => handleChange('kategori', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm appearance-none" required>
                                            <option value="">Pilih Kategori Utama...</option>
                                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                                            <InputGroup label="Gula (Gram)" type="number" value={formData.gula} onChange={(e) => handleChange('gula', e.target.value)} placeholder="5" required isFull={false} />
                                            <InputGroup label="Lemak Jenuh (Gram)" type="number" value={formData.lemakJenuh} onChange={(e) => handleChange('lemakJenuh', e.target.value)} placeholder="2" isFull={false} />
                                        </div>
                                        <InputGroup label="Serat (Fiber) (Gram)" type="number" value={formData.serat} onChange={(e) => handleChange('serat', e.target.value)} placeholder="8" />
                                    </FormCard>
                                </motion.div>

                                {/* Kanan: Bahan Baku & Proses Memasak */}
                                <motion.div variants={itemVariants} className="space-y-5">
                                    <FormCard title="Detail Bahan & Proses (Wajib Verifikasi)" icon={Leaf}>
                                        <InputGroup 
                                            label="Daftar Bahan Baku Mentah" 
                                            helper="Pisahkan dengan koma. Wajib sebutkan jenis minyak/pemanis."
                                            type="textarea" 
                                            value={formData.bahanBaku} 
                                            onChange={(e) => handleChange('bahanBaku', e.target.value)} 
                                            placeholder="Contoh: Dada ayam, Quinoa, Baby Spinach, Minyak Zaitun, Stevia..." 
                                            required 
                                        />
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Metode Memasak Utama</label>
                                        <select value={formData.metodeMasak} onChange={(e) => handleChange('metodeMasak', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm appearance-none" required>
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
                                            selected={formData.dietClaims}
                                            onToggle={(item) => handleToggleArray('dietClaims', item)}
                                        />
                                        
                                        <MultiSelectTag
                                            label="Peringatan Alergen (Opsional)"
                                            helper="Pilih alergen yang mungkin terkandung dalam menu ini."
                                            options={ALLERGENS}
                                            selected={formData.allergens}
                                            onToggle={(item) => handleToggleArray('allergens', item)}
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