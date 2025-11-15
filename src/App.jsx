import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// LAYOUT & PUBLIC PAGES
import Layout from "./components/Layout";
import HeroSection from "./pages/Herosection";
import SignInPage from "./pages/Signin";
import SignUpPage from "./pages/SignUp";

// PROTECTED PAGES
import ProfilePage from "./pages/Profile";
import MenuDetailPage from "./pages/MenuDetailPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import CategoryPage from "./pages/CategoryPage";
import RegisterStorePage from "./pages/RegisterStorePage";
import AdminDashboardPage from "./pages/AdminDashboardPage"; // Dashboard Admin
import MyStorePage from "./pages/MyStorePage";
import SettingsPage from "./pages/SettingsPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import AddMenuPage from "./pages/AddMenuPage";

// Small frontend-only protection component: redirects to /signin when not authenticated
function ProtectedRoute({ children }) {
  // Ganti dengan logic cek token atau state otentikasi nyata dari Laravel API
  let isAuth = false;
  try {
    isAuth = localStorage.getItem("isAuthenticated") === "true";
  } catch {
    isAuth = false;
  }
  if (!isAuth) return <Navigate to="/signin" replace />;
  return children;
}

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
          
          {/* 1. UNPROTECTED / PUBLIC ROUTES (Tidak memerlukan login) */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Public Content yang menggunakan Layout (Home, Search, Details) */}
          {/* CATATAN: Karena ProtectedRoute di bawah mencakup /, semua route public 
             yang menggunakan Layout harus didefinisikan di luar ProtectedRoute
             atau jika Anda ingin semua route di bawah ini diproteksi, hapus saja 
             Route yang di luar ProtectedRoute. */}

          {/* Contoh Public Routes yang tetap menggunakan Layout (Meski belum login) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HeroSection />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/menu/:slug" element={<MenuDetailPage />} />
            <Route path="/restaurant/:slug" element={<RestaurantDetailPage />} />
          </Route>
          
          {/* 2. PROTECTED ROUTES (Membutuhkan Login) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Nested Routes yang membutuhkan autentikasi (Diproteksi) */}
            
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Merchant/Penjual Routes */}
            <Route path="/register-store" element={<RegisterStorePage />} />
            <Route path="/my-store" element={<MyStorePage />} /> 
            <Route path="/add-menu" element={<AddMenuPage />} /> 
            
            {/* Admin Routes */}
            {/* Menggunakan nama /admin-dashboard untuk menghindari konflik dengan alias lama */}
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} /> 
            
          </Route>
          
          {/* Alias dari /admin ke /admin-dashboard */}
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
          
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