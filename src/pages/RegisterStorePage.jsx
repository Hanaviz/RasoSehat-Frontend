import React, { useState, useCallback, useMemo, memo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MapPin, CheckCircle, Upload, BookOpen, AlertTriangle, X } from 'lucide-react';

// =========================================================================
// OPTIMIZED REGISTER STORE PAGE - FIXED INPUT LAG
// =========================================================================

// ✅ MEMOIZED INPUT COMPONENT - Prevents re-creation on each render
const InputField = memo(({ 
  id, label, value, onChange, error, placeholder, type = 'text', helperText 
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-1">
      {label}
    </label>
    {helperText && (
      <p className="text-xs text-gray-500 mb-2">{helperText}</p>
    )}
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      placeholder={placeholder}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
));
InputField.displayName = 'InputField';

// ✅ MEMOIZED SELECT COMPONENT
const SelectField = memo(({ 
  id, label, value, onChange, error, options, placeholder 
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-2">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 appearance-none ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
));
SelectField.displayName = 'SelectField';

// ✅ MEMOIZED MULTI-SELECT BUTTONS
const MultiSelectButtons = memo(({ 
  options, selectedItems, onToggle, label, error 
}) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selectedItems.includes(option)
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {option} {selectedItems.includes(option) && <CheckCircle size={12} className="inline ml-1" />}
        </button>
      ))}
    </div>
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
));
MultiSelectButtons.displayName = 'MultiSelectButtons';

