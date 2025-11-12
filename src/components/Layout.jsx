// hanaviz/rasosehat-frontend/RasoSehat-Frontend-8fe64945ce814624136f2a939b0264a9e138ff80/src/components/Layout.jsx

import React, { useState } from 'react'; // 👈 Tambahkan import useState
import { useLocation, Outlet } from 'react-router-dom';
// Import komponen yang diperlukan
import Navbar from './navbar'; 
import NavbarAuth from './NavbarAuth'; 
import Footer from './Footer'; 

export default function Layout() {
  const location = useLocation();

  // Mock status autentikasi. Ganti ini dengan state Auth Context/Redux yang sebenarnya.
  // const isAuthenticated = true; // ❌ Hapus baris ini
  const [isAuthenticated, setIsAuthenticated] = useState(true); // 👈 Gunakan useState untuk status otentikasi

  // Fungsi untuk Logout
  const handleLogout = () => {
    // Di sini adalah tempat untuk menghapus token/session/cookie pengguna.
    console.log('User logged out. Switching to unauthenticated navbar.');
    setIsAuthenticated(false); // 👈 Atur status ke false untuk memuat Navbar unauthenticated
  };
  
  // Daftar path yang tidak memerlukan Navbar dan Footer (misal: halaman Sign-in/Sign-up)
  const noLayoutPages = ['/signin', '/signup'];
  const excludeLayout = noLayoutPages.includes(location.pathname);

  // Jika halaman tidak memerlukan layout (misal: halaman Auth full-screen)
  if (excludeLayout) {
    // Merender halaman turunan saja tanpa Navbar/Footer
    return <Outlet />; 
  }

  // Menentukan Navbar mana yang akan digunakan
  const CurrentNavbar = isAuthenticated ? NavbarAuth : Navbar; //

  return (
    // Flex container untuk memastikan footer selalu berada di bawah (sticky footer pattern)
    <div className="flex flex-col min-h-screen">
      
      {/* Navbar di atas */}
      {/* 👈 Kirim fungsi logout sebagai prop ke Navbar yang sedang aktif */}
      <CurrentNavbar onLogout={handleLogout} /> 
      
      {/* Main Content Area - flex-grow memastikan konten mengisi sisa ruang */}
      <main className="flex-grow">
        {/* Outlet merender komponen Route yang cocok (HeroSection, MenuDetailPage, ProfilePage, dll.) */}
        <Outlet />
      </main>
      
      {/* Footer di bawah */}
      <Footer />
    </div>
  );
}