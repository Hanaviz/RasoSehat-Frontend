import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
// Import komponen yang diperlukan
import Navbar from './navbar'; 
import NavbarAuth from './NavbarAuth'; 
import Footer from './Footer'; 

export default function Layout() {
  const location = useLocation();

  // Mock status autentikasi. Ganti ini dengan state Auth Context/Redux yang sebenarnya.
  const isAuthenticated = true; 

  // Daftar path yang tidak memerlukan Navbar dan Footer (misal: halaman Sign-in/Sign-up)
  const noLayoutPages = ['/signin', '/signup'];
  const excludeLayout = noLayoutPages.includes(location.pathname);

  // Jika halaman tidak memerlukan layout (misal: halaman Auth full-screen)
  if (excludeLayout) {
    // Merender halaman turunan saja tanpa Navbar/Footer
    return <Outlet />; 
  }

  // Menentukan Navbar mana yang akan digunakan
  const CurrentNavbar = isAuthenticated ? NavbarAuth : Navbar;

  return (
    // Flex container untuk memastikan footer selalu berada di bawah (sticky footer pattern)
    <div className="flex flex-col min-h-screen">
      
      {/* Navbar di atas */}
      <CurrentNavbar />
      
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