// ✅ MEMOIZED INTERACTIVE MAP COMPONENT
const InteractiveMapPicker = memo(({ 
  label, value, onChange, error, helperText 
}) => {
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([-7.0, 110.0]); // Default: Indonesia center
  const [markerPos, setMarkerPos] = useState(null);

  // Parse koordinat dari value
  React.useEffect(() => {
    if (value && typeof value === 'string') {
      const coords = value.split(',').map(c => parseFloat(c.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        setMarkerPos([coords[0], coords[1]]);
        setMapCenter([coords[0], coords[1]]);
      }
    }
  }, [value, showMap]);

  // Simple canvas-based map display
  const renderMapCanvas = () => {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-green-400 rounded-lg overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Peta Interaktif</p>
            <p className="text-xs text-gray-500">Klik di lokasi untuk menandai titik</p>
            <p className="text-xs text-gray-400 mt-4">Latitude: {markerPos ? markerPos[0].toFixed(4) : 'Belum dipilih'}</p>
            <p className="text-xs text-gray-400">Longitude: {markerPos ? markerPos[1].toFixed(4) : 'Belum dipilih'}</p>
          </div>
        </div>

        {/* Grid Background */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Marker / Click Handler */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Konversi pixel ke koordinat (simplified)
            const lat = mapCenter[0] + (0.5 - y / rect.height) * 2;
            const lng = mapCenter[1] + (x / rect.width - 0.5) * 2;
            
            setMarkerPos([lat, lng]);
            onChange({ target: { value: `${lat.toFixed(4)}, ${lng.toFixed(4)}` } });
          }}
          className="absolute inset-0 cursor-crosshair z-10 hover:bg-black/5 transition-colors"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Show Marker */}
          {markerPos && (
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                left: `${((markerPos[1] - (mapCenter[1] - 1)) / 2 * 100)}%`,
                top: `${((0.5 - (markerPos[0] - mapCenter[0]) / 2))}%`
              }}
            >
              <div className="relative">
                <MapPin size={32} className="text-red-500 drop-shadow-lg" />
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {markerPos[0].toFixed(4)}, {markerPos[1].toFixed(4)}
                </div>
              </div>
            </div>
          )}

          {/* Center Crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-1 h-1 bg-green-500 rounded-full border-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label}
      </label>
      {helperText && (
        <p className="text-xs text-gray-500 mb-2">{helperText}</p>
      )}

      {/* Current Value Display */}
      <div className={`w-full px-4 py-3 border-2 rounded-lg mb-3 transition-all ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Titik Lokasi:</span> {value || 'Belum dipilih'}
            </p>
            {markerPos && (
              <p className="text-xs text-gray-500 mt-1">
                ✅ Akurat hingga {markerPos[0].toFixed(6)}, {markerPos[1].toFixed(6)}
              </p>
            )}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange({ target: { value: '' } });
                setMarkerPos(null);
              }}
              className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
            >
              <X size={18} className="text-red-500" />
            </button>
          )}
        </div>
      </div>

      {/* Map Toggle Button */}
      <button
        type="button"
        onClick={() => setShowMap(!showMap)}
        className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 mb-3"
      >
        <MapPin size={20} />
        {showMap ? '✓ Sembunyikan Peta' : '🗺️ Buka Peta Interaktif'}
      </button>

      {/* Map Container */}
      {showMap && (
        <div className="mb-3 bg-white border-2 border-green-300 rounded-lg p-2 shadow-lg">
          <div className="mb-2 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-900 font-semibold">📍 Cara Menggunakan:</p>
            <ul className="text-xs text-blue-800 mt-2 space-y-1">
              <li>✓ Klik di mana saja pada peta untuk menandai titik</li>
              <li>✓ Koordinat akan otomatis terisi</li>
              <li>✓ Tekan tombol di atas untuk menyembunyikan peta</li>
            </ul>
          </div>
          {renderMapCanvas()}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2">
        💡 Format: Latitude, Longitude (Contoh: -7.7956, 110.3695)
      </p>
    </div>
  );
});
InteractiveMapPicker.displayName = 'InteractiveMapPicker';

// ✅ MEMOIZED PAGE LAYOUT
const PageLayout = memo(({ children, title, onBack, onNext, nextLabel = 'Next', isFinal = false, step, commitmentChecked }) => (
  <motion.div
    className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-white rounded-3xl shadow-2xl relative"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <header className="mb-8 border-b pb-4">
      <button onClick={onBack} className="text-gray-500 hover:text-green-600 transition-colors mb-4 flex items-center">
        <ChevronLeft size={24} /> Kembali
      </button>
      <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-600 mt-1">Langkah {step}/4</p>
    </header>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {children}
    </div>

    <footer className="mt-8 pt-6 border-t flex justify-end">
      {!isFinal ? (
        <button
          onClick={onNext}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all duration-300"
        >
          {nextLabel} &rarr;
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!commitmentChecked}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
        >
          Submit Pendaftaran
        </button>
      )}
    </footer>
  </motion.div>
));
PageLayout.displayName = 'PageLayout';

const STORE_CATEGORIES = [
  'Healthy Salad Bar', 'Smoothie & Juice', 'Warung Makan Sehat', 
  'Keto/Low-Carb Meals', 'Vegan & Vegetarian', 'Others'
];

const HEALTH_FOCUS_OPTIONS = [
  'Rendah Gula', 'Rendah Lemak Jenuh', 'Tinggi Protein', 
  'Rendah Kalori', 'Vegan/Vegetarian'
];

const FAT_OPTIONS = [
  'Minyak Zaitun/Canola',
  'Minyak Kelapa Murni',
  'Minyak Sayur Standar',
  'Santan (Wajib Kuantitas Terkontrol)'
];

const COOKING_METHODS = [
  'Panggang', 'Kukus', 'Rebus', 'Air Fryer', 
  'Tumis (Minim Minyak)', 'Goreng'
];

const BUSINESS_TYPES = [
  {
    value: 'Perorangan',
    title: 'Bisnis Perorangan',
    description: 'Pilih ini jika Anda menjalankan usaha atas nama pribadi. Cukup gunakan KTP untuk pendaftaran.'
  },
  {
    value: 'Korporasi',
    title: 'Perusahaan/Korporasi',
    description: 'Membutuhkan dokumen legal seperti NIB/SIUP/akta pendirian.'
  }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_PHONE_LENGTH = 8;

const RegisterStorePage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessType: 'Perorangan',
    storeName: '',
    shortDescription: '',
    storeCategory: '',
    ownerName: '',
    phonePrimary: '',
    phoneAdmin: '',
    addressFull: '',
    mapsLatLong: '',
    operatingHours: '',
    ktpUpload: null,
    salesChannels: '',
    socialMedia: '',
    healthFocus: [],
    dominantFat: '',
    dominantCookingMethod: [],
    commitmentChecked: false,
  });
  const [errors, setErrors] = useState({});

  // Optimized: useCallback untuk mencegah re-render
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.size > MAX_FILE_SIZE) {
      alert('Ukuran file maksimal 10MB.');
      return;
    }
    handleChange('ktpUpload', file);
  }, [handleChange]);

  // Optimized: Memoize validation rules
  const validationRules = useMemo(() => ({
    1: {
      storeName: (val) => !val.trim() ? 'Nama Toko wajib diisi.' : '',
      shortDescription: (val) => !val.trim() ? 'Deskripsi wajib diisi.' : '',
      storeCategory: (val) => !val ? 'Pilih kategori toko.' : '',
      businessType: (val) => !val ? 'Pilih jenis usaha.' : '',
    },
    2: {
      ownerName: (val) => !val.trim() ? 'Nama Penanggung Jawab wajib diisi.' : '',
      phonePrimary: (val) => !val.trim() || val.length < MIN_PHONE_LENGTH ? 'Nomor HP utama tidak valid.' : '',
      phoneAdmin: (val) => !val.trim() || val.length < MIN_PHONE_LENGTH ? 'Nomor HP notifikasi tidak valid.' : '',
      addressFull: (val) => !val.trim() ? 'Alamat lengkap wajib diisi.' : '',
      mapsLatLong: (val) => !val.trim() ? 'Titik Lokasi Maps wajib diisi.' : '',
      operatingHours: (val) => !val.trim() ? 'Jam Operasional wajib diisi.' : '',
    },
    3: {
      ktpUpload: (val) => !val ? 'Wajib unggah KTP/Dokumen identitas.' : '',
      salesChannels: (val) => !val.trim() ? 'Saluran pemesanan wajib diisi.' : '',
      healthFocus: (val) => val.length === 0 ? 'Pilih minimal satu fokus kesehatan utama.' : '',
      dominantFat: (val) => !val ? 'Pilih jenis lemak/minyak dominan.' : '',
      dominantCookingMethod: (val) => val.length === 0 ? 'Pilih minimal satu metode masak prioritas.' : '',
    }
  }), []);

  // Optimized: Single validation function
  const validateStep = useCallback((currentStep) => {
    const rules = validationRules[currentStep];
    const newErrors = {};

    Object.entries(rules).forEach(([field, validator]) => {
      const error = validator(formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setStep(currentStep + 1);
    }
  }, [formData, validationRules]);

  // Optimized: Memoize submit handler
  const handleFinalSubmit = useCallback(() => {
    if (!formData.commitmentChecked) {
      alert("Anda harus menyetujui Komitmen Kualitas untuk mendaftar.");
      return;
    }
    
    console.log("Data Pendaftaran Toko Final:", formData);
    alert("Pendaftaran Berhasil! Toko Anda akan ditinjau Admin (2x24 jam).");
    // navigate('/profile');
  }, [formData]);

  // Optimized: Toggle array items helper
  const toggleArrayItem = useCallback((field, item) => {
    const currentArray = formData[field];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    handleChange(field, newArray);
  }, [formData, handleChange]);

  const goBack = useCallback(() => {
    console.log('Navigate back to /my-store');
  }, []);

  // Step Components - TIDAK menggunakan useMemo
  const renderStep1 = () => (
    <PageLayout
      title="Mulai Berjualan di RasoSehat!"
      onBack={goBack}
      onNext={() => validateStep(1)}
      nextLabel="Next"
      step={step}
      commitmentChecked={formData.commitmentChecked}
    >
      <div className="lg:col-span-1 space-y-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">Apa Jenis Usaha Anda?</label>
        {BUSINESS_TYPES.map(({ value, title, description }) => (
          <div
            key={value}
            onClick={() => handleChange('businessType', value)}
            className={`card-hover p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.businessType === value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <input type="radio" name="businessType" value={value} checked={formData.businessType === value} readOnly className="float-right mt-1 w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        ))}
        {errors.businessType && <p className="text-xs text-red-600 mt-2">{errors.businessType}</p>}
      </div>

      <div className="lg:col-span-1 space-y-4">
        <InputField
          id="storeName"
          label="Nama Toko"
          helperText="Hindari penggunaan angka, tanda baca khusus, atau huruf selain alfabet bahasa Inggris."
          value={formData.storeName}
          onChange={(e) => handleChange('storeName', e.target.value)}
          error={errors.storeName}
          placeholder="Contoh: RasoSehat Corner"
        />
        <InputField
          id="shortDescription"
          label="Deskripsi Singkat"
          value={formData.shortDescription}
          onChange={(e) => handleChange('shortDescription', e.target.value)}
          error={errors.shortDescription}
          placeholder="Makanan sehat harian siap antar"
        />
        <SelectField
          id="storeCategory"
          label="Kategori Toko"
          value={formData.storeCategory}
          onChange={(e) => handleChange('storeCategory', e.target.value)}
          error={errors.storeCategory}
          options={STORE_CATEGORIES}
          placeholder="Pilih konsep toko"
        />
      </div>
    </PageLayout>
  );

  const renderStep2 = () => (
    <PageLayout
      title="Buat Toko Anda Sekarang Juga."
      onBack={() => setStep(1)}
      onNext={() => validateStep(2)}
      nextLabel="Next"
      step={step}
      commitmentChecked={formData.commitmentChecked}
    >
      <div className="lg:col-span-1 space-y-4">
        <InputField
          id="ownerName"
          label="Nama Pemilik / Penanggung Jawab"
          value={formData.ownerName}
          onChange={(e) => handleChange('ownerName', e.target.value)}
          error={errors.ownerName}
          placeholder="Nama lengkap"
        />
        <InputField
          id="phonePrimary"
          label="Nomor HP / WhatsApp Aktif (Pembeli)"
          helperText="Nomor utama yang bisa dihubungi oleh pembeli untuk pemesanan."
          type="tel"
          value={formData.phonePrimary}
          onChange={(e) => handleChange('phonePrimary', e.target.value)}
          error={errors.phonePrimary}
          placeholder="Contoh: 0812xxxxxxxx"
        />
        <InputField
          id="phoneAdmin"
          label="Nomor HP / WhatsApp Aktif (Notifikasi)"
          helperText="Nomor untuk keperluan administrasi dan notifikasi tim RasoSehat."
          type="tel"
          value={formData.phoneAdmin}
          onChange={(e) => handleChange('phoneAdmin', e.target.value)}
          error={errors.phoneAdmin}
          placeholder="Contoh: 0813xxxxxxxx"
        />
      </div>

      <div className="lg:col-span-1 space-y-4">
        <InputField
          id="addressFull"
          label="Alamat Lengkap Toko"
          helperText="Tuliskan alamat lengkap sesuai lokasi sebenarnya."
          value={formData.addressFull}
          onChange={(e) => handleChange('addressFull', e.target.value)}
          error={errors.addressFull}
          placeholder="Nama jalan, nomor, RT/RW, Kota"
        />
        <InputField
          id="operatingHours"
          label="Jam Operasional"
          helperText="Contoh: Senin-Jumat 09:00-20:00, Sabtu 10:00-18:00."
          value={formData.operatingHours}
          onChange={(e) => handleChange('operatingHours', e.target.value)}
          error={errors.operatingHours}
          placeholder="Jam buka/tutup"
        />
      </div>

      {/* Maps Section - Full Width */}
      <div className="lg:col-span-2">
        <InteractiveMapPicker
          label="Titik Lokasi Maps"
          helperText="Klik pada peta untuk memilih lokasi toko Anda"
          value={formData.mapsLatLong}
          onChange={(e) => handleChange('mapsLatLong', e.target.value)}
          error={errors.mapsLatLong}
        />
      </div>
    </PageLayout>
  );

  const renderStep3 = () => (
    <PageLayout
      title="Verifikasi Kredibilitas & Komitmen Kualitas"
      onBack={() => setStep(2)}
      onNext={() => validateStep(3)}
      nextLabel="Lanjut ke Komitmen"
      step={step}
      commitmentChecked={formData.commitmentChecked}
    >
      <div className="lg:col-span-1 space-y-4">
        <div className="p-4 rounded-xl border-2 border-green-500/50 bg-green-50">
          <label className="block text-sm font-bold text-gray-800 mb-3">Verifikasi Informasi Pribadi</label>
          <ul className="text-xs text-gray-700 list-disc ml-4 mb-3 space-y-1">
            <li>File harus berupa pindai berwarna dan berukuran kurang dari 10 MB (JPG, PNG, JPEG, atau PDF).</li>
            <li>Pastikan file yang diunggah tampak jelas dan mudah dibaca.</li>
          </ul>
          
          <input type="file" id="ktpUpload" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
          <button 
            onClick={() => document.getElementById('ktpUpload').click()}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              formData.ktpUpload ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Upload size={20} /> {formData.ktpUpload ? formData.ktpUpload.name : 'Unggah KTP / Dokumen Resmi'}
          </button>
          {errors.ktpUpload && <p className="text-xs text-red-600 mt-1">{errors.ktpUpload}</p>}
        </div>

        <InputField
          id="salesChannels"
          label="Saluran Pemesanan / Pengiriman"
          helperText="Pilih cara pemesanan yang Anda sediakan (WhatsApp, GoFood, ShopeeFood, dll.)."
          value={formData.salesChannels}
          onChange={(e) => handleChange('salesChannels', e.target.value)}
          error={errors.salesChannels}
          placeholder="Contoh: WhatsApp & GoFood"
        />
        
        <InputField
          id="socialMedia"
          label="Media Sosial / Website (Opsional)"
          value={formData.socialMedia}
          onChange={(e) => handleChange('socialMedia', e.target.value)}
          placeholder="Link Instagram/Facebook/Website"
        />
      </div>
      
      <div className="lg:col-span-1 space-y-4">
        <div className="p-4 rounded-xl border-2 border-yellow-500/50 bg-yellow-50">
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <BookOpen size={20} /> Komitmen Kualitas Awal
          </h3>
          <p className="text-xs text-gray-700 mb-3">Data ini membantu tim Admin RasoSehat memprioritaskan verifikasi menu Anda.</p>

          <MultiSelectButtons
            label="Fokus Kesehatan Utama (Min. 1)"
            options={HEALTH_FOCUS_OPTIONS}
            selectedItems={formData.healthFocus}
            onToggle={(item) => toggleArrayItem('healthFocus', item)}
            error={errors.healthFocus}
          />

          <div className="mt-3">
            <SelectField
              id="dominantFat"
              label="Jenis Lemak/Minyak Dominan"
              value={formData.dominantFat}
              onChange={(e) => handleChange('dominantFat', e.target.value)}
              error={errors.dominantFat}
              options={FAT_OPTIONS}
              placeholder="Pilih..."
            />
          </div>
          
          <div className="mt-3">
            <MultiSelectButtons
              label="Metode Masak Diprioritaskan (Min. 1)"
              options={COOKING_METHODS}
              selectedItems={formData.dominantCookingMethod}
              onToggle={(item) => toggleArrayItem('dominantCookingMethod', item)}
              error={errors.dominantCookingMethod}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );

  const renderStep4 = () => (
    <PageLayout
      title="Finalisasi & Persetujuan Komitmen"
      onBack={() => setStep(3)}
      onNext={handleFinalSubmit}
      step={step}
      isFinal={true}
      commitmentChecked={formData.commitmentChecked}
    >
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 rounded-xl border-4 border-green-500 bg-green-50">
          <h3 className="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
            <CheckCircle size={24} /> Tinjauan Komitmen Toko
          </h3>
          <p className="text-gray-700 mb-4">Pastikan data berikut sesuai dengan komitmen toko Anda:</p>
          
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li><strong>Fokus Sehat:</strong> {formData.healthFocus.join(', ') || 'Belum dipilih'}</li>
            <li><strong>Lemak/Minyak Utama:</strong> {formData.dominantFat || 'Belum dipilih'}</li>
            <li><strong>Metode Masak:</strong> {formData.dominantCookingMethod.join(', ') || 'Belum dipilih'}</li>
            <li><strong>Verifikasi KTP:</strong> {formData.ktpUpload ? 'Sudah diunggah' : 'Belum diunggah'}</li>
          </ul>
        </div>

        <div className="p-6 rounded-xl border-2 border-red-500 bg-red-50">
          <h3 className="text-xl font-bold text-red-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={24} /> Syarat & Ketentuan Verifikasi
          </h3>
          <p className="text-sm text-red-700 mb-4">Dengan menyetujui, Anda terikat pada ketentuan verifikasi RasoSehat:</p>
          <ul className="list-disc list-inside space-y-2 text-sm text-red-700">
            <li><strong>Verifikasi Menu:</strong> Setiap menu yang Anda unggah di Dashboard akan ditinjau Admin (berbasis literatur/dokumen) sebelum tayang.</li>
            <li><strong>Akuntabilitas:</strong> Anda wajib memberikan Daftar Bahan Baku Lengkap dan Metode Masak Rinci untuk setiap menu.</li>
            <li><strong>Penghapusan:</strong> Klaim yang terbukti tidak akurat atau melanggar standar diet dapat mengakibatkan penghapusan menu atau penonaktifan toko.</li>
          </ul>
        </div>
        
        <div className="flex items-start mt-6">
          <input 
            type="checkbox" 
            id="commitmentChecked" 
            checked={formData.commitmentChecked} 
            onChange={(e) => handleChange('commitmentChecked', e.target.checked)}
            className="mt-1 w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="commitmentChecked" className="ml-3 text-sm font-medium text-gray-900 cursor-pointer">
            Saya menyetujui <strong>Komitmen Kualitas</strong> dan siap menjalani proses verifikasi menu oleh Admin RasoSehat.
          </label>
        </div>
      </div>
    </PageLayout>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 pb-12">
      <AnimatePresence mode="wait">
        {step === 1 && <div key="step-1">{renderStep1()}</div>}
        {step === 2 && <div key="step-2">{renderStep2()}</div>}
        {step === 3 && <div key="step-3">{renderStep3()}</div>}
        {step === 4 && <div key="step-4">{renderStep4()}</div>}
      </AnimatePresence>
    </div>
  );
};

export default RegisterStorePage;