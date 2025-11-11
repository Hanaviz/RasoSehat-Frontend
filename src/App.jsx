import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';
// Hapus import Navbar/NavbarAuth di sini, karena sudah diurus oleh Layout
import Layout from "./components/Layout"; // 👈 Import Layout
import HeroSection from "./pages/Herosection";
import SignInPage from "./pages/Signin";
import SignUpPage from "./pages/SignUp"; 
import ProfilePage from "./pages/Profile"; 
import MenuDetailPage from "./pages/MenuDetailPage"; 
// Tambahkan import halaman lain di sini saat Anda membuatnya (e.g., AboutPage, StoreRegisterPage)

function AppContent() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.32 }}
      >
        <Routes location={location}>
          
          {/* 1. Route Khusus (Tanpa Navbar/Footer - Full Screen) */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* 2. Parent Route: Layout (Menggunakan Navbar & Footer) */}
          <Route path="/" element={<Layout />}>
            
            {/* Nested Routes (Content yang Ditampilkan di dalam Layout) */}
            <Route index element={<HeroSection />} /> {/* Path="/" */}
            <Route path="/profile" element={<ProfilePage />} /> 
            <Route path="/menu/:slug" element={<MenuDetailPage />} /> 
            
            {/* Tambahkan rute konten lain di sini: */}
            {/* <Route path="/about" element={<AboutPage />} /> */}
            {/* <Route path="/register-store" element={<StoreRegisterPage />} /> */}

          </Route>
          
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