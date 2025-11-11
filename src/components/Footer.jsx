import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, User, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Data Anggota Tim Proyek RPL
  const teamMembers = [
    { name: "Nori Dwi Yulianti", role: "Project Manager" },
    { name: "Adib Al-Hakim", role: "Architect" },
    { name: "Muhammad Aldo Mulyawan", role: "Designer (Lo-fi)" },
    { name: "Azka Shalu Ramadhan", role: "Designer (Hi-fi)" },
    { name: "Fadil Umma Suhada", role: "Developer (Frontend)" },
    { name: "Hanaviz", role: "Developer (Backend)" },
  ];

  return (
    // Menggunakan gradien hijau yang seragam dengan Navbar saat di-scroll, namun sedikit lebih dalam.
    <footer className="bg-gradient-to-r from-green-700 via-green-800 to-green-700 text-white pt-10 pb-4 shadow-2xl">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Kontainer Utama - Grid Responsif: 2 kolom (sm/md) -> 5 kolom (lg) */}
        {/* Ditingkatkan: Gunakan grid 2 kolom lebih dulu di breakpoint 'sm' */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-6 border-b border-green-700/50 pb-8 mb-8">
          
          {/* Kolom 1: Logo & Slogan (2/2 di Mobile, 1/5 di Desktop) */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-RasoSehat.png"
                alt="RasoSehat Logo"
                className="w-10 h-10 rounded-full bg-white p-1 shadow-lg"
              />
              <div>
                <span className="text-xl font-bold text-white">RasoSehat</span>
                <p className="text-xs text-green-300">Hidup Sehat, Hidup Bahagia</p>
              </div>
            </div>
            <p className="text-sm text-green-200">
              Platform Panduan Makanan Sehat di Padang. Solusi cerdas untuk memilih menu sehat harian Anda.
            </p>
            <a 
              href="https://github.com/your-repo-link" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green-300 hover:text-white transition-colors font-medium"
            >
              <Github size={18} />
              Repository Proyek RPL
            </a>
          </div>

          {/* Kolom 2: Navigasi Cepat (1/2 di Mobile/Tablet, 1/5 di Desktop) */}
          <div className="col-span-1 space-y-3">
            <h4 className="font-bold text-lg text-white mb-4 border-b border-green-500/50 pb-1">Navigasi</h4>
            <nav className="space-y-2">
              <Link to="/" className="block text-sm text-green-200 hover:text-white hover:translate-x-0.5 transition-all duration-200">
                Beranda
              </Link>
              <Link to="/about" className="block text-sm text-green-200 hover:text-white hover:translate-x-0.5 transition-all duration-200">
                Tentang Kami
              </Link>
              <Link to="/categories" className="block text-sm text-green-200 hover:text-white hover:translate-x-0.5 transition-all duration-200">
                Cari Kategori Sehat
              </Link>
              <Link to="/register-store" className="block text-sm text-green-200 hover:text-white hover:translate-x-0.5 transition-all duration-200">
                Daftar Toko
              </Link>
            </nav>
          </div>

          {/* Kolom 3: Kontak & Informasi (1/2 di Mobile/Tablet, 1/5 di Desktop) */}
          <div className="col-span-1 space-y-4">
            <h4 className="font-bold text-lg text-white mb-4 border-b border-green-500/50 pb-1">Hubungi Kami</h4>
            <div className="space-y-3">
                <p className="flex items-center gap-3 text-sm text-green-200">
                    <Mail size={18} className="text-green-300"/>
                    <span>contact@rasosehat.com</span>
                </p>
                <p className="flex items-center gap-3 text-sm text-green-200">
                    <Phone size={18} className="text-green-300"/>
                    <span>+62 812-XXXX-XXXX (WA Support)</span>
                </p>
                <p className="flex items-start gap-3 text-sm text-green-200">
                    <MapPin size={18} className="text-green-300 flex-shrink-0 mt-1"/>
                    <span>Area Layanan: Kota Padang</span>
                </p>
            </div>
          </div>

          {/* Kolom 4: Tim Pengembang (PENTING: Diatur agar 2/4 di Tablet, 2/5 di Desktop) */}
          {/* Di mobile kecil, kolom ini tetap di bawah, tetapi isinya dibuat 2 kolom. */}
          <div className="col-span-2 lg:col-span-2 space-y-3">
            <h4 className="font-bold text-lg text-white mb-4 border-b border-green-500/50 pb-1">Tim Pengembang (RPL Group)</h4>
            
            {/* INI KUNCI SOLUSINYA: Gunakan nested grid 2 kolom (sm:grid-cols-2) untuk daftar tim */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
              {teamMembers.map((member, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <User size={16} className="text-green-300 mt-1 flex-shrink-0" />
                  <div className='flex flex-col'>
                    <span className='text-white font-medium'>{member.name}</span>
                    <span className='text-xs text-green-300 italic'>({member.role})</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Hak Cipta & Disclaimer */}
        <div className="text-center pt-4 border-t border-green-700/50">
          <p className="text-xs text-green-200 mb-1">
            © {currentYear} RasoSehat. Dibuat dengan ❤ untuk Tugas Proyek RPL.
          </p>
          <p className="text-xs text-green-300 opacity-80 max-w-2xl mx-auto">
            Disclaimer: Informasi di website ini merupakan panduan dan hasil verifikasi literatur. Konsultasikan dengan profesional medis/gizi untuk diet khusus.
          </p>
        </div>
      </div>
    </footer>
  );
}