import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { unwrap } from '../utils/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const data = unwrap(res) || [];
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Notifikasi</h1>

        {loading ? (
          <div className="text-sm text-gray-600">Memuat notifikasi...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 bg-white rounded-xl shadow text-center text-gray-500">Belum ada notifikasi.</div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const type = (n.type || '').toLowerCase();
              let Icon = <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20h.01" /></svg>;
              if (type === 'success' || (n.data && n.data.status === 'disetujui')) Icon = <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
              if (type === 'warning' || (n.data && n.data.status === 'ditolak')) Icon = <svg className="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l.94 4.56a1 1 0 00.98.78h4.8c.89 0 1.26 1.08.54 1.54L13.5 16.5a1 1 0 00-.36 1.1l1.2 3.6" /></svg>;

              return (
                <button
                  key={n.id}
                  onClick={() => { navigate(`/notifications/${n.id}`); }}
                  className={`w-full p-4 rounded-lg border bg-white hover:shadow flex items-start gap-3 transition ${!n.is_read ? 'ring-1 ring-green-200' : ''}`}
                >
                  <div className="p-2 rounded-full bg-gray-50 flex-shrink-0">{Icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="truncate">
                        <div className="font-semibold text-gray-800 truncate">{n.title}</div>
                        <div className="text-sm text-gray-500 mt-1 truncate">{n.message}</div>
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
