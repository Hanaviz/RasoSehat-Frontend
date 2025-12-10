import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { unwrap, makeImageUrl } from '../utils/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader, Save, Camera, Upload } from 'lucide-react';

export default function EditMenuPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menu, setMenu] = useState(null);
  const [form, setForm] = useState({
    nama_menu: '', harga: '', kategori_id: '', deskripsi: '', bahan_baku: '', metode_masak: '', diet_claims: [],
    kalori: '', protein: '', gula: '', lemak: '', serat: '', lemak_jenuh: '', foto: null
  });
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [debugImageInfo, setDebugImageInfo] = useState(false);
  const [imageDebugInfo, setImageDebugInfo] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/menus/${encodeURIComponent(id)}`);
        const payload = unwrap(res) || res?.data || {};
        const data = payload.data || payload || res?.data || null;
        if (data) {
          setMenu(data);
          setForm(prev => ({
            ...prev,
            nama_menu: data.nama_menu || '',
            harga: data.harga || '',
            kategori_id: data.kategori_id || '',
            deskripsi: data.deskripsi || '',
            bahan_baku: data.bahan_baku || '',
            metode_masak: data.metode_masak || '',
            diet_claims: data.diet_claims || [],
            kalori: data.kalori || '', protein: data.protein || '', gula: data.gula || '', lemak: data.lemak || '', serat: data.serat || '', lemak_jenuh: data.lemak_jenuh || ''
          }));
          if (data.foto) setPreview(makeImageUrl(data.foto));
        }
      } catch (err) {
        console.error('Failed load menu', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const resizeAndCropToSquare = (file, size = 1200, quality = 0.86) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let bitmap;
          if (typeof createImageBitmap === 'function') {
            bitmap = await createImageBitmap(file);
          } else {
            await new Promise((res, rej) => {
              const reader = new FileReader();
              reader.onerror = () => rej(new Error('Failed to read file'));
              reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                  try {
                    const off = document.createElement('canvas');
                    off.width = img.naturalWidth;
                    off.height = img.naturalHeight;
                    const octx = off.getContext('2d');
                    octx.drawImage(img, 0, 0);
                    off.toBlob((b) => {
                      if (!b) return rej(new Error('Failed to create blob'));
                      bitmap = b;
                      res();
                    });
                  } catch (err) { rej(err); }
                };
                img.onerror = () => rej(new Error('Failed to load image'));
                img.src = reader.result;
              };
              reader.readAsDataURL(file);
            });
          }

          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, size, size);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          if (bitmap && typeof bitmap === 'object' && typeof bitmap.width === 'number') {
            const sw = bitmap.width;
            const sh = bitmap.height;
            const side = Math.min(sw, sh);
            const sx = Math.floor((sw - side) / 2);
            const sy = Math.floor((sh - side) / 2);
            ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
          } else {
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
              img2.onerror = () => rej(new Error('Failed to load fallback image'));
              if (bitmap instanceof Blob) img2.src = URL.createObjectURL(bitmap);
              else img2.src = URL.createObjectURL(file);
            });
          }

          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Canvas is empty'));
            const newFile = new File([blob], `menu_${Date.now()}.jpg`, { type: 'image/jpeg' });
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
      const processed = await resizeAndCropToSquare(f, 1200, 0.86);
      const url = URL.createObjectURL(processed);
      setPreview(url);
      setForm(prev => ({ ...prev, foto: processed }));

      try {
        let originalDimensions = null;
        let processedDimensions = null;
        if (typeof createImageBitmap === 'function') {
          try { const origBmp = await createImageBitmap(f); originalDimensions = { width: origBmp.width, height: origBmp.height }; } catch (e) {}
          try { const procBmp = await createImageBitmap(processed); processedDimensions = { width: procBmp.width, height: procBmp.height }; } catch (e) {}
        }
        if (!originalDimensions) {
          await new Promise((res) => {
            const i = new Image(); i.onload = () => { originalDimensions = { width: i.naturalWidth, height: i.naturalHeight }; res(); }; i.onerror = () => res(); i.src = URL.createObjectURL(f);
          });
        }
        if (!processedDimensions) {
          await new Promise((res) => {
            const i2 = new Image(); i2.onload = () => { processedDimensions = { width: i2.naturalWidth, height: i2.naturalHeight }; res(); }; i2.onerror = () => res(); i2.src = url;
          });
        }
        setImageDebugInfo({ original: originalDimensions, processed: processedDimensions, fileSizeBefore: f.size, fileSizeAfter: processed.size, formatOutput: 'image/jpeg' });
      } catch (e) { console.debug('Debug info failed', e); }

    } catch (err) {
      console.warn('Menu image process failed', err);
      try { const url = URL.createObjectURL(f); setPreview(url); setForm(prev => ({ ...prev, foto: f })); } catch (e) {}
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!menu) return;
    setSaving(true);
    try {
      // If there's a file to upload, send a single multipart PATCH including fields + foto
      if (form.foto && form.foto instanceof File) {
        const fd = new FormData();
        fd.append('nama_menu', form.nama_menu);
        fd.append('harga', form.harga);
        fd.append('kategori_id', form.kategori_id);
        fd.append('deskripsi', form.deskripsi);
        fd.append('bahan_baku', form.bahan_baku);
        fd.append('metode_masak', form.metode_masak);
        // diet_claims may be array
        if (Array.isArray(form.diet_claims)) fd.append('diet_claims', JSON.stringify(form.diet_claims));
        else if (form.diet_claims) fd.append('diet_claims', form.diet_claims);
        fd.append('kalori', form.kalori);
        fd.append('protein', form.protein);
        fd.append('gula', form.gula);
        fd.append('lemak', form.lemak);
        fd.append('serat', form.serat);
        fd.append('lemak_jenuh', form.lemak_jenuh);
        fd.append('foto', form.foto, form.foto.name || `menu_${Date.now()}.jpg`);

        await api.patch(`/menus/${encodeURIComponent(id)}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (ev) => {
            if (ev.total) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        });
      } else {
        const body = {
          nama_menu: form.nama_menu,
          harga: form.harga,
          kategori_id: form.kategori_id,
          deskripsi: form.deskripsi,
          bahan_baku: form.bahan_baku,
          metode_masak: form.metode_masak,
          diet_claims: form.diet_claims,
          kalori: form.kalori, protein: form.protein, gula: form.gula, lemak: form.lemak, serat: form.serat, lemak_jenuh: form.lemak_jenuh
        };
        await api.patch(`/menus/${encodeURIComponent(id)}`, body);
      }
      alert('Perubahan menu tersimpan');
      navigate('/my-store');
    } catch (err) {
      console.error('Save menu failed', err);
      alert('Gagal menyimpan menu');
    } finally {
      setSaving(false);
      setTimeout(() => setUploadProgress(0), 600);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Loader className="w-14 h-14 animate-spin text-green-600 mx-auto" />
        <p className="mt-4 text-gray-600 font-medium">Memuat data menu...</p>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/40 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/my-store')} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Menu</h1>
            <p className="text-sm text-gray-500 mt-1">Perbarui informasi menu Anda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Form Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              
              {/* Basic Info Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                  Informasi Dasar
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Menu</label>
                    <input 
                      value={form.nama_menu} 
                      onChange={e => handleChange('nama_menu', e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 outline-none"
                      placeholder="Masukkan nama menu"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Harga (Rp)</label>
                      <input 
                        value={form.harga} 
                        onChange={e => handleChange('harga', e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori ID</label>
                      <input 
                        value={form.kategori_id} 
                        onChange={e => handleChange('kategori_id', e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 outline-none"
                        placeholder="ID kategori"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                    <textarea 
                      value={form.deskripsi} 
                      onChange={e => handleChange('deskripsi', e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 outline-none resize-none"
                      rows={4}
                      placeholder="Deskripsikan menu Anda..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bahan Baku</label>
                      <input 
                        value={form.bahan_baku} 
                        onChange={e => handleChange('bahan_baku', e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 outline-none"
                        placeholder="Daging, sayuran, dll"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Metode Masak</label>
                      <input 
                        value={form.metode_masak} 
                        onChange={e => handleChange('metode_masak', e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 outline-none"
                        placeholder="Goreng, rebus, panggang"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutrition Info Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                  Informasi Gizi
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kalori (kcal)</label>
                    <input 
                      value={form.kalori} 
                      onChange={e => handleChange('kalori', e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Protein (g)</label>
                    <input 
                      value={form.protein} 
                      onChange={e => handleChange('protein', e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gula (g)</label>
                    <input 
                      value={form.gula} 
                      onChange={e => handleChange('gula', e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lemak (g)</label>
                    <input 
                      value={form.lemak} 
                      onChange={e => handleChange('lemak', e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Serat (g)</label>
                    <input 
                      value={form.serat} 
                      onChange={e => handleChange('serat', e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lemak Jenuh (g)</label>
                    <input 
                      value={form.lemak_jenuh} 
                      onChange={e => handleChange('lemak_jenuh', e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

            </motion.div>

            {/* Image Upload Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                  Foto Menu
                </h2>

                {/* Image Preview */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner mb-6 relative group"
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Camera className="w-16 h-16 mb-3 opacity-50" />
                      <p className="text-sm font-medium">Belum ada foto</p>
                      <p className="text-xs text-gray-400 mt-1">Upload foto menu</p>
                    </div>
                  )}
                </motion.div>

                {/* File Input */}
                <div className="mb-6">
                  <label className="block">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      <Upload className="w-5 h-5" />
                      Pilih Foto Baru
                    </motion.div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFile} 
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2 text-center">JPG, PNG atau WEBP (max. 10MB)</p>
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 shadow-sm"
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-600 text-center font-medium">
                      Uploading: {uploadProgress}%
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={saving}
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
              </div>
            </motion.div>

          </div>
        </form>

      </motion.div>
    </div>
  );
}