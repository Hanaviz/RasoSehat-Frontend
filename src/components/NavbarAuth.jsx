import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import debounce from 'lodash/debounce';
import { useAuth } from '../context/AuthContext';
import { makeImageUrl, unwrap } from '../utils/api';
import api from '../utils/api';
import { normalizeResultList } from '../utils/searchNormalizer';

export default function NavbarAuth() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cacheRef = useRef({});
  const searchContainerRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  

  // Use authentication context for real user data
  const { user, logout } = useAuth();
  // isPenjual removed; use user.role === 'penjual' instead

  // Fallback UI values when user is not yet available
  const displayName = user?.name || 'Pengguna';
  const displayEmail = user?.email || '';
  const avatarUrl = user?.avatar ? makeImageUrl(user.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=16a34a&color=fff`;
  const isStoreMember = !!(user && user.role === 'penjual');

  // Notifications loaded from backend
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from backend (protected route)
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const list = unwrap(res) || [];
      if (list && Array.isArray(list)) {
        // normalize: ensure boolean is_read is numeric -> boolean
        const mapped = list.map(n => {
          // parse data field if it's a JSON string
          let parsed = null;
          try {
            parsed = n.data && typeof n.data === 'string' ? JSON.parse(n.data) : n.data || null;
          } catch (e) {
            parsed = n.data || null;
          }

          const isRead = n.is_read === 1 || n.is_read === true;
          const time = n.time || (n.created_at ? new Date(n.created_at).toLocaleString() : null);

          return {
            ...n,
            data: parsed,
            is_read: isRead,
            time,
          };
        });
        setNotifications(mapped);
      }
    } catch (err) {
      console.error('failed to fetch notifications', err?.response?.data || err.message || err);
    }
  };

  // Polling every 15s — only when user is authenticated
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    fetchNotifications();
    const id = setInterval(fetchNotifications, 15000);
    return () => clearInterval(id);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // LOGOUT HANDLER BARU
  const handleLogout = async () => {
    try {
      // Call context logout which clears token and user
      await logout();
    } catch (e) {
      console.error('Logout error', e);
    }

    // Close menus
    setShowProfileMenu(false);
    setIsMobileMenuOpen(false);

    // Navigate to signin
    navigate('/signin');
  };
  // END LOGOUT HANDLER

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      // removed store dropdown click-outside handling (single button UX)
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search categories
  const searchCategories = {
    RECENT: 'recent',
    POPULAR: 'popular',
    RESTAURANT: 'restaurant',
    MENU: 'menu',
    CATEGORY: 'category'
  };

  // Search function calling backend /api/search
  const fetchSearchResults = async (query) => {
    const q = (query || '').trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    // check in-memory cache first
    if (cacheRef.current[q]) {
      setSearchResults(cacheRef.current[q]);
      return;
    }

    setIsLoading(true);
    try {
      const resp = await api.get('/search', { params: { q, type: 'all' } });
      const payload = resp?.data?.data || resp?.data || null;
      const unified = (payload && Array.isArray(payload.results)) ? normalizeResultList(payload.results) : [];
      cacheRef.current[q] = unified;
      setSearchResults(unified);
    } catch (error) {
      console.error('Search error:', error?.response?.data || error.message || error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        fetchSearchResults(query);
      } else {
        setSearchResults([]);
      }
    }, 250),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(true);
    debouncedSearch(query);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsMobileSearchOpen(false); 
      // Arahkan ke halaman hasil pencarian
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`); 
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (result) => {
    setShowSuggestions(false);
    setSearchQuery("");
    setIsMobileSearchOpen(false);

    // Per spec: navigate to unified search results page with query and type
    const type = result.type || 'all';
    const q = result.name || '';
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`);
    } else {
      navigate('/search');
    }
  };

  // Mark notification as read (backend + update local state)
  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('markAsRead failed', err?.response?.data || err.message || err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('markAllAsRead failed', err?.response?.data || err.message || err);
    }
  };

  // Render suggestion item
  const renderSuggestionItem = (result) => {
    const iconMap = {
        'restaurant': <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
        'menu': <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        'category': <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    };

    return (
        <button
            key={result.id}
            onClick={() => handleSuggestionClick(result)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150"
        >
            <div className="flex-shrink-0">
                {iconMap[result.type]}
            </div>

            <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{result.name}</div>
                {result.description && (
                    <div className="text-sm text-gray-500">{result.description}</div>
                )}
                {result.type === 'category' && (
                    <div className="text-sm text-gray-500">{result.count} menu</div>
                )}
            </div>
            
            {result.rating && (
                <div className="flex items-center gap-1 text-yellow-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">{result.rating}</span>
                </div>
            )}
        </button>
    );
  };

  return (
    <>
      {/* Mobile Search Experience */}
      <div 
        className={`fixed inset-0 z-[60] transition-all duration-300 ${
          isMobileSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileSearchOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileSearchOpen(false)}
        />

        <div 
          className={`absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-lg transform transition-all duration-300 ease-out-expo ${
            isMobileSearchOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="w-8" />
            <h2 className="text-lg font-semibold text-gray-800">Pencarian</h2>
            <button 
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center">
            <div className="w-10 h-1 bg-gray-200 rounded-full my-1" />
          </div>

          {/* Search Input Area (Mobile) - DIPERBAIKI */}
          <form onSubmit={handleSearchSubmit}> 
            <div className="px-4 pt-2 pb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery} // Mengikat ke state
                  onChange={handleSearchChange} // Mengikat ke handler
                  placeholder="Cari makanan sehat..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-100 text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
                  autoFocus
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form> 

          {/* Quick Access Section */}
          <div className="px-4 pb-6 max-h-[50vh] overflow-y-auto">
            
            {/* Show Results/Suggestions (Mobile) */}
            {isLoading && searchQuery && <div className="p-4 text-center text-gray-500">Mencari "{searchQuery}"...</div>}
            
            {!isLoading && searchResults.length > 0 && searchQuery && (
                <div className="space-y-2">
                    {searchResults.map(renderSuggestionItem)}
                </div>
            )}

            {!isLoading && searchResults.length === 0 && searchQuery && (
                <div className="p-4 text-center text-gray-500">Tidak ada hasil untuk "{searchQuery}"</div>
            )}

            {/* Quick Access Categories (Jika tidak ada query) */}
            {(!searchQuery || searchResults.length === 0) && (
              <>
                <div className="mb-6 border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500">Pencarian Terakhir</h3>
                    <button className="text-sm text-green-600 hover:text-green-700 font-medium">Hapus</button>
                  </div>
                  <div className="space-y-2">
                    {/* Mock recent searches (as buttons to handleSuggestionClick) */}
                    <button onClick={() => handleSuggestionClick({ type: 'menu', name: 'Nasi Goreng Sehat', id: '4' })} className="flex items-center w-full px-3 py-2 hover:bg-gray-50 rounded-lg group transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-green-500 mr-3 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600 group-hover:text-gray-900">Nasi Goreng Sehat</span>
                    </button>
                    <button onClick={() => handleSuggestionClick({ type: 'menu', name: 'Salad Bowl', id: '2' })} className="flex items-center w-full px-3 py-2 hover:bg-gray-50 rounded-lg group transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-green-500 mr-3 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600 group-hover:text-gray-900">Salad Bowl</span>
                    </button>
                  </div>
                </div>
            
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Trending Hari Ini</h3>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleSuggestionClick({ type: 'category', name: 'Rendah Kalori' })} className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors duration-200">
                      🥗 Healthy Bowl
                    </button>
                    <button onClick={() => handleSuggestionClick({ type: 'category', name: 'Vegetarian' })} className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors duration-200">
                      🥑 Avocado Toast
                    </button>
                    <button onClick={() => handleSuggestionClick({ type: 'category', name: 'Smoothies' })} className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors duration-200">
                      🥤 Smoothies
                    </button>
                    <button onClick={() => handleSuggestionClick({ type: 'category', name: 'Tinggi Protein' })} className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors duration-200">
                      🍜 Mie Sehat
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300 ${
        isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`} onClick={() => setIsMobileMenuOpen(false)}>
        <div 
          className={`fixed inset-y-0 right-0 w-[280px] bg-white shadow-xl transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info Mobile */}
            <div className="mb-6 p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <img 
                  src={avatarUrl} 
                  alt={displayName}
                  className="w-12 h-12 rounded-full ring-2 ring-green-500"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{displayName}</h4>
                  <p className="text-sm text-gray-500 truncate">{displayEmail}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                onClick={() => { setIsMobileMenuOpen(false); navigate('/profile'); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Profil Saya</span>
              </button>

              {/* Mobile: single adaptive button for store actions */}
              <div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (isStoreMember) navigate('/my-store');
                    else navigate('/register-store');
                  }}
                  className="flex items-center justify-between w-full gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium">{isStoreMember ? 'Kelola Toko' : 'Daftarkan Toko'}</span>
                  </div>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Mobile: Settings link */}
              <button
                type="button"
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                onClick={() => { setIsMobileMenuOpen(false); navigate('/settings'); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Pengaturan</span>
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-white shadow-lg"
            : "bg-gradient-to-r from-green-500 via-green-600 to-green-500 shadow-md"
        }`}
      >
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:max-w-[1400px] xl:mx-auto">
          <div
            className={`flex items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6 transition-all duration-300 ${
              isScrolled 
                ? "py-2 sm:py-2.5 md:py-3"
                : "py-3 sm:py-4 md:py-5 lg:py-6"
            }`}
          >
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2 sm:gap-3 md:gap-4 group cursor-pointer"
              >
                <div className={`relative transition-all duration-300 ${
                  isScrolled 
                    ? "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
                    : "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12"
                }`}>
                  <div className={`w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden p-1 ${
                    isScrolled ? "ring-1 ring-green-500" : "ring-1 ring-white/90"
                  }`}>
                    <img 
                      src="/logo-RasoSehat.png"
                      alt="RasoSehat"
                      className="w-full h-full object-contain transform scale-125 transition-transform duration-300"
                    />
                  </div>
                </div>

                <span className={`font-bold transition-all duration-300 ${
                  isScrolled 
                    ? "text-gray-800 text-lg sm:text-xl md:text-2xl"
                    : "text-white text-xl sm:text-2xl md:text-3xl"
                }`}>
                  RasoSehat
                </span>
              </Link>
            </div>

            {/* Search Bar - Desktop Only */}
            <div className="hidden md:flex flex-1 justify-center min-w-0 max-w-[800px]" ref={searchContainerRef}>
              <form 
                onSubmit={handleSearchSubmit}
                className="w-full relative"
              >
                <div
                  className={`flex items-center w-full transition-all duration-300 ${
                    isScrolled 
                      ? "bg-white/95 backdrop-blur-sm"
                      : "bg-white/90 backdrop-blur-md"
                  } ${
                    isSearchFocused 
                      ? "shadow-lg ring-2 ring-green-400 rounded-xl scale-[1.02]"
                      : "shadow-md hover:shadow-lg rounded-lg hover:scale-[1.01]"
                  } group`}
                >
                  <div className={`flex-shrink-0 pl-4 pr-2 transition-all duration-300`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transition-all duration-300 ${
                        isSearchFocused
                          ? "text-green-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      } ${
                        isScrolled
                          ? "h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5"
                          : "h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                      />
                    </svg>
                  </div>
                  
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Cari makanan sehat di sekitar Anda..."
                    className={`flex-1 min-w-0 focus:outline-none bg-transparent transition-all duration-300 ${
                      isSearchFocused ? "text-gray-800" : "text-gray-600"
                    } placeholder-gray-400 ${
                      isScrolled 
                        ? "px-2 py-2.5 text-sm"
                        : "px-2 py-3 text-base"
                    }`}
                    onFocus={() => {
                      setIsSearchFocused(true);
                      setShowSuggestions(true);
                    }}
                  />

                  {isLoading && (
                    <div className="flex-shrink-0 mr-2">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`flex-shrink-0 transition-all duration-300 flex items-center gap-2 ${
                      isScrolled 
                        ? "mr-2 px-3 py-1.5 text-sm"
                        : "mr-2 px-4 py-2 text-base"
                    } ${
                      isSearchFocused
                        ? "bg-green-600 hover:bg-green-700 text-white rounded-lg"
                        : "text-gray-500 hover:text-green-600"
                    }`}
                  >
                    {isSearchFocused ? (
                      <>
                        <span>Cari</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    ) : null}
                  </button>
                </div>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (isSearchFocused || searchResults.length > 0) && (
                  <div className="absolute w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {isLoading && searchQuery && (
                      <div className="p-4 text-center text-gray-500">
                        Mencari "{searchQuery}"...
                      </div>
                    )}

                    {!isLoading && searchResults.length === 0 && searchQuery && (
                      <div className="p-4 text-center text-gray-500">
                        Tidak ada hasil untuk "{searchQuery}"
                      </div>
                    )}

                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSuggestionClick(result)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="flex-shrink-0">
                          {result.type === 'restaurant' && (
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                          {result.type === 'menu' && (
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          )}
                          {result.type === 'category' && (
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{result.name}</div>
                          {result.description && (
                            <div className="text-sm text-gray-500">{result.description}</div>
                          )}
                          {result.type === 'category' && (
                            <div className="text-sm text-gray-500">{result.count} menu</div>
                          )}
                        </div>

                        {result.rating && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600">{result.rating}</span>
                          </div>
                        )}
                      </button>
                    ))}

                    {/* Quick Access Categories */}
                    {!searchQuery && (
                      <div className="p-4 border-t border-gray-100">
                        <div className="text-xs font-medium text-gray-500 mb-2">Kategori Populer</div>
                        <div className="flex flex-wrap gap-2">
                          {['Makanan Sehat', 'Low Calories', 'Vegetarian', 'Gluten Free'].map((category) => (
                            <button
                              key={category}
                              onClick={() => handleSuggestionClick({ type: 'category', name: category })}
                              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 rounded-lg transition-colors duration-150"
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              {/* Mobile Search Button */}
              <button 
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden relative p-2 rounded-lg hover:bg-white/10 active:scale-95 transform transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" 
                  className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </button>

              {/* Store Button - Desktop: single adaptive button (no dropdown) */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => {
                    if (isStoreMember) navigate('/my-store');
                    else navigate('/register-store');
                  }}
                  className={`hidden md:flex items-center gap-2 relative overflow-hidden transition-all duration-300 font-semibold whitespace-nowrap rounded-lg px-3 md:px-4 py-2 text-sm ${
                    isScrolled ? 'bg-white text-green-600 hover:shadow-md border border-green-200' : 'bg-white/90 backdrop-blur-sm text-green-600 hover:shadow-lg'
                  }`}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-lg">
                    <span className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/5 transition-colors duration-200" />
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`${isScrolled ? 'w-4 h-4' : 'w-5 h-5'} transition-all duration-300 relative z-10`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="relative z-10">{isStoreMember ? 'Kelola Toko' : 'Daftarkan Toko'}</span>
                </button>
              </div>

              {/* Notification Button - Desktop */}
              <div className="hidden md:block relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
                    isScrolled 
                      ? "hover:bg-gray-100 text-gray-700"
                      : "hover:bg-white/10 text-white"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`${isScrolled ? 'w-6 h-6' : 'w-6 h-6'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-slideDown">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100">
                      <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                      <button 
                        onClick={markAllAsRead}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Tandai Semua Dibaca
                      </button>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-sm">Tidak ada notifikasi</p>
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          // choose icon and color based on type
                          const type = (notification.type || '').toLowerCase();
                          let Icon = (
                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20h.01" />
                            </svg>
                          );
                          let bg = '';
                          if (type === 'success' || (notification.data && notification.data.status === 'disetujui')) {
                            Icon = (
                              <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            );
                            bg = 'bg-green-50/40';
                          } else if (type === 'warning' || (notification.data && notification.data.status === 'ditolak')) {
                            Icon = (
                              <svg className="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l.94 4.56a1 1 0 00.98.78h4.8c.89 0 1.26 1.08.54 1.54L13.5 16.5a1 1 0 00-.36 1.1l1.2 3.6" />
                              </svg>
                            );
                            bg = 'bg-yellow-50/40';
                          } else {
                            Icon = (
                              <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20h.01" />
                              </svg>
                            );
                          }

                          return (
                            <button
                              key={notification.id}
                              onClick={() => {
                                // navigate to detail page and mark as read
                                setShowNotifications(false);
                                navigate(`/notifications/${notification.id}`);
                                markAsRead(notification.id);
                              }}
                              className={`w-full p-3 text-left hover:bg-gray-50 transition-colors duration-150 border-b border-gray-50 ${!notification.is_read ? 'ring-1 ring-green-200' : ''}`}
                            >
                              <div className="flex gap-3 items-start">
                                <div className={`flex-shrink-0 p-2 rounded-full ${bg}`}>
                                  {Icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {notification.title}
                                    </h4>
                                    <div className="text-xs text-gray-400 whitespace-nowrap">{notification.created_at ? new Date(notification.created_at).toLocaleString() : (notification.time || '')}</div>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                    
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                      <Link
                        to="/notifications"
                        className="block text-center text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Lihat Semua Notifikasi
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Button - Desktop */}
              <div className="hidden md:block relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg transition-all duration-300 ${
                    isScrolled 
                      ? "hover:bg-gray-100"
                      : "hover:bg-white/10"
                  }`}
                >
                  <img 
                    src={avatarUrl} 
                    alt={displayName}
                    className={`rounded-full ring-2 transition-all duration-300 ${
                      isScrolled 
                        ? "w-8 h-8 ring-green-500"
                        : "w-9 h-9 ring-white"
                    }`}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''} ${isScrolled ? 'text-gray-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-slideDown">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
                      <div className="flex items-center gap-3">
                          <img 
                          src={avatarUrl} 
                          alt={displayName}
                          className="w-12 h-12 rounded-full ring-2 ring-green-500"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{displayName}</h4>
                          <p className="text-sm text-gray-500 truncate">{displayEmail}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        type="button"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">Profil Saya</span>
                      </button>

                      <button
                        type="button"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Pengaturan</span>
                      </button>


                    </div>

                    <div className="border-t border-gray-100 py-2">
                      <button
                        className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors duration-150 w-full"
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
}