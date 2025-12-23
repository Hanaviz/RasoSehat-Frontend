import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert('Konfirmasi kata sandi tidak cocok.');
    if (newPassword.length < 8) return alert('Kata sandi minimal 8 karakter.');

    try {
      setLoading(true);
      const res = await api.patch('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      alert(res.data?.message || 'Kata sandi berhasil diubah.');
      // For security, log the user out so they must re-login with new password
      try { await logout(); } catch (e) { /* ignore logout error */ }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal mengganti kata sandi.';
      alert(msg);
    } finally {
      setLoading(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md w-full mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Ubah Kata Sandi</h3>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Kata sandi lama</label>
        <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md" />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Kata sandi baru</label>
        <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md" />
        <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter.</p>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Konfirmasi kata sandi baru</label>
        <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md" />
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60">{loading ? 'Menyimpan...' : 'Ubah Kata Sandi'}</button>
      </div>
    </form>
  );
}
