import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { unwrap } from '../utils/api';

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionUsed, setActionUsed] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const list = unwrap(res) || [];
      const found = list.find(item => String(item.id) === String(id));
      if (found) setNotification(found);
      else setNotification(null);
    } catch (err) {
      console.error('Failed to fetch notification', err);
      setNotification(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [id]);

  // Mark as read on view if not already read
  useEffect(() => {
    const markOnView = async () => {
      if (!loading && notification && !notification.is_read) {
        try {
          await api.patch(`/notifications/${notification.id}/read`);
          setNotification(prev => prev ? { ...prev, is_read: true } : prev);
        } catch (e) {
          console.warn('Failed to mark notification read on view', e);
        }
      }
    };
    markOnView();
  }, [loading, notification]);

  const handleBack = () => navigate('/notifications');

  const handleMarkRead = async () => {
    if (!notification) return;
    try {
      await api.patch(`/notifications/${notification.id}/read`);
      setNotification(prev => prev ? { ...prev, is_read: true } : prev);
    } catch (err) {
      console.error('mark read failed', err);
    }
  };

  const handleAction = () => {
    // Navigate to one-time signup link for the restaurant if present in payload
    const restId = notification?.data?.restaurant_id;
    if (restId && !actionUsed) {
      setActionUsed(true);
      // Mark notification read and navigate to unified register-store page with param
      handleMarkRead();
      navigate(`/register-store?restaurantId=${encodeURIComponent(restId)}`);
    }
  };

  if (loading) return <div className="pt-24 p-6">Memuat...</div>;

  if (!notification) return (
    <div className="pt-24 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 text-center">
        <h2 className="text-lg font-semibold">Notifikasi tidak ditemukan</h2>
        <p className="text-sm text-gray-500 mt-2">Notifikasi mungkin sudah dihapus atau tidak tersedia.</p>
        <div className="mt-4">
          <button onClick={handleBack} className="px-4 py-2 bg-green-600 text-white rounded">Kembali ke Notifikasi</button>
        </div>
      </div>
    </div>
  );

  const displayDate = notification.created_at ? new Date(notification.created_at).toLocaleString() : '';
  const statusLabel = (notification.data && notification.data.status === 'disetujui') ? 'Diterima' : ((notification.data && notification.data.status === 'ditolak') ? 'Ditolak' : (notification.type === 'success' ? 'Diterima' : (notification.type === 'warning' ? 'Ditolak' : 'Menunggu')));

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">{notification.title}</h1>
            <div className="text-sm text-gray-500">{displayDate}</div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabel === 'Disetujui' ? 'bg-green-50 text-green-700' : (statusLabel === 'Ditolak' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700')}`}>
              {statusLabel}
            </div>
          </div>

          <div className="mt-6 text-gray-700">
            <p className="whitespace-pre-wrap">{notification.message}</p>
            {notification.data && notification.data.note && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <strong>Catatan dari admin:</strong>
                <div className="mt-2 text-sm text-gray-600">{notification.data.note}</div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            {notification.data && notification.data.restaurant_id && (
              <button onClick={handleAction} disabled={actionUsed} className={`px-4 py-2 rounded font-semibold ${actionUsed ? 'bg-gray-300 text-gray-700' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                {actionUsed ? 'Link telah digunakan' : 'Lanjutkan Pendaftaran Toko'}
              </button>
            )}

            <button onClick={handleBack} className="px-4 py-2 rounded bg-white border text-gray-700">Kembali ke Notifikasi</button>
          </div>
        </div>
      </div>
    </div>
  );
}
