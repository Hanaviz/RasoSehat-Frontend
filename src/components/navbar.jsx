import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import debounce from 'lodash/debounce';

export default function EnhancedNavbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const
     handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulated search results categories for demo
  const searchCategories = {
    RECENT: 'recent',
    POPULAR: 'popular',
    RESTAURANT: 'restaurant',
    MENU: 'menu',
    CATEGORY: 'category'
  };

  // Mock search function - replace with actual API call
  const fetchSearchResults = async (query) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock results - replace with actual API data
      const results = [
        {
          id: 1,
          type: searchCategories.RESTAURANT,
          name: "Healthy Corner",
          description: "Restoran Sehat",
          rating: 4.8,
          image: "https://example.com/image1.jpg",
          highlight: query ? [...query.matchAll(new RegExp(query, 'gi'))] : []
        },
        {
          id: 2,
          type: searchCategories.MENU,
          name: "Buddha Bowl",
          description: "Bowl Sayur Organik",
          price: "25.000",
          image: "https://example.com/image2.jpg",
          highlight: query ? [...query.matchAll(new RegExp(query, 'gi'))] : []
        },
        {
          id: 3,
          type: searchCategories.CATEGORY,
          name: "Makanan Sehat",
          count: 150,
          highlight: query ? [...query.matchAll(new RegExp(query, 'gi'))] : []
        }
      ];
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
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
    }, 300),
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
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (result) => {
    setShowSuggestions(false);
    setSearchQuery("");
    
    switch (result.type) {
      case searchCategories.RESTAURANT:
        navigate(`/restaurant/${result.id}`);
        break;
      case searchCategories.MENU:
        navigate(`/menu/${result.id}`);
        break;
      case searchCategories.CATEGORY:
        navigate(`/category/${result.name.toLowerCase()}`);
        break;
      default:
        navigate(`/search?q=${encodeURIComponent(result.name)}`);
    }
  };

  return (
    <>
      {/* Mobile Search Experience */}
      <div 
        className={`fixed inset-0 z-[60] transition-all duration-300 ${
          isMobileSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop with blur */}
        <div 
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileSearchOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileSearchOpen(false)}
        />

        {/* Search Panel - Slides from bottom for better thumb reach */}
        <div 
          className={`absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-lg transform transition-all duration-300 ease-out-expo ${
            isMobileSearchOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Search Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="w-8" /> {/* Spacer untuk centering */}
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

          {/* Drag Indicator */}
          <div className="flex justify-center">
            <div className="w-10 h-1 bg-gray-200 rounded-full my-1" />
          </div>

          {/* Search Input Area */}
          <div className="px-4 pt-2 pb-4">
            <div className="relative">
              <input
                type="text"
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

          {/* Quick Access Section */}
          <div className="px-4 pb-6">
            {/* Recent Searches */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Pencarian Terakhir</h3>
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">Hapus</button>
              </div>
              <div className="space-y-2">
                <button className="flex items-center w-full px-3 py-2 hover:bg-gray-50 rounded-lg group transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-green-500 mr-3 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600 group-hover:text-gray-900">Nasi Goreng Sehat</span>
                </button>
                <button className="flex items-center w-full px-3 py-2 hover:bg-gray-50 rounded-lg group transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-green-500 mr-3 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600 group-hover:text-gray-900">Salad Bowl</span>
                </button>
              </div>
            </div>

            {/* Trending Searches */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Trending Hari Ini</h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors duration-200">
                  🥗 Healthy Bowl
                </button>
                <button className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors duration-200">
                  🥑 Avocado Toast
                </button>
                <button className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors duration-200">
                  🥤 Smoothies
                </button>
                <button className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors duration-200">
                  🍜 Mie Sehat
                </button>
              </div>
            </div>
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
            <div className="space-y-4">
              <Link
                to="/signin"
                className="block w-full px-4 py-3 text-center font-semibold text-green-600 bg-white border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Masuk
              </Link>
              <Link
                to="/signup"
                className="block w-full px-4 py-3 text-center font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Daftar
              </Link>
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
            {/* 🔹 Kiri: Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2 sm:gap-3 md:gap-4 group cursor-pointer"
              >
                {/* Logo Circle */}
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

                {/* Brand Text */}
                <span className={`font-bold transition-all duration-300 ${
                  isScrolled 
                    ? "text-gray-800 text-lg sm:text-xl md:text-2xl"
                    : "text-white text-xl sm:text-2xl md:text-3xl"
                }`}>
                  RasoSehat
                </span>
              </Link>
            </div>

            {/* 🔹 Tengah: Search Bar - Desktop Only */}
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
                  {/* Search Icon Left */}
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
                  
                  {/* Input Field */}
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

                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="flex-shrink-0 mr-2">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Search Button */}
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
                        {/* Icon based on type */}
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

                        {/* Result Content */}
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{result.name}</div>
                          {result.description && (
                            <div className="text-sm text-gray-500">{result.description}</div>
                          )}
                          {result.type === 'category' && (
                            <div className="text-sm text-gray-500">{result.count} menu</div>
                          )}
                        </div>

                        {/* Additional Info */}
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

            {/* 🔹 Kanan: Mobile Actions & Desktop Auth */}
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
                <span className={`absolute -right-1 -top-1 w-2 h-2 rounded-full ${isScrolled ? 'bg-green-500' : 'bg-white'} animate-ping`}></span>
                <span className={`absolute -right-1 -top-1 w-2 h-2 rounded-full ${isScrolled ? 'bg-green-500' : 'bg-white'}`}></span>
              </button>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-2 md:gap-3">
              {/* Tombol Masuk */}
              <Link
                to="/signin"
                className={`group relative overflow-hidden transition-all duration-300 font-semibold whitespace-nowrap rounded-lg ${
                isScrolled 
                    ? "bg-white text-green-600 px-3.5 md:px-4.5 py-1.5 text-sm hover:shadow-md"
                    : "bg-white/90 backdrop-blur-sm text-green-600 px-4 md:px-5 py-2 text-sm md:text-base hover:shadow-lg"
                }`}
              >
                {/* Ripple effect container */}
                <span className="absolute inset-0 overflow-hidden rounded-lg">
                  <span className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/5 transition-colors duration-200"></span>
                  <span className="absolute -left-[100%] top-1/2 h-[200%] w-[200%] -translate-y-1/2 rounded-[50%] bg-green-500/10 transition-all duration-500 group-active:left-1/2 group-active:opacity-50"></span>
                </span>
                
                {/* Content container */}
                <span className="relative z-10 transition-all duration-300 inline-flex items-center gap-2 group-active:scale-95">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                    className={`${isScrolled ? 'w-4 h-4' : 'w-5 h-5'} transition-all duration-300 group-hover:rotate-12 group-active:rotate-[18deg]`} 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                  <span className="relative overflow-hidden">
                    Masuk
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full group-active:h-[2px] ${
                      isScrolled ? 'opacity-70' : 'opacity-60'
                    }`}></span>
                  </span>
                </span>
              </Link>

              {/* Tombol Daftar */}
              <Link
                to="/signup"
                className={`group relative overflow-hidden transition-all duration-300 font-semibold whitespace-nowrap rounded-lg ${
                isScrolled 
                    ? "bg-green-600 text-white px-3.5 md:px-4.5 py-1.5 text-sm hover:shadow-md"
                    : "bg-green-600/90 backdrop-blur-sm text-white px-4 md:px-5 py-2 text-sm md:text-base hover:shadow-lg"
                }`}
              >
                {/* Ripple effect container */}
                <span className="absolute inset-0 overflow-hidden rounded-lg">
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200"></span>
                  <span className="absolute -left-[100%] top-1/2 h-[200%] w-[200%] -translate-y-1/2 rounded-[50%] bg-white/20 transition-all duration-500 group-active:left-1/2 group-active:opacity-50"></span>
                </span>

                {/* Content container */}
                <span className="relative z-10 transition-all duration-300 inline-flex items-center gap-2 group-active:scale-95">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`${isScrolled ? 'w-4 h-4' : 'w-5 h-5'} transition-all duration-300 group-hover:rotate-12 group-active:rotate-[18deg]`} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l1.5-3m0 0l1.5 3m-3 0h3" />
                  </svg>
                  <span className="relative overflow-hidden">
                Daftar
                    <span className={`absolute -bottom-0.5 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full group-active:h-[2px] ${
                      isScrolled ? 'opacity-70' : 'opacity-60'
                    }`}></span>
                  </span>
                </span>
              </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}