import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const MenuReviewSection = ({ menuId }) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [komentar, setKomentar] = useState('');
  const [error, setError] = useState('');

  // Fetch ulasan saat komponen mount
  useEffect(() => {
    fetchReviews();
  }, [menuId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/ulasan/menu/${menuId}`);
      if (response.data.success) {
        setReviews(response.data.data.reviews);
        setStats(response.data.data.stats);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Anda harus login untuk memberikan ulasan');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Rating harus antara 1-5');
      return;
    }
    if (!komentar.trim()) {
      setError('Komentar tidak boleh kosong');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await api.post('/ulasan', { menu_id: menuId, rating, komentar });
      if (response.data.success) {
        // Refresh ulasan setelah submit
        await fetchReviews();
        setRating(5);
        setKomentar('');
      } else {
        setError(response.data.message || 'Gagal menambah ulasan');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Gagal menambah ulasan');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header dengan stats */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-green-500" />
          Ulasan ({stats.total_reviews})
        </h2>
        {stats.total_reviews > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStars(Math.round(stats.average_rating))}
            </div>
            <span className="text-lg font-semibold text-gray-700">
              {stats.average_rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Form tambah ulasan */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitReview} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Komentar</label>
            <textarea
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Bagikan pengalaman Anda tentang menu ini..."
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Kirim Ulasan
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Login diperlukan</strong> untuk memberikan ulasan.{' '}
            <a href="/signin" className="text-green-600 hover:underline">Masuk sekarang</a>
          </p>
        </div>
      )}

      {/* Daftar ulasan */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-700">
                      {review.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800">{review.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="text-gray-700 mb-2">{review.komentar}</p>
              <p className="text-xs text-gray-500">
                {new Date(review.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuReviewSection;