import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function EnhancedNavbarLoggedIn() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsNotificationOpen(false);
      setIsUserMenuOpen(false);
    };
    
    if (isNotificationOpen || isUserMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isNotificationOpen, isUserMenuOpen]);

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

          <div className="px-4 pb-6">
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
            
            {/* Mobile Menu Items */}
            <div className="space-y-3">
              <Link
                to="/toko"
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">Toko</span>
              </Link>
              
              <Link
                to="/profile"
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Profil</span>
              </Link>
              
              <Link
                to="/notifications"
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="font-medium">Notifikasi</span>
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">3</span>
              </Link>
              
              <div className="border-t border-gray-200 my-4"></div>
              
              <button
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  // Handle logout
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
            <div className="hidden md:flex flex-1 justify-center min-w-0 max-w-[800px]">
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
                  placeholder="Cari makanan sehat di sekitar Anda..."
                  className={`flex-1 min-w-0 focus:outline-none bg-transparent transition-all duration-300 ${
                    isSearchFocused ? "text-gray-800" : "text-gray-600"
                  } placeholder-gray-400 ${
                    isScrolled
                      ? "px-2 py-2.5 text-sm"
                      : "px-2 py-3 text-base"
                  }`}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />

                <button
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
            </div>

            {/* Right Side Actions */}
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

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-2 md:gap-3">
                {/* Tombol Toko */}
                <Link
                  to="/toko"
                  className={`group relative overflow-hidden transition-all duration-300 font-semibold whitespace-nowrap rounded-lg ${
                    isScrolled
                      ? "bg-white text-green-600 px-3.5 md:px-4.5 py-1.5 text-sm hover:shadow-md ring-1 ring-green-600"
                      : "bg-white/90 backdrop-blur-sm text-green-600 px-4 md:px-5 py-2 text-sm md:text-base hover:shadow-lg"
                  }`}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-lg">
                    <span className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/5 transition-colors duration-200"></span>
                  </span>
                  
                  <span className="relative z-10 transition-all duration-300 inline-flex items-center gap-2 group-active:scale-95">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`${isScrolled ? 'w-4 h-4' : 'w-5 h-5'} transition-all duration-300`} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Toko</span>
                  </span>
                </Link>

                {/* Tombol User */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(!isUserMenuOpen);
                      setIsNotificationOpen(false);
                    }}
                    className={`group relative overflow-hidden transition-all duration-300 rounded-lg p-2 ${
                      isScrolled
                        ? "bg-white hover:bg-gray-100"
                        : "bg-white/90 backdrop-blur-sm hover:bg-white"
                    }`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`${isScrolled ? 'w-5 h-5' : 'w-6 h-6'} text-green-600 transition-all duration-300`} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">John Doe</p>
                        <p className="text-xs text-gray-500">john@example.com</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profil Saya
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Pengaturan
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />