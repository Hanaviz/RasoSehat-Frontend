import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { unwrap, makeImageUrl } from '../utils/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader, Save, Camera } from 'lucide-react';

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

      // debug info
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
      await api.put(`/menus/${encodeURIComponent(id)}`, body);
      if (form.foto && form.foto instanceof File) {
        const fd = new FormData();
        fd.append('foto', form.foto, form.foto.name || `menu_${Date.now()}.jpg`);
        await api.put(`/menus/${encodeURIComponent(id)}/foto`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (ev) => {
            if (ev.total) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        });
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
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <Loader className="w-12 h-12 animate-spin text-green-600" />
        <div className="mt-2">Memuat data menu...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate('/my-store')} className="text-sm text-gray-700">← Kembali</button>
          <h1 className="text-2xl font-bold">Edit Menu</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Menu</label>
                <input value={form.nama_menu} onChange={e => handleChange('nama_menu', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Harga</label>
                  <input value={form.harga} onChange={e => handleChange('harga', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                  <input value={form.kategori_id} onChange={e => handleChange('kategori_id', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={e => handleChange('deskripsi', e.target.value)} className="w-full px-3 py-2 rounded-lg border" rows={4} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bahan Baku</label>
                  <input value={form.bahan_baku} onChange={e => handleChange('bahan_baku', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Metode Masak</label>
                  <input value={form.metode_masak} onChange={e => handleChange('metode_masak', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kalori (kcal)</label>
                  <input value={form.kalori} onChange={e => handleChange('kalori', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Protein (g)</label>
                  <input value={form.protein} onChange={e => handleChange('protein', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gula (g)</label>
                  <input value={form.gula} onChange={e => handleChange('gula', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lemak (g)</label>
                  <input value={form.lemak} onChange={e => handleChange('lemak', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Serat (g)</label>
                  <input value={form.serat} onChange={e => handleChange('serat', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lemak Jenuh (g)</label>
                  <input value={form.lemak_jenuh} onChange={e => handleChange('lemak_jenuh', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                </div>
              </div>

            </div>

            <div className="space-y-4">
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Camera className="w-12 h-12 mb-2" />
                    <p className="text-sm font-medium">Belum ada foto</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block">
                  <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-gray-600" />
                </label>
              </div>

              {uploadProgress > 0 && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${uploadProgress}%` }} className="h-2 bg-gradient-to-r from-green-500 to-emerald-600" />
                  </div>
                  <div className="mt-2 text-xs text-gray-600 text-right">Uploading: {uploadProgress}%</div>
                </div>
              )}

              <div className="pt-4">
                <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>

            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
