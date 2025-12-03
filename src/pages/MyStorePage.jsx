import React, { useEffect, useState } from 'react';
import StoreDashboardVerified from './StoreDashboardVerified';
import StoreVerificationPending from './StoreVerificationPending';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function MyStorePage() {
        const { user, isAuthenticated } = useAuth();
        const [loading, setLoading] = useState(true);
        const [store, setStore] = useState(null);
        const [menus, setMenus] = useState([]);
        const [error, setError] = useState('');

        useEffect(() => {
                const fetch = async () => {
                        if (!isAuthenticated || !user) {
                                setLoading(false);
                                return;
                        }
                        try {
                                setLoading(true);
                                const res = await api.get(`/restaurants/user/${encodeURIComponent(user.id)}`);
                                const data = res.data?.data || [];
                                if (Array.isArray(data) && data.length) {
                                        // prefer first store
                                        const s = data[0];
                                        setStore(s);
                                        // try to load menus for this restaurant (non-blocking)
                                        try {
                                                const menusRes = await api.get(`/menus/restaurant/${encodeURIComponent(s.id)}`);
                                                setMenus(menusRes.data?.data || []);
                                        } catch (e) {
                                                // ignore menu fetch errors
                                                setMenus([]);
                                        }
                                } else {
                                        setStore(null);
                                }
                        } catch (err) {
                                console.error('Failed to fetch stores for user', err);
                                setError('Gagal memuat data toko.');
                        } finally {
                                setLoading(false);
                        }
                };

                fetch();
        }, [isAuthenticated, user]);

        if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat data toko...</div>;
        if (error) return <div className="p-6 text-red-600">{error}</div>;

        if (!store) {
                // keep original pending UI when no store exists (user should register a store)
                return <StoreVerificationPending />;
        }

        // Determine verification status
        const isVerified = store.status_verifikasi === 'disetujui';

        if (!isVerified) {
                return <StoreVerificationPending />;
        }

        return <StoreDashboardVerified store={store} menus={menus} />;
}