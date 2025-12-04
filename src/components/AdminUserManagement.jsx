// RasoSehat-Frontend/src/components/AdminUserManagement.jsx
// Komponen untuk User Management dalam Admin Dashboard

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit2, Trash2, Eye, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

// Helper function: get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Helper function: format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Modal Edit Role
const EditRoleModal = ({ user, isOpen, onClose, onSave, isLoading }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || 'pembeli');

  useEffect(() => {
    setSelectedRole(user?.role || 'pembeli');
  }, [user?.role]);

  const handleSave = async () => {
    await onSave(user?.id, selectedRole);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Ubah Role Pengguna</h3>
          <p className="text-sm text-gray-500 mt-1">Pengguna: <strong>{user.name}</strong></p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Role Baru</label>
            <div className="space-y-2">
              {['pembeli', 'penjual', 'admin'].map((role) => (
                <label key={role} className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors" style={{
                  borderColor: selectedRole === role ? '#10b981' : '#e5e7eb',
                  backgroundColor: selectedRole === role ? '#f0fdf4' : '#ffffff'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900 capitalize">{role}</p>
                    <p className="text-xs text-gray-500">
                      {role === 'pembeli' && 'Dapat mencari menu dan memberikan review'}
                      {role === 'penjual' && 'Dapat mendaftarkan toko dan mengelola menu'}
                      {role === 'admin' && 'Dapat memverifikasi toko, menu, dan mengelola user'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Warning jika downgrade admin */}
          {user.role === 'admin' && selectedRole !== 'admin' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>Peringatan:</strong> Anda akan menurunkan role admin. Pastikan ada admin lain yang aktif.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || selectedRole === user.role}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Modal Konfirmasi Hapus User
const DeleteUserModal = ({ user, isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Konfirmasi Hapus User</h3>
          <p className="text-sm text-gray-500 mt-1">Pengguna: <strong>{user.name}</strong></p>
        </div>

        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-red-500 mt-0.5">⚠️</div>
              <div>
                <p className="text-sm font-medium text-red-800">Tindakan ini tidak dapat dibatalkan</p>
                <p className="text-xs text-red-700 mt-1">
                  Apakah Anda yakin ingin menghapus user <strong>{user.name}</strong>? 
                  Semua data terkait akan dihapus secara permanen.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Menghapus...' : 'Hapus User'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// User Table Row Component
const UserTableRow = ({ user, onEditRole, onDelete, isAdmin }) => {
  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    penjual: 'bg-blue-100 text-blue-700',
    pembeli: 'bg-gray-100 text-gray-700'
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-200">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img 
              src={user.avatar.startsWith('/') ? `http://localhost:3000${user.avatar}` : user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-medium text-sm">
              {getInitials(user.name)}
            </div>
          )}
          <span className="font-medium text-gray-900">{user.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{user.phone || '-'}</td>
      <td className="px-6 py-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.created_at)}</td>
      <td className="px-6 py-4 text-sm space-x-2">
        <button
          onClick={() => onEditRole(user)}
          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium text-xs transition-colors flex items-center gap-2 inline-flex"
        >
          <Edit2 size={14} /> Edit Role
        </button>
        {user.role !== 'admin' && (
          <button
            onClick={() => onDelete(user)}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium text-xs transition-colors flex items-center gap-2 inline-flex"
          >
            <Trash2 size={14} /> Hapus
          </button>
        )}
      </td>
    </tr>
  );
};

// Main Component
export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users
  const fetchUsers = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/users', {
        params: {
          page,
          limit: 20,
          search
        }
      });

      const data = response.data;
      if (data.success && data.data) {
        setUsers(Array.isArray(data.data) ? data.data : []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      } else {
        setUsers([]);
        setError('Format response tidak valid');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users saat komponen mount atau search berubah
  useEffect(() => {
    fetchUsers(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchUsers]);

  // Handle edit role
  const handleEditRole = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  // Handle save role
  const handleSaveRole = async (userId, newRole) => {
    try {
      setUpdatingRole(true);
      const response = await api.patch(`/admin/users/${userId}/role`, {
        role: newRole
      });

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setShowEditModal(false);
      setSelectedUser(null);

      // Show success message
      alert('Role pengguna berhasil diubah');
    } catch (err) {
      console.error('Error updating role:', err);
      alert(err.response?.data?.message || 'Gagal mengubah role pengguna');
    } finally {
      setUpdatingRole(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      setDeletingUser(true);
      await api.delete(`/admin/users/${selectedUser.id}`);

      // Remove user from local state
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);

      // Show success message
      alert('User berhasil dihapus');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Gagal menghapus user');
    } finally {
      setDeletingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h2>
        <p className="text-gray-600 text-sm mt-1">Kelola semua pengguna dan ubah role mereka</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin text-green-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-600 mt-2">Memuat data pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nama</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">No. HP</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tanggal Bergabung</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserTableRow 
                    key={user.id} 
                    user={user} 
                    onEditRole={handleEditRole}
                    onDelete={handleDeleteUser}
                    isAdmin={user.role === 'admin'}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sebelumnya
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? 'bg-green-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Berikutnya
          </button>
        </div>
      )}

      {/* Edit Role Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditRoleModal
            user={selectedUser}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSave={handleSaveRole}
            isLoading={updatingRole}
          />
        )}
      </AnimatePresence>

      {/* Delete User Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteUserModal
            user={selectedUser}
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedUser(null);
            }}
            onConfirm={handleConfirmDelete}
            isLoading={deletingUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
