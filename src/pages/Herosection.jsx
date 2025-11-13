import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 👈 Import Link dan useNavigate
import { motion, AnimatePresence } from 'framer-motion';
import { LocateFixed } from 'lucide-react'; // 👈 Import ikon Lokasi

export default function HeroSection() {
  const navigate = useNavigate(); // 👈 Gunakan useNavigate
  const [currentSlide, setCurrentSlide] = useState(0);
  const [location, setLocation] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Data kategori lengkap
  const allCategories = [
    { name: 'Rendah Gula', icon: '🍯' },
    { name: 'Rendah Kalori', icon: '🥒' },
    { name: 'Rendah Lemak Jenuh', icon: '🥑' },
    { name: 'Tinggi Protein', icon: '🥤' },
    { name: 'Seimbang', icon: '🍽️' },
    { name: 'Kids Friendly', icon: '🧸' },
    { name: 'Vegetarian / Vegan', icon: '🥦' },
    { name: 'Lainnya', icon: '📦' },
    { name: 'Paleo', icon: '🥩' },
    { name: 'Gluten Free', icon: '🌾' },
    { name: 'Organik', icon: '🥬' },
    { name: 'Smoothie Bowl', icon: '🥣' },
  ];

  // Tampilkan hanya 8 kategori pertama di awal, atau semua jika showAllCategories
  const displayedCategories = showAllCategories ? allCategories : allCategories.slice(0, 8);

  // Hero carousel images data
  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&h=1080&fit=crop',
      slogan: "Padang Penuh Rasa, Tetap Sehat Selalu.",
      subtext: "Temukan pilihan menu rendah kolesterol dan tinggi gizi tanpa mengorbankan kelezatan.",
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&h=1080&fit=crop',
      slogan: "Diet Sehat Jadi Mudah, Dekat dari Kampus Anda.",
      subtext: "Panduan lokasi makanan sehat terdekat, ideal untuk gaya hidup mahasiswa.",
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&h=1080&fit=crop',
      slogan: "Atasi Kolesterol Tinggi, Mulai Hidup Sehat Hari Ini.",
      subtext: "Lihat data nutrisi terverifikasi untuk setiap menu dan restoran.",
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1920&h=1080&fit=crop',
      slogan: "Tinggi Protein, Rendah Gula. Pilihan Tepat untuk Semua Diet.",
      subtext: "Saring menu berdasarkan Rendah Kalori, Keto, Vegan, dan kebutuhan Anda.",
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

  // Fungsi untuk membuat slug yang valid
  const createSlug = (name) => name.toLowerCase().replace(/\s/g, '-').replace(/[^\w-]+/g, '');

  // LOGIC UNTUK LOCATION CHOOSER
  const handleExplore = () => {
    if (location.trim()) {
      // Arahkan ke halaman search dengan query parameter 'loc'
      navigate(`/search?loc=${encodeURIComponent(location.trim())}`);
    }
  };

  const handleGetCurrentLocation = () => {
    // Simulasi pengambilan lokasi dari browser (Frontend only)
    // Di aplikasi nyata: Navigator.geolocation.getCurrentPosition(...)
    setLocation("Limau Manih, Padang"); 
  };
  // END LOGIC LOCATION CHOOSER

  // GOOGLE MAPS INTEGRATION
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapError, setMapError] = useState('');

  // Inisialisasi peta Google Maps
  useEffect(() => {
    if (showMapModal && mapRef.current && !mapInstanceRef.current) {
      // Tunggu sampai Google Maps API siap
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          try {
            console.log('Google Maps API loaded, initializing map...');
            const newMap = new window.google.maps.Map(mapRef.current, {
              zoom: 13,
              center: { lat: -0.9471, lng: 100.4172 }, // Pusat Padang
              mapTypeId: 'roadmap'
            });

            // Set koordinat awal (so button is enabled by default)
            const initialCoords = { lat: -0.9471, lng: 100.4172 };
            setSelectedCoords(initialCoords);
            console.log('Initial coordinates set:', initialCoords);

            // Buat marker awal di tengah peta
            const marker = new window.google.maps.Marker({
              position: initialCoords,
              map: newMap,
              draggable: true,
              title: 'Pilih Lokasi Anda'
            });

            // Event saat peta diklik
            newMap.addListener('click', (e) => {
              const clickedLat = e.latLng.lat();
              const clickedLng = e.latLng.lng();
              const newCoords = { lat: clickedLat, lng: clickedLng };
              console.log('Map clicked, new coords:', newCoords);
              marker.setPosition(e.latLng);
              setSelectedCoords(newCoords);
            });

            // Event saat marker di-drag
            marker.addListener('dragend', () => {
              const markerLat = marker.getPosition().lat();
              const markerLng = marker.getPosition().lng();
              const newCoords = { lat: markerLat, lng: markerLng };
              console.log('Marker dragged, new coords:', newCoords);
              setSelectedCoords(newCoords);
            });

            mapInstanceRef.current = newMap;
            markerRef.current = marker;
            setMapError('');
            console.log('Map initialized successfully!');
          } catch (error) {
            console.error('Error initializing map:', error);
            setMapError('Gagal memuat peta. Periksa browser console untuk detail.');
          }
        }
      }, 100);

      // Timeout jika API tidak siap dalam 5 detik
      const timeout = setTimeout(() => {
        clearInterval(checkGoogleMaps);
        if (!mapInstanceRef.current) {
          console.warn('Google Maps API timeout - API may not be loaded');
          setMapError('Google Maps API tidak merespons. Periksa koneksi internet dan API key.');
        }
      }, 5000);

      return () => {
        clearInterval(checkGoogleMaps);
        clearTimeout(timeout);
      };
    }
  }, [showMapModal]);

  // Fungsi untuk menggunakan lokasi dari peta
  const handleUseMapLocation = async () => {
    console.log('handleUseMapLocation called, selectedCoords:', selectedCoords);
    if (selectedCoords) {
      try {
        // Gunakan Geocoding API untuk mendapatkan nama tempat dari koordinat
        const geocoder = new window.google.maps.Geocoder();
        console.log('Geocoding location:', selectedCoords);
        geocoder.geocode({ location: selectedCoords }, (results, status) => {
          console.log('Geocoding result status:', status);
          if (status === 'OK' && results[0]) {
            const locationName = results[0].formatted_address;
            console.log('Location found:', locationName);
            setLocation(locationName);
            setShowMapModal(false);
            // Reset map untuk next time
            mapInstanceRef.current = null;
          } else {
            console.warn('Geocoding failed:', status);
            // Fallback: gunakan koordinat sebagai string
            const coordString = `${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lng.toFixed(4)}`;
            setLocation(coordString);
            setShowMapModal(false);
            mapInstanceRef.current = null;
          }
        });
      } catch (error) {
        console.error('Error geocoding:', error);
        // Fallback jika error
        const coordString = `${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lng.toFixed(4)}`;
        setLocation(coordString);
        setShowMapModal(false);
        mapInstanceRef.current = null;
      }
    } else {
      console.warn('No coordinates selected');
    }
  };

  // Fungsi untuk membuka map modal
  const handleOpenMapModal = () => {
    setShowMapModal(true);
  };

  // Fungsi untuk menutup map modal
  const handleCloseMapModal = () => {
    setShowMapModal(false);
    mapInstanceRef.current = null;
  };
  // END GOOGLE MAPS INTEGRATION

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 bg-gradient-to-b from-green-50 to-white pb-8">
      
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        
        {/* Hero Carousel */}
        <div className="relative mb-16 sm:mb-20 md:mb-24"> {/* Mengurangi mb */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl group">
          
            {/* PENGURANGAN TINGGI CAROUSEL */}
            <div className="relative h-48 sm:h-64 md:h-72 lg:h-80 overflow-hidden"> 
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
                  {/* Overlay untuk teks */}
                  <div className="absolute inset-0 bg-black/40"></div>

                  {/* Slogan Text Overlay */}
                  <motion.div
                    key={slide.id + '-text'} // Kunci unik untuk animasi teks per slide
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 sm:p-8"
                  >
                    {/* SLOGAN UTAMA: Menggunakan font-serif dan font-black */}
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-black text-white leading-tight drop-shadow-lg max-w-2xl">
                      {slide.slogan}
                    </h2>
                    {/* SUBTEKS: Menggunakan font-semibold dan italic */}
                    <p className="mt-2 text-sm sm:text-base font-semibold italic text-green-200 drop-shadow max-w-xl">
                      {slide.subtext}
                    </p>
                  </motion.div>
                  {/* End Slogan Text Overlay */}
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

            {/* Standalone Location Chooser */}
            <div className="max-w-md mx-auto -mt-12 relative z-10">
              <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">
                  Cari Makanan di Sekitar Anda
                </h3>
                {/* Form untuk Chooser Location */}
                <form onSubmit={(e) => { e.preventDefault(); handleExplore(); }}>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onClick={handleOpenMapModal}
                        placeholder="Masukkan Area / Kecamatan"
                        className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base cursor-pointer"
                        readOnly
                      />
                      {/* Tombol GPS untuk lokasi saat ini */}
                      <button 
                          type="button"
                          onClick={handleGetCurrentLocation}
                          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-green-600 transition-colors"
                          title="Gunakan Lokasi Saat Ini"
                      >
                          <LocateFixed className='w-5 h-5'/>
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base whitespace-nowrap shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                      Cari
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Google Maps Modal */}
            <AnimatePresence>
              {showMapModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                  >
                  {/* Header */}
                  <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      Pilih Lokasi dari Peta
                    </h2>
                    <button
                      onClick={handleCloseMapModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Map Container */}
                  <div className="flex-1 overflow-hidden">
                    {mapError ? (
                      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-100">
                        <div className="text-center text-red-600">
                          <p className="font-semibold">{mapError}</p>
                          <p className="text-sm mt-2">Pastikan Anda memiliki API key Google Maps yang valid.</p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        ref={mapRef}
                        className="w-full h-full min-h-[400px]"
                        style={{ minHeight: '400px' }}
                      />
                    )}
                  </div>

                  {/* Footer dengan tombol aksi */}
                  <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                    <button
                      onClick={handleCloseMapModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleUseMapLocation}
                      disabled={!selectedCoords}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
                    >
                      Gunakan Lokasi Ini
                    </button>
                  </div>

                  {/* Info Helper */}
                  {selectedCoords && (
                    <div className="px-4 sm:px-6 py-3 bg-blue-50 text-blue-800 text-sm border-t border-blue-200">
                      ✓ Lokasi dipilih: ({selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)})
                    </div>
                  )}
                </motion.div>
              </div>
              )}
            </AnimatePresence>
          </div>

    {/* Categories Section */}
    <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6 -mt-8 border-2 border-green-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">Kategori</h2>
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
              {displayedCategories.map((category, index) => (
                // DIUBAH DARI BUTTON MENJADI LINK
                <Link 
                  key={index}
                  to={`/category/${createSlug(category.name)}`} // Mengarahkan ke route kategori baru
                  className="flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-3 sm:p-4 transition-all hover:shadow-lg hover:scale-105 group"
                >
                  <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                    {category.name}
                  </span>
                </Link>
                // END LINK
              ))}
            </div>
            <div className="text-center mt-4">
              {!showAllCategories ? (
                <button 
                  onClick={() => setShowAllCategories(true)}
                  className="text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base hover:underline transition-colors"
                >
                  Show More
                </button>
              ) : (
                <button 
                  onClick={() => setShowAllCategories(false)}
                  className="text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base hover:underline transition-colors"
                >
                  Show Less
                </button>
              )}
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
              {/* Card 1 - Green Goddess Smoothie */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group flex flex-col">
                <Link 
                  to="/menu/green-goddess-smoothie"
                  className="block"
                >
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
                    <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base group-hover:text-green-600 transition-colors">Green Goddess Smoothie</h3>
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
                      <span>0.8 km</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                      </svg>
                      <span>5-10 menit</span>
                    </div>
                  </div>
                </Link>
                {/* Restaurant Name Link */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 mt-auto">
                  <Link 
                    to="/restaurant/healthy-corner"
                    className="text-green-600 hover:text-green-700 hover:underline font-semibold text-sm transition-colors"
                  >
                    🏪 Healthy Corner
                  </Link>
                </div>
              </div>

              {/* Card 2 - Selamat Datang */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group flex flex-col">
                <Link 
                  to="/menu/selamat-datang"
                  className="block"
                >
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
                    <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base group-hover:text-green-600 transition-colors">Selamat Datang</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      Menu spesial dengan bahan-bahan segar dan berkualitas
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                      </svg>
                      <span>0.6 km</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                      </svg>
                      <span>15-20 menit</span>
                    </div>
                  </div>
                </Link>
                {/* Restaurant Name Link */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 mt-auto">
                  <Link 
                    to="/restaurant/warung-selamat"
                    className="text-green-600 hover:text-green-700 hover:underline font-semibold text-sm transition-colors"
                  >
                    🏪 Warung Selamat
                  </Link>
                </div>
              </div>

              {/* Card 3 - Rainbow Buddha Bowl */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group flex flex-col">
                <Link 
                  to="/menu/buddha-bowl"
                  className="block"
                >
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
                    <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base group-hover:text-green-600 transition-colors">Rainbow Buddha Bowl</h3>
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
                      <span>0.5 km</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                      </svg>
                      <span>15-20 menit</span>
                    </div>
                  </div>
                </Link>
                {/* Restaurant Name Link */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 mt-auto">
                  <Link 
                    to="/restaurant/healthy-corner"
                    className="text-green-600 hover:text-green-700 hover:underline font-semibold text-sm transition-colors"
                  >
                    🏪 Healthy Corner
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}