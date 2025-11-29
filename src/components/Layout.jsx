import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
// Import komponen yang diperlukan
import NavbarAuth from './NavbarAuth'; 
import Footer from './Footer'; 

export default function Layout() {
  const location = useLocation();

  // Mock status autentikasi.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 

  // Fungsi untuk Logout
  const handleLogout = () => {
    // Di sini adalah tempat untuk menghapus token/session/cookie pengguna.
    console.log('User logged out. Switching to unauthenticated navbar.');
    setIsAuthenticated(false); // Atur status ke false untuk memuat Navbar unauthenticated
  };
  
  // Daftar path yang tidak memerlukan Navbar dan Footer (misal: halaman Sign-in/Sign-up)
  const noLayoutPages = ['/signin', '/signup'];
  const excludeLayout = noLayoutPages.includes(location.pathname);

  // 👈 START: LOGIKA PENGECEKIAN NAVBAR 
  const EXCLUDE_NAVBAR_PATHS = ['/my-store']; // Daftar path yang tidak boleh ada Navbar
  const shouldRenderNavbar = !EXCLUDE_NAVBAR_PATHS.includes(location.pathname);

  // Jika halaman tidak memerlukan layout (misal: halaman Auth full-screen)
  if (excludeLayout) {
    // Merender halaman turunan saja tanpa Navbar/Footer
    return <Outlet />; 
  }

  // Menentukan Navbar yang akan digunakan
  const CurrentNavbar = NavbarAuth;

  return (
    // Flex container untuk memastikan footer selalu berada di bawah (sticky footer pattern)
    <div className="flex flex-col min-h-screen">
      
      {/* Navbar di atas - HANYA RENDER JIKA shouldRenderNavbar ADALAH TRUE */}
      {shouldRenderNavbar && <CurrentNavbar onLogout={handleLogout} />} 
      
      {/* Main Content Area - flex-grow memastikan konten mengisi sisa ruang */}
      {/* Catatan: Konten MyStorePage harus memiliki padding top yang memadai karena navbarnya hilang */}
      <main className="flex-grow">
        {/* Outlet merender komponen Route yang cocok (HeroSection, MenuDetailPage, ProfilePage, dll.) */}
        <Outlet />
      </main>
      
      {/* Footer di bawah */}
      <Footer />
    </div>
  );
}