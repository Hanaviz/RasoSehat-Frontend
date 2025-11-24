import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
// NOTE: api has baseURL pointing to http://localhost:3000/api by default
const BASE_URL = '/auth';

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
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    // Coba ambil data user dari endpoint /user
                    const response = await api.get(`/user`);
                    setUser(response.data);
                } catch (error) {
                    console.error('Token invalid or expired. Logging out.');
                    handleLogoutLocal();
                }
            } else {
                delete api.defaults.headers.common['Authorization'];
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
        delete api.defaults.headers.common['Authorization'];
    };

    // 2. REGISTER HANDLER (Baru ditambahkan untuk SignUp.jsx)
    const handleRegister = async (data) => {
        try {
            const response = await api.post(`${BASE_URL}/register`, data);
            return { success: true, message: response.data.message || 'Pendaftaran berhasil' };
        } catch (error) {
             return {
                success: false,
                message: error.response?.data?.message || 'Pendaftaran Gagal. Periksa data dan koneksi.'
            };
        }
    }

    // 3. LOGIN HANDLER (Memanggil POST /api/auth/login)
    const handleLogin = async (credentials) => {
        setIsLoading(true);
        try {
            const response = await api.post(`${BASE_URL}/login`, credentials);
            const { token: access_token, user } = response.data;

            localStorage.setItem('access_token', access_token);
            setToken(access_token);
            setUser(user);

            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            setIsLoading(false);
            return { success: true };
        } catch (error) {
            setIsLoading(false);
            return {
                success: false,
                message: error.response?.data?.message || 'Login Gagal. Cek kredensial dan koneksi.'
            };
        }
    };

    // 4. LOGOUT HANDLER (Memanggil POST /api/auth/logout - Opsional)
    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await api.post(`${BASE_URL}/logout`);
        } catch (error) {
            console.error('Logout failed on server, cleaning local data.', error);
        } finally {
            handleLogoutLocal();
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
        register: handleRegister, // <-- Expose fungsi register
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