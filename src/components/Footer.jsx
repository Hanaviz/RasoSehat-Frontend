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
    // Mengurangi padding vertikal maksimal: pt-5, pb-2
    <footer className="bg-gradient-to-r from-green-700 via-green-800 to-green-700 text-white pt-5 pb-2 shadow-2xl">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-8"> {/* Mengurangi padding horizontal di mobile */}
        
        {/* Kontainer Utama - Grid Responsif: Gunakan grid 2 kolom di mobile, 4 di tablet, 5 di desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-4 gap-x-4 border-b border-green-700/50 pb-5 mb-3"> {/* Mengurangi gap-y dan gap-x */}
          
          {/* Kolom 1: Logo & Slogan (Kolom Logo dibuat lebih kecil di mobile) */}
          <div className="col-span-2 lg:col-span-1 space-y-2"> {/* Mengurangi space-y menjadi 2 */}
            <div className="flex items-center gap-2"> 
              <img
                src="/logo-RasoSehat.png"
                alt="RasoSehat Logo"
                className="w-7 h-7 rounded-full bg-white p-0.5 shadow-lg" // Logo 7x7 (sangat kecil)
              />
              <div>
                <span className="text-base sm:text-lg font-bold text-white">RasoSehat</span> {/* Font dikurangi */}
                <p className="text-[10px] text-green-300">Hidup Sehat, Hidup Bahagia</p> {/* Sangat kecil */}
              </div>
            </div>
            <p className="text-xs text-green-200">
              Platform Panduan Makanan Sehat di Padang.
            </p>
            <a 
              href="https://github.com/Hanaviz/RasoSehat-Frontend.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-green-300 hover:text-white transition-colors font-medium" // Font sangat kecil
            >
              <Github size={14} />
              Repository Proyek RPL
            </a>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div className="col-span-1 space-y-1.5"> 
            <h4 className="font-bold text-sm sm:text-base text-white mb-2 border-b border-green-500/50 pb-0.5">Navigasi</h4> {/* Header kecil */}
            <nav className="space-y-0.5"> {/* Jarak antar link sangat kecil */}
              <Link to="/" className="block text-xs text-green-200 hover:text-white hover:translate-x-0.5 transition-all duration-200">
                Beranda
              </Link>
              <Link to="/about" className="block text-xs text-green-200 hover:text-white hover:translate-x-0.5 transition-all duration-200">
                Tentang Kami
              </Link>
              <Link to="/categories" className="block text-xs text-green-200 hover:text-white hover:translate-x-0.5 transition-all duration-200">
                Cari Kategori
              </Link>
              <Link to="/register-store" className="block text-xs text-green-200 hover:text-white hover:translate-x-0.5 transition-all duration-200">
                Daftar Toko
              </Link>
            </nav>
          </div>

          {/* Kolom 3: Kontak & Informasi */}
          <div className="col-span-1 space-y-1.5"> 
            <h4 className="font-bold text-sm sm:text-base text-white mb-2 border-b border-green-500/50 pb-0.5">Hubungi Kami</h4> {/* Header kecil */}
            <div className="space-y-1"> {/* Jarak antar detail kontak sangat kecil */}
                <p className="flex items-center gap-2 text-xs text-green-200">
                    <Mail size={14} className="text-green-300"/>
                    <span>contact@rasosehat.com</span>
                </p>
                <p className="flex items-center gap-2 text-xs text-green-200">
                    <Phone size={14} className="text-green-300"/>
                    <span>+62 812-XXXX-XXXX (WA)</span>
                </p>
                <p className="flex items-start gap-2 text-xs text-green-200">
                    <MapPin size={14} className="text-green-300 flex-shrink-0 mt-0.5"/>
                    <span>Kota Padang</span>
                </p>
            </div>
          </div>

          {/* Kolom 4: Tim Pengembang (Kunci Mobile Compact) */}
          <div className="col-span-2 lg:col-span-2 space-y-2"> {/* Mengurangi space-y menjadi 2 */}
            <h4 className="font-bold text-sm sm:text-base text-white mb-2 border-b border-green-500/50 pb-0.5">Tim Pengembang</h4>
            
            {/* Menggunakan 2 kolom di mobile dan 3 kolom di tablet (sm:grid-cols-3) */}
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-y-2 gap-x-2"> 
              {teamMembers.map((member, index) => (
                <li key={index} className="flex items-start gap-1">
                  <User size={12} className="text-green-300 mt-0.5 flex-shrink-0" /> {/* Ikon lebih kecil */}
                  <div className='flex flex-col'>
                    <span className='text-xs font-medium text-white'>{member.name}</span> {/* Font name lebih kecil */}
                    <span className='text-[9px] text-green-300 italic -mt-0.5'>({member.role})</span> {/* Font role sangat kecil */}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Hak Cipta & Disclaimer */}
        <div className="text-center pt-2 border-t border-green-700/50"> {/* Mengurangi padding atas */}
          <p className="text-[9px] text-green-200 mb-0.5">
            © {currentYear} RasoSehat. Dibuat dengan ❤ untuk Tugas Proyek RPL.
          </p>
          <p className="text-[9px] text-green-300 opacity-80 max-w-2xl mx-auto">
            Disclaimer: Informasi di website ini merupakan panduan dan hasil verifikasi literatur. Konsultasikan dengan profesional medis/gizi untuk diet khusus.
          </p>
        </div>
      </div>
    </footer>
  );
}