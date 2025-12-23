import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { unwrap } from '../utils/api';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Inbox, ArrowLeft } from 'lucide-react';

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

  const getNotificationIcon = (n) => {
    const type = (n.type || '').toLowerCase();
    if (type === 'success' || (n.data && n.data.status === 'disetujui')) {
      return <CheckCircle className="w-6 h-6 text-green-700" />;
    }
    if (type === 'warning' || (n.data && n.data.status === 'ditolak')) {
      return <AlertTriangle className="w-6 h-6 text-amber-700" />;
    }
    return <Info className="w-6 h-6 text-blue-700" />;
  };

  const getNotificationBgColor = (n) => {
    const type = (n.type || '').toLowerCase();
    if (type === 'success' || (n.data && n.data.status === 'disetujui')) {
      return 'bg-green-500';
    }
    if (type === 'warning' || (n.data && n.data.status === 'ditolak')) {
      return 'bg-amber-500';
    }
    return 'bg-blue-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Baru saja' : `${diffInMinutes} menit lalu`;
    }
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    if (diffInHours < 48) return 'Kemarin';
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/home')}
          className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-green-600 transition-colors duration-200 font-medium group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          Kembali ke Beranda
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Notifikasi</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {unreadCount} notifikasi belum dibaca
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Memuat notifikasi...</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Notifikasi</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Notifikasi Anda akan muncul di sini ketika ada pembaruan atau informasi penting.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const Icon = getNotificationIcon(n);
              const bgColor = getNotificationBgColor(n);
              
              return (
                <button
                  key={n.id}
                  onClick={() => { navigate(`/notifications/${n.id}`); }}
                  className={`group w-full p-5 rounded-xl border-2 bg-white hover:shadow-xl hover:border-green-500 transition-all duration-200 ${
                    !n.is_read 
                      ? 'border-green-500 shadow-lg' 
                      : 'border-gray-300 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md`}>
                      <div className="text-white">{Icon}</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1 text-lg">
                          {n.title}
                        </h3>
                        {!n.is_read && (
                          <div className="flex-shrink-0 w-3 h-3 bg-green-600 rounded-full animate-pulse shadow-lg"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2 font-medium">
                        {n.message}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(n.created_at)}</span>
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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