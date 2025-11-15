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
    <footer className="bg-gradient-to-br from-green-800 via-green-900 to-emerald-900 text-white pt-5 pb-2 shadow-2xl relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-8 relative z-10">
        
        {/* Main Container - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-4 gap-x-4 border-b border-green-700/30 pb-5 mb-3">
          
          {/* Column 1: Logo & Slogan */}
          <div className="col-span-2 lg:col-span-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-50"></div>
                <img
                  src="/logo-RasoSehat.png"
                  alt="RasoSehat Logo"
                  className="relative w-7 h-7 rounded-full bg-white p-0.5 shadow-xl ring-2 ring-green-400/50"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">RasoSehat</h3>
                <p className="text-[10px] text-green-300 font-medium">Hidup Sehat, Hidup Bahagia</p>
              </div>
            </div>
            
            <p className="text-xs text-green-100 leading-relaxed">
              Platform Panduan Makanan Sehat di Padang.
            </p>
            
            <a 
              href="https://github.com/Hanaviz/RasoSehat-Frontend.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-green-300 hover:text-white transition-all duration-300 font-medium group"
            >
              <Github size={14} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="border-b border-green-300/50 group-hover:border-white/50">Repository Proyek RPL</span>
            </a>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="col-span-1 space-y-1.5">
            <h4 className="font-bold text-sm sm:text-base text-white mb-2 relative inline-block">
              Navigasi
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-green-400"></span>
            </h4>
            <nav className="space-y-0.5">
              <Link to="/" className="group flex items-center text-xs text-green-200 hover:text-white transition-all duration-200">
                <span className="w-0 group-hover:w-1.5 h-0.5 bg-green-400 mr-0 group-hover:mr-1.5 transition-all duration-200"></span>
                Beranda
              </Link>
              <Link to="/about" className="group flex items-center text-xs text-green-200 hover:text-white transition-all duration-200">
                <span className="w-0 group-hover:w-1.5 h-0.5 bg-green-400 mr-0 group-hover:mr-1.5 transition-all duration-200"></span>
                Tentang Kami
              </Link>
              <Link to="/categories" className="group flex items-center text-xs text-green-200 hover:text-white transition-all duration-200">
                <span className="w-0 group-hover:w-1.5 h-0.5 bg-green-400 mr-0 group-hover:mr-1.5 transition-all duration-200"></span>
                Cari Kategori
              </Link>
              <Link to="/register-store" className="group flex items-center text-xs text-green-200 hover:text-white transition-all duration-200">
                <span className="w-0 group-hover:w-1.5 h-0.5 bg-green-400 mr-0 group-hover:mr-1.5 transition-all duration-200"></span>
                Daftar Toko
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact & Information */}
          <div className="col-span-1 space-y-1.5">
            <h4 className="font-bold text-sm sm:text-base text-white mb-2 relative inline-block">
              Hubungi Kami
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-green-400"></span>
            </h4>
            <div className="space-y-1">
              <div className="group flex items-center gap-2 text-xs text-green-200 hover:text-white transition-colors duration-200">
                <div className="p-1 bg-green-800/50 rounded group-hover:bg-green-700/50 transition-colors duration-200">
                  <Mail size={14} className="text-green-300"/>
                </div>
                <span>contact@rasosehat.com</span>
              </div>
              <div className="group flex items-center gap-2 text-xs text-green-200 hover:text-white transition-colors duration-200">
                <div className="p-1 bg-green-800/50 rounded group-hover:bg-green-700/50 transition-colors duration-200">
                  <Phone size={14} className="text-green-300"/>
                </div>
                <span>+62 812-XXXX-XXXX (WA)</span>
              </div>
              <div className="group flex items-start gap-2 text-xs text-green-200 hover:text-white transition-colors duration-200">
                <div className="p-1 bg-green-800/50 rounded group-hover:bg-green-700/50 transition-colors duration-200">
                  <MapPin size={14} className="text-green-300 flex-shrink-0"/>
                </div>
                <span>Kota Padang</span>
              </div>
            </div>
          </div>

          {/* Column 4: Development Team */}
          <div className="col-span-2 lg:col-span-2 space-y-2">
            <h4 className="font-bold text-sm sm:text-base text-white mb-2 relative inline-block">
              Tim Pengembang
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-green-400"></span>
            </h4>
            
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-y-2 gap-x-2">
              {teamMembers.map((member, index) => (
                <li key={index} className="group flex items-start gap-1 hover:translate-x-0.5 transition-transform duration-200">
                  <div className="p-1 bg-green-800/50 rounded group-hover:bg-green-700/50 transition-colors duration-200 mt-0.5">
                    <User size={12} className="text-green-300" />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-xs font-medium text-white'>{member.name}</span>
                    <span className='text-[9px] text-green-300 italic -mt-0.5'>{member.role}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Copyright & Disclaimer */}
        <div className="text-center pt-2 border-t border-green-700/50 space-y-0.5">
          <p className="text-[9px] text-green-200 font-medium">
            © {currentYear} RasoSehat. Dibuat dengan <span className="text-red-400 animate-pulse">❤</span> untuk Tugas Proyek RPL.
          </p>
          <p className="text-[9px] text-green-300/80 max-w-2xl mx-auto leading-relaxed">
            <span className="font-semibold">Disclaimer:</span> Informasi di website ini merupakan panduan dan hasil verifikasi literatur. Konsultasikan dengan profesional medis/gizi untuk diet khusus.
          </p>
        </div>
      </div>
    </footer>
  );
}