import React, { useState, useEffect } from 'react';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [location, setLocation] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Hero carousel images data
  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&h=1080&fit=crop',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&h=1080&fit=crop',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&h=1080&fit=crop',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1920&h=1080&fit=crop',
    }
  ];

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleExplore = () => {
    if (location.trim()) {
      // Handle location exploration logic here
      console.log('Exploring location:', location);
    }
  };

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white pb-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Hero Carousel */}
        <div className="relative mb-24">
          <div className="relative rounded-2xl overflow-hidden shadow-xl group">
          <div className="relative h-72 sm:h-[360px] md:h-[420px] lg:h-[480px] overflow-hidden">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? 'opacity-100 translate-x-0'
                    : index < currentSlide
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                }`}
              >
                <img
                  src={slide.image}
                  alt={`Slide ${slide.id}`}
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            ))}
          </div>

          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white w-6 sm:w-8 h-2'
                    : 'bg-white/50 hover:bg-white/75 w-2 h-2'
                }`}
              />
            ))}
            </div>
          </div>

          {/* Standalone Location Chooser (flow, not absolute) */}
          <div className="max-w-md mx-auto px-4 -mt-12 mb-12 relative z-10">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">
                Choose Your Location
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your location"
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  onKeyPress={(e) => e.key === 'Enter' && handleExplore()}
                />
                <button
                  onClick={handleExplore}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base whitespace-nowrap shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  Explore
                </button>
              </div>
            </div>
          </div>
        </div>

  {/* Categories Section */}
  <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6 -mt-8 border-2 border-green-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">Kategori</h2>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
            {[
              { name: 'Rendah Gula', icon: '🍯' },
              { name: 'Rendah Kalori', icon: '🥒' },
              { name: 'Rendah Lemak Jenuh', icon: '🥑' },
              { name: 'Tinggi Protein', icon: '🥤' },
              { name: 'Seimbang', icon: '🍽️' },
              { name: 'Kids Friendly', icon: '🧸' },
              { name: 'Vegetarian / Vegan', icon: '🥦' },
              { name: 'Lainnya', icon: '📦' }
            ].map((category, index) => (
              <button
                key={index}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-3 sm:p-4 transition-all hover:shadow-lg hover:scale-105 group"
              >
                <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
          <div className="text-center mt-4">
            <button className="text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base hover:underline">
              Show More
            </button>
          </div>
        </div>

        {/* Featured Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Temukan makanan sehat terbaik di Padang!
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            Nikmati pilihan kuliner sehat, bergizi, dan dekat dengan lokasi Anda.
          </p>
        </div>

        {/* Food Cards Section */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-green-600">Rendah kalori</h2>
            <button className="text-green-600 hover:text-green-700 p-2 rounded-full hover:bg-green-50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400&h=300&fit=crop"
                  alt="Green Goddess Smoothie"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Smoothie
                </div>
                <div className="absolute top-2 right-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                  Buka
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">Green Goddess Smoothie</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  Smoothie hijau dengan bayam, pisang, alpukat, dan protein powder
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-600 font-bold text-sm sm:text-base">Rp 18.000</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                    <span className="text-xs font-semibold text-gray-700">4.6</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                  </svg>
                  <span>Fresh Juice Bar, Mdn</span>
                  <span>•</span>
                  <span>0.8 km</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                  </svg>
                  <span>5-10 menit</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
                  alt="Selamat Datang"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                  Buka
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">Selamat Datang</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  Menu spesial dengan bahan-bahan segar dan berkualitas
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>15-20 menit</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop"
                  alt="Rainbow Buddha Bowl"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Salad
                </div>
                <div className="absolute top-2 right-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                  Buka
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">Rainbow Buddha Bowl</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  Bowl sehati dengan quinoa, sayuran, alpukat, dan tahini dressing
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-600 font-bold text-sm sm:text-base">Rp 25.000</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                    <span className="text-xs font-semibold text-gray-700">4.8</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                  </svg>
                  <span>Healthy Corner, Limau Manih</span>
                  <span>•</span>
                  <span>0.5 km</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                  </svg>
                  <span>15-20 menit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}