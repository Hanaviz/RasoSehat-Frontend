import React from 'react';
import StoreDashboardVerified from './StoreDashboardVerified'; 
import StoreVerificationPending from './StoreVerificationPending'; 

// --- Mock Data untuk penentuan status ---
const mockStoreStatus = {
    // 👈 ATUR DI SINI: TRUE untuk melihat dashboard, FALSE untuk melihat pending
    isVerified: true, 
};
// --- End Mock Data ---


export default function MyStorePage() {
    // Logika penentuan tampilan
    const { isVerified } = mockStoreStatus;

    if (!isVerified) {
        // Tampilkan tampilan Pending
        return <StoreVerificationPending />;
    }

    // Tampilkan tampilan Dashboard Terverifikasi
    return <StoreDashboardVerified />;
}