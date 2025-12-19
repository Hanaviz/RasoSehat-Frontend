import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop - Smooth Alternative
 * Scroll bertahap yang sinkron dengan animasi page transition
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  const prevLocationRef = useRef('');

  useEffect(() => {
    const currentLocation = pathname + search;
    
    // Cek apakah benar-benar berpindah route
    if (prevLocationRef.current !== currentLocation) {
      prevLocationRef.current = currentLocation;

      // Metode 1: Instant scroll (recommended untuk route changes)
      // Delay minimal untuk menunggu DOM update
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant',
          });
        });
      });

      // Metode 2: Smooth scroll (optional, uncomment jika ingin smooth)
      /*
      const scrollToTop = () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll > 0) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        }
      };

      // Delay untuk menunggu exit animation selesai
      const timeoutId = setTimeout(scrollToTop, 100);
      return () => clearTimeout(timeoutId);
      */
    }
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;