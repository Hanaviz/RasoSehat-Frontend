import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * - Dipicu setiap pathname berubah
 * - Dieksekusi setelah render frame berikutnya
 * - Aman dengan AnimatePresence + Framer Motion
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto', // jangan pakai smooth untuk route change
      });
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
