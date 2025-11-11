import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Navbar from './navbar'; // Navbar non-auth
import NavbarAuth from './NavbarAuth'; // Navbar setelah login
import Footer from './Footer'; // Footer baru

// Layout hanya ditampilkan di halaman yang memerlukan Navbar & Footer
export default function Layout({ isAuthenticated }) {
  const location = useLocation();

  // Halaman yang dikecualikan dari Layout (misalnya halaman full-screen seperti Sign-in/Sign-up)
  const noLayoutPages = ['/signin', '/signup'];
  const excludeLayout = noLayoutPages.includes(location.pathname);

  // Jika halaman tidak memerlukan Navbar/Footer (misal: Sign-in/Sign-up)
  if (excludeLayout) {
    // Outlet akan merender halaman turunan (SignInPage atau SignUpPage) tanpa Navbar/Footer
    return <Outlet />; 
  }

  // Navbar yang digunakan tergantung status autentikasi
  const CurrentNavbar = isAuthenticated ? NavbarAuth : Navbar;

  return (
    <div className="flex flex-col min-h-screen">
      <CurrentNavbar />
      
      {/* Konten Halaman */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}