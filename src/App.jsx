import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import Layout from "./components/Layout";
import SignInPage from "./pages/Signin";
import SignUpPage from "./pages/SignUp";
import ProfilePage from "./pages/Profile";
import NotificationsPage from "./pages/NotificationsPage";
import NotificationDetail from "./pages/NotificationDetail";
import MenuDetailPage from "./pages/MenuDetailPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import CategoryPage from "./pages/CategoryPage";
import RegisterStorePage from "./pages/RegisterStorePage";
import EditRestaurantProfile from "./pages/EditRestaurantProfile";
import StoreVerificationPending from "./pages/StoreVerificationPending";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MyStorePage from "./pages/MyStorePage";
import SettingsPage from "./pages/SettingsPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import AddMenuPage from "./pages/AddMenuPage";
import EditMenuPage from "./pages/EditMenuPage";
import HeroSectionPage from "./pages/Herosection";

import { useAuth } from "./context/AuthContext";

/* ---------------------- PROTECTED ROUTE ---------------------- */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

/* ---------------------- SCROLL TO TOP HOOK ---------------------- */
function useScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll ke atas saat route berubah
    // Delay kecil untuk sinkronisasi dengan animasi
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [pathname, search]);
}

/* ---------------------- ANIMATED ROUTER WRAPPER ---------------------- */
function AppContent() {
  const location = useLocation();
  
  // Gunakan hook scroll to top
  useScrollToTop();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname + location.search}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.3, 
          ease: [0.22, 1, 0.36, 1] // easeOutExpo untuk transisi smooth
        }}
      >
        <Routes location={location}>
          {/* ---------- AUTH ---------- */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* ---------- STORE ---------- */}
          <Route 
            path="/my-store" 
            element={
              <ProtectedRoute>
                <MyStorePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-store/edit" 
            element={
              <ProtectedRoute>
                <EditRestaurantProfile />
              </ProtectedRoute>
            } 
          />
          <Route path="/register-store" element={<RegisterStorePage />} />
          <Route 
            path="/store-verification-pending" 
            element={<StoreVerificationPending />} 
          />
          <Route path="/add-menu" element={<AddMenuPage />} />
          <Route 
            path="/edit-menu/:id" 
            element={
              <ProtectedRoute>
                <EditMenuPage />
              </ProtectedRoute>
            } 
          />

          {/* ---------- MAIN LAYOUT ---------- */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/signin" replace />} />
            <Route 
              path="home" 
              element={
                <ProtectedRoute>
                  <HeroSectionPage />
                </ProtectedRoute>
              } 
            />
            <Route path="search" element={<SearchResultsPage />} />
            <Route 
              path="category/:categorySlug" 
              element={<CategoryPage />} 
            />
            <Route path="menu/:slug" element={<MenuDetailPage />} />
            <Route 
              path="restaurant/:slug" 
              element={<RestaurantDetailPage />} 
            />
          </Route>

          {/* ---------- USER ---------- */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications/:id" 
            element={
              <ProtectedRoute>
                <NotificationDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />

          {/* ---------- ADMIN ---------- */}
          <Route 
            path="/admin" 
            element={<Navigate to="/admin-dashboard" replace />} 
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------------------- ROOT APP ---------------------- */
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;