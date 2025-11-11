import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from "./components/navbar";
import NavbarAuth from "./components/NavbarAuth";
import HeroSection from "./pages/Herosection";
import SignInPage from "./pages/Signin";
import SignUpPage from "./pages/SignUp"; 
import ProfilePage from "./pages/Profile"; // 👈 Import Profile Page

function AppContent() {
  const location = useLocation();
  
  // Halaman yang tidak menampilkan navbar
  const noNavbarPages = ['/signin', '/signup'];
  const showNavbar = !noNavbarPages.includes(location.pathname);
  
  // Tentukan navbar mana yang ditampilkan (sebelum/sesudah login)
  const isAuthenticated = true; // 👈 Ganti dengan state auth real nanti
  
  return (
    <>
      {showNavbar && (
        isAuthenticated ? <NavbarAuth /> : <Navbar />
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32 }}
        >
          <Routes location={location}>
            <Route path="/" element={<HeroSection />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/profile" element={<ProfilePage />} /> {/* 👈 Route Profile */}
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;