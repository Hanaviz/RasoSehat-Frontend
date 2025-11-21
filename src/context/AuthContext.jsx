import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// 🚨 PENTING: URL ini harus disesuaikan jika server Laravel Anda berjalan di alamat lain
const API_URL = 'http://127.0.0.1:8000/api/v1'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 💡 Mengambil token saat inisialisasi
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. SET UP AXIOS DEFAULT HEADER DAN VERIFIKASI TOKEN
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                // Set header untuk request
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    // Coba ambil data user (GET /api/v1/user)
                    const response = await axios.get(`${API_URL}/user`); 
                    setUser(response.data);
                } catch (error) {
                    // Token kadaluarsa atau tidak valid di server
                    console.error('Token invalid or expired. Logging out.');
                    handleLogoutLocal(); // Hapus data lokal
                }
            } else {
                delete axios.defaults.headers.common['Authorization'];
                setUser(null);
            }
            setIsLoading(false);
        };
        
        fetchUser();
    }, [token]);
    
    // Handler Logout Lokal (tanpa memanggil API, hanya membersihkan state)
    const handleLogoutLocal = () => {
        localStorage.removeItem('access_token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    // 2. LOGIN HANDLER (Memanggil POST /api/v1/login)
    const handleLogin = async (credentials) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/login`, credentials); // POST /api/v1/login
            const { access_token, user } = response.data;
            
            localStorage.setItem('access_token', access_token);
            setToken(access_token);
            setUser(user);
            
            // Set header untuk semua request selanjutnya
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            
            return { success: true };
        } catch (error) {
            setIsLoading(false);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login Gagal. Cek kredensial dan koneksi.' 
            };
        }
    };

    // 3. LOGOUT HANDLER (Memanggil POST /api/v1/logout)
    const handleLogout = async () => {
        setIsLoading(true);
        try {
            // Panggil endpoint logout API Laravel untuk mencabut token di server
            await axios.post(`${API_URL}/logout`); // POST /api/v1/logout
        } catch (error) {
            console.error('Logout failed on server, cleaning local data.', error);
        } finally {
            handleLogoutLocal(); // Bersihkan state lokal
            setIsLoading(false);
        }
    };
    
    // Value yang diekspos ke komponen lain
    const authContextValue = {
        user,
        isAuthenticated: !!user && !isLoading,
        isLoading,
        token,
        login: handleLogin,
        logout: handleLogout,
        // Helper untuk cek role
        isAdmin: user?.role === 'admin',
        isPenjual: user?.role === 'penjual',
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook untuk menggunakan Auth Context
export const useAuth = () => useContext(AuthContext);

// 💡 PENTING: Anda perlu menginstal axios dan mengganti semua penggunaan localStorage 
//             di Signin.jsx dan NavbarAuth.jsx dengan hook useAuth.

// Untuk menggunakan Context ini, bungkus <App /> di main.jsx dengan <AuthProvider>.