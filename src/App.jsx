import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';
// Hapus import Navbar/NavbarAuth di sini, karena sudah diurus oleh Layout
import Layout from "./components/Layout";
import HeroSection from "./pages/Herosection";
import SignInPage from "./pages/Signin";
import SignUpPage from "./pages/SignUp"; 
import ProfilePage from "./pages/Profile"; 
import MenuDetailPage from "./pages/MenuDetailPage"; 
import SearchResultsPage from "./pages/SearchResultsPage"; 
import CategoryPage from "./pages/CategoryPage"; 

// 👈 START: Tambahkan import untuk halaman toko
import RegisterStorePage from "./pages/RegisterStorePage"; 
import MyStorePage from "./pages/MyStorePage"; 
// END: Tambahkan import untuk halaman toko


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
            <Route index element={<HeroSection />} /> 
            <Route path="/profile" element={<ProfilePage />} /> 
            <Route path="/menu/:slug" element={<MenuDetailPage />} /> 
            <Route path="/search" element={<SearchResultsPage />} />
            
            {/* ROUTE BARU untuk Halaman Kategori (Dinamic) */}
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            
            {/* 👈 START: Tambahkan Route Toko Baru */}
            <Route path="/register-store" element={<RegisterStorePage />} /> {/* Menampilkan Form Pendaftaran Toko */}
            <Route path="/my-store" element={<MyStorePage />} />             {/* Menampilkan Dashboard Toko (Placeholder) */}
            {/* END: Tambahkan Route Toko Baru */}
            
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