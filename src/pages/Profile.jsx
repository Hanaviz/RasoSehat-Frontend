import React, { useState, useRef, useEffect } from "react";
import { Camera, Edit2, Save, X, Mail, Phone, Calendar, User } from "lucide-react";
import api from '../utils/api';
// derive backend origin from api base URL so relative upload paths can be resolved
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/api\/?$/i, '');
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  // Real user data loaded from API
  const [userData, setUserData] = useState(null);

  const [isEditing, setIsEditing] = useState({
    username: false,
    birthDate: false,
    gender: false,
    email: false,
    phone: false
  });

  const [tempData, setTempData] = useState({ ...userData });
  const [previewImage, setPreviewImage] = useState('');
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const { refreshProfile } = useAuth();

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Hanya file JPG, JPEG, dan PNG yang diperbolehkan');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      // store file for upload
      setTempData(prev => ({ ...prev, avatarFile: file }));
    }
  };

  // build absolute URL for images served by backend
  const makeImageUrl = (u) => {
    if (!u) return '';
    try {
      const s = String(u);
      // already absolute
      if (/^https?:\/\//i.test(s)) return encodeURI(s);
      // if starts with / treat as relative to API origin
      if (s.startsWith('/')) return encodeURI(API_ORIGIN + s);
      // otherwise attempt to return encoded string
      return encodeURI(s);
    } catch (e) {
      return '';
    }
  };

  // Handle edit toggle
  const toggleEdit = (field) => {
    if (isEditing[field]) {
      // Save changes
      handleSaveField(field, tempData[field]);
    } else {
      // Start editing
      setTempData({ ...userData });
    }
    setIsEditing({ ...isEditing, [field]: !isEditing[field] });
  };

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        const data = res.data && res.data.data ? res.data.data : res.data || {};
        // normalize keys to match local state
        const normalized = {
          username: data.username || data.name || data.full_name || data.nama || '',
          birthDate: data.birth_date || data.tanggal_lahir || data.birthDate || '',
          gender: data.gender || data.jenis_kelamin || '',
          email: data.email || '',
          phone: data.phone || data.nomorHP || data.nomor_hp || '',
          avatar: data.avatar || data.avatar_url || (data.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(data.email)}&background=16a34a&color=fff&size=400` : ''),
          id: data.id || data.user_id || null,
        };
        setUserData(normalized);
        setTempData(normalized);
        setPreviewImage(makeImageUrl(normalized.avatar || ''));
      } catch (e) {
        console.error('Failed to load profile', e);
        // fallback to empty user
        setUserData({ username: '', birthDate: '', gender: '', email: '', phone: '', avatar: '' });
        setTempData({ username: '', birthDate: '', gender: '', email: '', phone: '', avatar: '' });
      }
    };
    fetchProfile();
  }, []);

  // Save a single field to backend
  const handleSaveField = async (field, value) => {
    if (!userData) return;
    setIsSaving(true);
    try {
      // Build payload with backend column names only (avoid sending UI-only keys)
      const payload = {};
      if (field === 'username') payload.name = value;
      else if (field === 'birthDate') payload.birth_date = value;
      else if (field === 'phone') payload.phone = value;
      else if (field === 'gender') payload.gender = value;
      else if (field === 'email') payload.email = value;

      const res = await api.put('/auth/profile', payload).catch(err => { throw err; });
      // optimistic update
      setUserData(prev => ({ ...prev, [field]: value }));
      // refresh auth context user if available
      try { refreshProfile(); } catch (e) { /* ignore */ }
    } catch (e) {
      console.error('Failed to save profile field', e);
      const msg = e?.response?.data?.message || e.message || 'Gagal menyimpan perubahan. Periksa koneksi dan coba lagi.';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Save avatar (file upload)
  const handleSaveAvatar = async () => {
    if (!tempData || !tempData.avatarFile) {
      alert('Pilih gambar terlebih dahulu.');
      return;
    }
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('avatar', tempData.avatarFile);
      const res = await api.post('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const avatarUrl = res.data && (res.data.avatar || res.data.avatar_url || (res.data.data && res.data.data.avatar));
      if (avatarUrl) {
        setUserData(prev => ({ ...prev, avatar: avatarUrl }));
        setPreviewImage(makeImageUrl(avatarUrl));
        setTempData(prev => ({ ...prev, avatarFile: null }));
        alert('Foto profil berhasil diperbarui.');
        try { refreshProfile(); } catch (e) { /* ignore */ }
      } else {
        alert('Profil diperbarui, namun tidak menerima URL avatar dari server.');
      }
    } catch (e) {
      console.error('Failed to upload avatar', e);
      alert('Gagal mengunggah avatar. Periksa koneksi dan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const cancelEdit = (field) => {
    setTempData({ ...userData });
    setIsEditing({ ...isEditing, [field]: false });
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setTempData({ ...tempData, [field]: value });
  };

  // Handle save password (mock)
  const handleSavePassword = () => {
    // In real app, validate and send to backend
    alert('Kata sandi berhasil diubah!');
  };

  // show loading state until userData is fetched
  if (userData === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">Memuat profil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 pt-24 md:pt-28 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header with gradient */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Profil Saya</h1>
          <p className="text-green-100">Kelola informasi pribadi Anda</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Profile Picture Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative group mb-4">
                <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-green-500 ring-offset-4 shadow-xl">
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Camera overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Camera className="w-8 h-8 text-white" />
                </button>

                {/* Edit badge */}
                <div className="absolute bottom-2 right-2 bg-green-600 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleImageChange}
                className="hidden"
              />

              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {userData.username}
              </h2>
              <p className="text-gray-500 text-sm mb-4">Member RasoSehat</p>

              {/* File info */}
              <div className="w-full bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Ekstensi file yang diperbolehkan:
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <span className="px-3 py-1 bg-white rounded-lg text-xs font-semibold text-green-600 border border-green-200">
                    .JPG
                  </span>
                  <span className="px-3 py-1 bg-white rounded-lg text-xs font-semibold text-green-600 border border-green-200">
                    .JPEG
                  </span>
                  <span className="px-3 py-1 bg-white rounded-lg text-xs font-semibold text-green-600 border border-green-200">
                    .PNG
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Maksimal ukuran: 5MB
                </p>
              </div>

              {/* Save Avatar Button */}
              <button
                onClick={handleSaveAvatar}
                disabled={isSaving}
                className={`mt-6 w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Menyimpan...' : 'Simpan Foto Profil'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biodata Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Ubah Biodata Diri</h3>
            </div>

            <div className="space-y-5">
              {/* Username */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={isEditing.username ? tempData.username : userData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      disabled={!isEditing.username}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing.username
                          ? 'border-green-500 bg-white focus:ring-4 focus:ring-green-100'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      } focus:outline-none`}
                      placeholder="Masukkan username"
                    />
                    {!isEditing.username && userData.username && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 font-semibold">
                        Ubah
                      </span>
                    )}
                  </div>
                  {isEditing.username ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleEdit('username')}
                        className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-300 shadow-md hover:shadow-lg"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => cancelEdit('username')}
                        className="p-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors duration-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleEdit('username')}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      Ubah
                    </button>
                  )}
                </div>
              </div>

              {/* Birth Date */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Lahir
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={isEditing.birthDate ? tempData.birthDate : userData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      disabled={!isEditing.birthDate}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing.birthDate
                          ? 'border-green-500 bg-white focus:ring-4 focus:ring-green-100'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      } focus:outline-none`}
                    />
                    {!isEditing.birthDate && !userData.birthDate && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 font-semibold">
                        Tambah Tanggal Lahir
                      </span>
                    )}
                  </div>
                  {isEditing.birthDate ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleEdit('birthDate')}
                        className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-300 shadow-md hover:shadow-lg"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => cancelEdit('birthDate')}
                        className="p-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors duration-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleEdit('birthDate')}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      {userData.birthDate ? 'Ubah' : 'Tambah'}
                    </button>
                  )}
                </div>
              </div>

              {/* Gender */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <select
                      value={isEditing.gender ? tempData.gender : userData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      disabled={!isEditing.gender}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing.gender
                          ? 'border-green-500 bg-white focus:ring-4 focus:ring-green-100'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      } focus:outline-none appearance-none`}
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      {!isEditing.gender && !userData.gender ? (
                        <span className="text-green-600 font-semibold">
                          Tambah Jenis Kelamin
                        </span>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {isEditing.gender ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleEdit('gender')}
                        className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-300 shadow-md hover:shadow-lg"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => cancelEdit('gender')}
                        className="p-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors duration-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleEdit('gender')}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      {userData.gender ? 'Ubah' : 'Tambah'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Ubah Kontak</h3>
            </div>

            <div className="space-y-5">
              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={isEditing.email ? tempData.email : userData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing.email}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing.email
                          ? 'border-green-500 bg-white focus:ring-4 focus:ring-green-100'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      } focus:outline-none`}
                      placeholder="contoh@email.com"
                    />
                    {!isEditing.email && !userData.email && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 font-semibold">
                        Tambah Email
                      </span>
                    )}
                  </div>
                  {isEditing.email ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleEdit('email')}
                        className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-300 shadow-md hover:shadow-lg"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => cancelEdit('email')}
                        className="p-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors duration-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleEdit('email')}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      {userData.email ? 'Ubah' : 'Tambah'}
                    </button>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomor HP
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={isEditing.phone ? tempData.phone : userData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing.phone}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing.phone
                          ? 'border-green-500 bg-white focus:ring-4 focus:ring-green-100'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      } focus:outline-none`}
                      placeholder="08xxxxxxxxxx"
                    />
                    {!isEditing.phone && !userData.phone && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 font-semibold">
                        Tambah Nomor HP
                      </span>
                    )}
                  </div>
                  {isEditing.phone ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleEdit('phone')}
                        className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-300 shadow-md hover:shadow-lg"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => cancelEdit('phone')}
                        className="p-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors duration-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleEdit('phone')}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      {userData.phone ? 'Ubah' : 'Tambah'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}