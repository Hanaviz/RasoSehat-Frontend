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
    <footer className="bg-gradient-to-b from-slate-50 via-emerald-50/30 to-white border-t border-emerald-100/50">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Container - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 py-12 border-b border-emerald-100/50">
          
          {/* Column 1: Logo & Slogan - Larger on desktop */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl blur-xl"></div>
                <img
                  src="/logo-RasoSehat.png"
                  alt="RasoSehat Logo"
                  className="relative w-12 h-12 rounded-2xl bg-white p-1 shadow-lg ring-2 ring-emerald-200/50"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">RasoSehat</h3>
                <p className="text-xs text-emerald-600 font-medium">Hidup Sehat, Hidup Bahagia</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              Platform direktori makanan sehat terpercaya di Kota Padang. Temukan pilihan menu sehat untuk gaya hidup lebih baik.
            </p>
            
            <a 
              href="https://github.com/Hanaviz/RasoSehat-Frontend.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 font-medium group shadow-sm"
            >
              <Github size={16} className="text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
              <span>Repository Proyek</span>
            </a>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-bold text-base text-slate-800 pb-2 border-b-2 border-emerald-400 inline-block">
              Navigasi Cepat
            </h4>
            <nav className="space-y-2.5">
              <Link to="/" className="group flex items-center text-sm text-slate-600 hover:text-emerald-600 transition-colors duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-3 group-hover:scale-125 transition-transform duration-200"></span>
                Beranda
              </Link>
              <Link to="/about" className="group flex items-center text-sm text-slate-600 hover:text-emerald-600 transition-colors duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-3 group-hover:scale-125 transition-transform duration-200"></span>
                Tentang Kami
              </Link>
              <Link to="/categories" className="group flex items-center text-sm text-slate-600 hover:text-emerald-600 transition-colors duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-3 group-hover:scale-125 transition-transform duration-200"></span>
                Cari Kategori
              </Link>
              <Link to="/register-store" className="group flex items-center text-sm text-slate-600 hover:text-emerald-600 transition-colors duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-3 group-hover:scale-125 transition-transform duration-200"></span>
                Daftar Toko
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact & Information */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-bold text-base text-slate-800 pb-2 border-b-2 border-emerald-400 inline-block">
              Hubungi Kami
            </h4>
            <div className="space-y-3">
              <div className="group flex items-center gap-3 text-sm text-slate-600 hover:text-emerald-600 transition-colors duration-200">
                <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors duration-200 flex-shrink-0">
                  <Mail size={18} className="text-emerald-600"/>
                </div>
                <span className="break-all">contact@rasosehat.com</span>
              </div>
              <div className="group flex items-center gap-3 text-sm text-slate-600 hover:text-emerald-600 transition-colors duration-200">
                <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors duration-200 flex-shrink-0">
                  <Phone size={18} className="text-emerald-600"/>
                </div>
                <span>+62 812-XXXX-XXXX</span>
              </div>
              <div className="group flex items-start gap-3 text-sm text-slate-600 hover:text-emerald-600 transition-colors duration-200">
                <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors duration-200 flex-shrink-0">
                  <MapPin size={18} className="text-emerald-600"/>
                </div>
                <span>Kota Padang, Sumatera Barat</span>
              </div>
            </div>
          </div>

          {/* Column 4: Development Team */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-bold text-base text-slate-800 pb-2 border-b-2 border-emerald-400 inline-block">
              Tim Pengembang
            </h4>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamMembers.map((member, index) => (
                <li key={index} className="group flex items-start gap-2.5 p-3 bg-white border border-emerald-100/50 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all duration-200">
                  <div className="p-1.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors duration-200 flex-shrink-0 mt-0.5">
                    <User size={14} className="text-emerald-600" />
                  </div>
                  <div className='flex flex-col flex-1 min-w-0'>
                    <span className='text-sm font-semibold text-slate-800 truncate'>{member.name}</span>
                    <span className='text-xs text-emerald-600 font-medium'>{member.role}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Copyright & Disclaimer */}
        <div className="py-6 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-sm text-slate-600 font-medium text-center md:text-left">
              © {currentYear} RasoSehat. Dibuat dengan <span className="text-red-500">❤</span> untuk Tugas Proyek RPL.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                Proyek Akademik
              </span>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-slate-600 leading-relaxed text-center">
              <span className="font-bold text-amber-700">⚠ Disclaimer:</span> Informasi di website ini merupakan panduan umum dan hasil verifikasi literatur untuk keperluan akademik. Untuk kebutuhan diet khusus atau kondisi kesehatan tertentu, konsultasikan dengan profesional medis atau ahli gizi bersertifikat.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}