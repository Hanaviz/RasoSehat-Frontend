import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { unwrap } from '../utils/api';
import { CheckCircle, XCircle, Clock, ArrowLeft, FileText } from 'lucide-react';

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

  if (loading) return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Memuat notifikasi...</p>
        </div>
      </div>
    </div>
  );

  if (!notification) return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-12 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Notifikasi Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Notifikasi yang Anda cari mungkin sudah dihapus atau tidak tersedia.
          </p>
          <button 
            onClick={handleBack} 
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Notifikasi
          </button>
        </div>
      </div>
    </div>
  );

  const displayDate = notification.created_at ? new Date(notification.created_at).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : '';
  
  const statusLabel = (notification.data && notification.data.status === 'disetujui') ? 'Disetujui' : ((notification.data && notification.data.status === 'ditolak') ? 'Ditolak' : (notification.type === 'success' ? 'Diterima' : (notification.type === 'warning' ? 'Ditolak' : 'Menunggu')));

  const getStatusConfig = () => {
    if (statusLabel === 'Disetujui' || statusLabel === 'Diterima') {
      return {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600'
      };
    } else if (statusLabel === 'Ditolak') {
      return {
        icon: XCircle,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600'
      };
    } else {
      return {
        icon: Clock,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        iconColor: 'text-amber-600'
      };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-green-600 transition-colors duration-200 font-medium group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          Kembali ke Notifikasi
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">{notification.title}</h1>
                <div className="flex items-center gap-2 text-green-50">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{displayDate}</span>
                </div>
              </div>
              {!notification.is_read && (
                <div className="flex-shrink-0 ml-4">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Status Badge */}
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
                <span className="font-semibold">{statusLabel}</span>
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {notification.message}
                </p>
              </div>
            </div>

            {/* Admin Note */}
            {notification.data && notification.data.note && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Catatan dari Admin</h3>
                    <p className="text-gray-700 leading-relaxed">{notification.data.note}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
              {notification.data && notification.data.restaurant_id && (
                <button 
                  onClick={handleAction} 
                  disabled={actionUsed} 
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    actionUsed 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg hover:scale-105'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  {actionUsed ? 'Link Telah Digunakan' : 'Lanjutkan Pendaftaran Toko'}
                </button>
              )}

              <button 
                onClick={handleBack} 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-green-300 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}