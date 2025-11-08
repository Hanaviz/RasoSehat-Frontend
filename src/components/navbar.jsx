import React, { useState, useEffect } from 'react';

export default function EnhancedNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg' 
          : 'bg-gradient-to-r from-green-500 via-green-600 to-green-500 shadow-md'
      }`}>
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:max-w-[1400px] xl:mx-auto">
          <div className={`flex items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6 transition-all duration-300 ${
            isScrolled 
              ? 'py-2 sm:py-2.5 md:py-3' 
              : 'py-3 sm:py-4 md:py-5 lg:py-6'
          }`}>
            {/* Kiri: Logo */}
            <div className="flex items-center flex-shrink-0">
              <a className="flex items-center gap-1.5 sm:gap-2 md:gap-3 group cursor-pointer">
                <div className={`relative transition-all duration-300 ${
                  isScrolled 
                    ? 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9' 
                    : 'w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12'
                }`}>
                  <div className={`absolute inset-0 rounded-full blur transition-all duration-300 ${
                    isScrolled 
                      ? 'bg-green-300 opacity-0' 
                      : 'bg-green-300 opacity-50 group-hover:opacity-70'
                  }`}></div>
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className={`relative w-full h-full object-contain transition-transform duration-300 ${
                      isScrolled ? '' : 'group-hover:scale-110'
                    }`}
                  />
                </div>
                <span className={`font-bold tracking-tight transition-all duration-300 hidden xs:block ${
                  isScrolled 
                    ? 'text-green-600 text-base sm:text-lg md:text-xl' 
                    : 'text-white text-lg sm:text-xl md:text-2xl lg:text-3xl drop-shadow-sm'
                }`}>
                  RasaSehat
                </span>
              </a>
            </div>

            {/* Tengah: Search Bar */}
            <div className="flex-1 flex justify-center min-w-0 max-w-[500px] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px]">
              <div className={`flex items-center w-full bg-white rounded-sm transition-all duration-300 ${
                isScrolled 
                  ? 'shadow-md' 
                  : 'shadow-lg'
              } ${
                isSearchFocused 
                  ? 'ring-2 ring-green-400' 
                  : 'border border-green-600'
              }`}>
                <input
                  type="text"
                  placeholder="Cari makanan sehat"
                  className={`flex-1 min-w-0 text-gray-700 focus:outline-none bg-transparent transition-all duration-300 ${
                    isScrolled 
                      ? 'px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm' 
                      : 'px-2 sm:px-3 md:px-4 lg:px-5 py-2 sm:py-2.5 md:py-3 lg:py-3.5 text-xs sm:text-sm md:text-base'
                  }`}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                <button className={`flex-shrink-0 transition-all duration-300 flex items-center justify-center ${
                  isScrolled 
                    ? 'bg-green-600 hover:bg-green-700 px-2.5 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2' 
                    : 'bg-green-600 hover:bg-green-700 px-3 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-3.5'
                }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`text-white transition-all duration-300 ${
                      isScrolled 
                        ? 'h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5' 
                        : 'h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Kanan: Filter Icon & Tombol Masuk & Daftar */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
              {/* Filter Button */}
              <button className={`hidden md:flex items-center justify-center transition-all duration-300 rounded-sm ${
                isScrolled 
                  ? 'text-gray-500 hover:text-green-600 hover:bg-green-50 p-1.5 md:p-2' 
                  : 'text-white hover:bg-white hover:text-green-600 p-2 md:p-2.5'
              }`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-all duration-300 ${
                    isScrolled ? 'h-4 w-4 md:h-5 md:w-5' : 'h-5 w-5 md:h-6 md:w-6'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
              </button>

              {/* Tombol Masuk */}
              <button className={`transition-all duration-300 rounded-sm font-semibold whitespace-nowrap ${
                isScrolled 
                  ? 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-600 hover:text-white hover:shadow-md px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm' 
                  : 'bg-white text-green-600 hover:bg-green-50 hover:shadow-lg hover:scale-105 px-2.5 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm md:text-base'
              }`}>
                <span className="hidden xs:inline">Masuk</span>
                <span className="xs:hidden">Login</span>
              </button>

              {/* Tombol Daftar */}
              <button className={`transition-all duration-300 rounded-sm font-semibold whitespace-nowrap ${
                isScrolled 
                  ? 'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white hover:shadow-md px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm' 
                  : 'border-2 border-white text-white hover:bg-white hover:text-green-600 hover:shadow-lg hover:scale-105 px-2.5 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm md:text-base'
              }`}>
                Daftar
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}