import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Layout from "./components/Layout";
import SignInPage from "./pages/Signin";
import SignUpPage from "./pages/SignUp";
// legacy seller-specific pages removed: StoreSignUp/StoreSignIn replaced by unified register-store

import ProfilePage from "./pages/Profile";
import NotificationsPage from "./pages/NotificationsPage";
import NotificationDetail from "./pages/NotificationDetail";
import MenuDetailPage from "./pages/MenuDetailPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import CategoryPage from "./pages/CategoryPage";
import RegisterStorePage from "./pages/RegisterStorePage";
import StoreVerificationPending from "./pages/StoreVerificationPending";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MyStorePage from "./pages/MyStorePage";
import SettingsPage from "./pages/SettingsPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import AddMenuPage from "./pages/AddMenuPage";

import HeroSectionPage from "./pages/Herosection"; // pastikan file ini ada!
import { useAuth } from "./context/AuthContext";


/* ---------------------- PROTECTED ROUTE ---------------------- */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}


/* ---------------------- ANIMATED ROUTER WRAPPER ---------------------- */
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
          {/* ---------- AUTH PAGES ---------- */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          {/* legacy /store-signup redirect removed - use /register-store directly */}

          {/* ---------- STORE FLOW ---------- */}
          <Route path="/my-store" element={<ProtectedRoute><MyStorePage /></ProtectedRoute>} />
          <Route path="/register-store" element={<RegisterStorePage />} />
          <Route path="/store-verification-pending" element={<StoreVerificationPending />} />
          <Route path="/add-menu" element={<AddMenuPage />} />

          {/* ---------- MAIN LAYOUT (SESUDAH LOGIN MASUK HOME) ---------- */}
          <Route path="/" element={<Layout />}>
            {/* Login adalah halaman utama */}
            <Route index element={<Navigate to="/signin" replace />} />

            {/* Halaman home yang muncul setelah login */}
            <Route path="home" element={<ProtectedRoute><HeroSectionPage /></ProtectedRoute>} />

            {/* Page lainnya */}
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="category/:categorySlug" element={<CategoryPage />} />
            <Route path="menu/:slug" element={<MenuDetailPage />} />
            <Route path="restaurant/:slug" element={<RestaurantDetailPage />} />
          </Route>

          {/* ---------- USER PAGES ---------- */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/notifications/:id" element={<ProtectedRoute><NotificationDetail /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* ---------- ADMIN ---------- */}
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
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
