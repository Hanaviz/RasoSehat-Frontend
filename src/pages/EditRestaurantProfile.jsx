import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { unwrap, makeImageUrl } from '../utils/api';
import { motion } from 'framer-motion';
import { MapPin, Phone, Globe, Edit3, Save, Loader, ArrowLeft, Clock, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EditRestaurantProfile() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({
    nama_restoran: '',
    alamat: '',
    no_telepon: '',
    operating_hours: '',
    social_media: '',
    deskripsi: '',
    maps_link: '',
    foto: null,
  });
  const [preview, setPreview] = useState(null);
  const [debugImageInfo, setDebugImageInfo] = useState(false);
  const [imageDebugInfo, setImageDebugInfo] = useState(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, ttl = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), ttl);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/my-store');
        const payload = unwrap(res) || res?.data || {};
        const data = payload.restaurant || payload || res?.data?.restaurant || null;
        if (data) {
          setRestaurant(data);
          setForm(prev => ({
            ...prev,
            nama_restoran: data.nama_restoran || data.name || '',
            alamat: data.alamat || data.address || '',
              no_telepon: data.no_telepon || data.phone || '',
            operating_hours: data.operating_hours || data.operatingHours || '',
            social_media: data.social_media || data.socialMedia || '',
              deskripsi: data.deskripsi || data.description || '',
              maps_link: data.maps_link || data.mapsLink || data.maps_latlong || '',
          }));
          // preview existing foto
          if (data.foto) setPreview(makeImageUrl(data.foto));
        } else {
          setError('Data toko tidak ditemukan.');
        }
      } catch (e) {
        console.error('Gagal mengambil data toko', e);
        setError('Gagal mengambil data toko.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Resize + center-crop image to square on the client before upload.
  // Produces a File object (JPEG) suitable for thumbnail/public display.
  const resizeAndCropToSquare = (file, size = 1200, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      // Prefer createImageBitmap when available for more reliable decoding
      (async () => {
        try {
          let bitmap;
          if (typeof createImageBitmap === 'function') {
            bitmap = await createImageBitmap(file);
          } else {
            // Fallback to Image + FileReader
            await new Promise((res, rej) => {
              const reader = new FileReader();
              reader.onerror = () => rej(new Error('Failed to read file'));
              reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                  try {
                    // draw into an offscreen canvas to obtain a bitmap-like image
                    const off = document.createElement('canvas');
                    off.width = img.naturalWidth;
                    off.height = img.naturalHeight;
                    const octx = off.getContext('2d');
                    octx.drawImage(img, 0, 0);
                    off.toBlob((b) => {
                      if (!b) return rej(new Error('Failed to create blob'));
                      bitmap = b; // treat blob as fallback
                      res();
                    });
                  } catch (err) { rej(err); }
                };
                img.onerror = (e) => rej(new Error('Failed to load image'));
                img.src = reader.result;
              };
              reader.readAsDataURL(file);
            });
          }

          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas 2D context not available');
          ctx.clearRect(0, 0, size, size);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // If we have an ImageBitmap, draw from it. If we have a Blob fallback, create an Image
          if (bitmap && typeof bitmap === 'object' && typeof bitmap.width === 'number') {
            const sw = bitmap.width;
            const sh = bitmap.height;
            const side = Math.min(sw, sh);
            const sx = Math.floor((sw - side) / 2);
            const sy = Math.floor((sh - side) / 2);
            ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
          } else {
            // bitmap is a Blob fallback
            await new Promise((res, rej) => {
              const img2 = new Image();
              img2.onload = () => {
                try {
                  const sw = img2.naturalWidth;
                  const sh = img2.naturalHeight;
                  const side = Math.min(sw, sh);
                  const sx = Math.floor((sw - side) / 2);
                  const sy = Math.floor((sh - side) / 2);
                  ctx.drawImage(img2, sx, sy, side, side, 0, 0, size, size);
                  res();
                } catch (err) { rej(err); }
              };
              img2.onerror = (e) => rej(new Error('Failed to load fallback image'));
              if (bitmap instanceof Blob) img2.src = URL.createObjectURL(bitmap);
              else img2.src = URL.createObjectURL(file);
            });
          }

          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Canvas is empty'));
            const newFile = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
            resolve(newFile);
          }, 'image/jpeg', quality);
        } catch (err) {
          reject(err);
        }
      })();
    });
  };

  const handleFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      // Quick client-side validation
      const maxMB = 12;
      if (f.size / 1024 / 1024 > maxMB) {
        alert(`Ukuran file terlalu besar. Maksimal ${maxMB} MB.`);
        return;
      }

      // Resize & crop to square for consistent public display
      const processed = await resizeAndCropToSquare(f, 1200, 0.86);
      const url = URL.createObjectURL(processed);
      console.debug('EditRestaurantProfile: processed file', { name: processed.name, size: processed.size, type: processed.type, url });
      setPreview(url);
      setForm(prev => ({ ...prev, foto: processed }));

      // Collect debug info: original and processed dimensions + sizes
      try {
        let originalDimensions = null;
        let processedDimensions = null;
        // Use createImageBitmap when available for reliable dimensions
        if (typeof createImageBitmap === 'function') {
          try {
            const origBmp = await createImageBitmap(f);
            originalDimensions = { width: origBmp.width, height: origBmp.height };
          } catch (e) {
            console.debug('createImageBitmap(original) failed', e);
          }
          try {
            const procBmp = await createImageBitmap(processed);
            processedDimensions = { width: procBmp.width, height: procBmp.height };
          } catch (e) {
            console.debug('createImageBitmap(processed) failed', e);
          }
        }

        // Fallback: try loading Image to read naturalWidth/Height if needed
        if (!originalDimensions) {
          try {
            await new Promise((res, rej) => {
              const i = new Image();
              i.onload = () => { originalDimensions = { width: i.naturalWidth, height: i.naturalHeight }; res(); };
              i.onerror = () => res();
              i.src = URL.createObjectURL(f);
            });
          } catch (e) { /* ignore */ }
        }
        if (!processedDimensions) {
          try {
            await new Promise((res, rej) => {
              const i2 = new Image();
              i2.onload = () => { processedDimensions = { width: i2.naturalWidth, height: i2.naturalHeight }; res(); };
              i2.onerror = () => res();
              i2.src = url;
            });
          } catch (e) { /* ignore */ }
        }

        const debugPayload = {
          original: originalDimensions || { width: null, height: null },
          processed: processedDimensions || { width: null, height: null },
          fileSizeBefore: f.size,
          fileSizeAfter: processed.size,
          formatOutput: 'image/jpeg'
        };
        setImageDebugInfo(debugPayload);
        console.debug('Image debug info', debugPayload);
      } catch (e) {
        console.debug('Failed to collect image debug info', e);
      }
    } catch (err) {
      console.warn('Preview / resize gagal', err);
      // fallback to original file preview
      try {
        const url = URL.createObjectURL(f);
        console.debug('EditRestaurantProfile: fallback original file', { name: f.name, size: f.size, type: f.type, url });
        setPreview(url);
        setForm(prev => ({ ...prev, foto: f }));
      } catch (e) { /* ignore */ }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurant) return;
    setSaving(true);
    setError('');
    setUploadProgress(0);
    try {
      // 1) Update non-file fields via step-2 (send JSON)
      const id = restaurant.id || restaurant.restaurant_id || restaurant.slug || null;
      if (!id) throw new Error('ID toko tidak tersedia');

      const body = {
        nama_restoran: form.nama_restoran,
        alamat: form.alamat,
        no_telepon: form.no_telepon,
        maps_link: form.maps_link,
        operating_hours: form.operating_hours,
        social_media: form.social_media,
        deskripsi: form.deskripsi
      };

      await api.put(`/restaurants/${encodeURIComponent(id)}/step-2`, body);

      // 2) If a foto was selected, upload it separately to step-3
      if (form.foto) {
        const fd = new FormData();
        fd.append('foto', form.foto, form.foto.name || `foto_${Date.now()}.jpg`);
        const respUpload = await api.put(`/restaurants/${encodeURIComponent(id)}/step-3`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            try {
              if (progressEvent.total) {
                const p = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                setUploadProgress(p);
              }
            } catch (e) { /* ignore */ }
          }
        });
        // optional: inspect respUpload for errors
      }

      // 3) Refresh my-store and notify user
      try {
        const refresh = await api.get('/my-store');
        const payload = unwrap(refresh) || refresh?.data || {};
        const data = payload.restaurant || payload || refresh?.data?.restaurant || null;
        if (data) setRestaurant(data);
      } catch (e) {
        // non-fatal
        console.warn('Refresh my-store failed', e);
      }

      addToast('success', 'Perubahan berhasil disimpan.');
      setUploadProgress(100);
      setTimeout(() => navigate('/my-store'), 700);
    } catch (err) {
      console.error('Gagal menyimpan', err);
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan perubahan.';
      setError(msg);
      addToast('error', msg);
    } finally {
      setSaving(false);
      // reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 700);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Loader className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-lg font-medium text-gray-700">Memuat data toko...</p>
          <p className="text-sm text-gray-500 mt-2">Harap tunggu sebentar</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toasts items={toasts} />
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button 
            onClick={() => navigate('/my-store')}
            className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Edit Profil Toko
              </h1>
              <p className="text-base text-gray-600 max-w-2xl">
                Perbarui informasi toko Anda untuk memberikan pengalaman terbaik kepada pelanggan
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        <div onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content - Left Side */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Basic Info Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Informasi Dasar</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Toko
                    </label>
                    <input 
                      type="text"
                      value={form.nama_restoran} 
                      onChange={(e) => handleChange('nama_restoran', e.target.value)} 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Masukkan nama toko"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deskripsi Singkat
                    </label>
                    <textarea 
                      value={form.deskripsi} 
                      onChange={(e) => handleChange('deskripsi', e.target.value)} 
                      rows={4}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="Ceritakan tentang toko Anda..."
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Kontak & Lokasi</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      Alamat
                    </label>
                    <input 
                      type="text"
                      value={form.alamat} 
                      onChange={(e) => handleChange('alamat', e.target.value)} 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Alamat lengkap"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 text-green-600" />
                      Nomor Telepon
                    </label>
                    <input 
                      type="text"
                      value={form.no_telepon} 
                      onChange={(e) => handleChange('no_telepon', e.target.value)} 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="+62 812 xxxx xxxx"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      Link Google Maps
                    </label>
                    <input
                      type="text"
                      value={form.maps_link}
                      onChange={(e) => handleChange('maps_link', e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="https://www.google.com/maps/place/... atau -6.200000,106.816666"
                    />
                    <p className="text-xs text-gray-500 mt-1">Masukkan link Google Maps atau koordinat (lat,lng). Tombol Lokasi pada menu akan membuka link ini.</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      Jam Operasional
                    </label>
                    <input 
                      type="text"
                      value={form.operating_hours} 
                      onChange={(e) => handleChange('operating_hours', e.target.value)} 
                      placeholder="Senin-Sabtu 09:00-18:00"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Globe className="w-4 h-4 text-green-600" />
                      Sosial Media / Website
                    </label>
                    <input 
                      type="text"
                      value={form.social_media} 
                      onChange={(e) => handleChange('social_media', e.target.value)} 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="@username atau website"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sidebar - Right Side */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Photo Upload Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Foto Toko</h2>
                </div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="relative group mb-6"
                >
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                    {preview ? (
                      <img 
                        src={preview} 
                        alt="preview" 
                        onError={(e) => { console.warn('Preview image failed to load', e); setPreview(null); }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Camera className="w-12 h-12 mb-2" />
                        <p className="text-sm font-medium">Belum ada foto</p>
                      </div>
                    )}
                  </div>
                  {/* Debug card - shows image processing info when enabled */}
                  {debugImageInfo && imageDebugInfo && (
                    <div className="mt-3 p-3 border rounded-md bg-white">
                      <div className="text-xs font-medium mb-2">Debug Image Info</div>
                      <div className="text-xs font-mono text-gray-700">
                        <div>Original: {imageDebugInfo.original.width ?? '-'} x {imageDebugInfo.original.height ?? '-'} px</div>
                        <div>Processed: {imageDebugInfo.processed.width ?? '-'} x {imageDebugInfo.processed.height ?? '-'} px</div>
                        <div>Size before: {imageDebugInfo.fileSizeBefore ? (imageDebugInfo.fileSizeBefore/1024).toFixed(1) + ' KB' : '-'} </div>
                        <div>Size after: {imageDebugInfo.fileSizeAfter ? (imageDebugInfo.fileSizeAfter/1024).toFixed(1) + ' KB' : '-'} </div>
                        <div>Output format: {imageDebugInfo.formatOutput}</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-2xl pointer-events-none" />
                </motion.div>

                {/* Upload progress bar */}
                {uploadProgress > 0 && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ ease: 'easeOut', duration: 0.25 }}
                        className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-600 text-right">Uploading: {uploadProgress}%</div>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="block">
                    <span className="sr-only">Pilih foto</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFile}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 file:cursor-pointer cursor-pointer transition-all"
                    />
                  </label>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">Preview dan upload</div>
                    <button
                      type="button"
                      onClick={() => setDebugImageInfo(d => !d)}
                      className={`text-xs px-2 py-1 rounded-md border ${debugImageInfo ? 'bg-gray-100 border-gray-300' : 'bg-white border-transparent'} text-gray-700`}
                    >
                      Debug: {debugImageInfo ? 'On' : 'Off'}
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs text-blue-800 leading-relaxed">
                      <span className="font-semibold">Tips:</span> Gunakan foto berkualitas tinggi dengan rasio 1:1 untuk hasil terbaik
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <motion.button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.02 }}
                    whileTap={{ scale: saving ? 1 : 0.98 }}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-green-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Simpan Perubahan
                      </>
                    )}
                  </motion.button>

                  <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                    Perubahan profil dapat mempengaruhi status verifikasi. Pastikan semua data akurat.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Toast container at module bottom to keep component self-contained ---
function Toasts({ items }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      {items.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={`max-w-xs w-full rounded-lg p-3 shadow-lg flex items-start gap-3 ${t.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}
        >
          <div className="font-semibold text-sm">{t.type === 'success' ? 'Berhasil' : 'Gagal'}</div>
          <div className="text-sm leading-snug">{t.message}</div>
        </motion.div>
      ))}
    </div>
  );
}