// src/App.jsx (Modifikasi)
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';
// import Navbar from "./components/navbar"; // Hapus
// import NavbarAuth from "./components/NavbarAuth"; // Hapus
import Layout from "./components/Layout"; // 👈 Import Layout baru
import HeroSection from "./pages/Herosection";
import SignInPage from "./pages/Signin";
import SignUpPage from "./pages/SignUp"; 
import ProfilePage from "./pages/Profile"; 

function AppContent() {
  const location = useLocation();
  
  // 💡 Gunakan state otentikasi nyata dari context/redux nanti
  const isAuthenticated = true; // Ganti ini dengan state auth real dari Laravel API

  return (
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32 }}
        >
          {/* 💡 Gunakan Layout sebagai Parent Route */}
          <Routes location={location}>
            <Route path="/" element={<Layout isAuthenticated={isAuthenticated} />}>
              {/* Rute yang menggunakan Navbar & Footer (Layout) */}
              <Route index element={<HeroSection />} />
              <Route path="/profile" element={<ProfilePage />} />
              {/* Tambahkan rute lain di sini: /search, /menu/:id, dll. */}
            </Route>

            {/* Rute yang TIDAK menggunakan Navbar & Footer (Full Screen) */}
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
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