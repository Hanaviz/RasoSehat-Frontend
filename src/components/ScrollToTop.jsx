import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ScrollToTop: robustly scrolls the window and common scrollable containers to top
export default function ScrollToTop({ behavior = 'auto' }) {
  const { pathname } = useLocation();

  // Prefer manual scroll restoration to avoid the browser restoring previous scroll.
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch (e) {}
  }, []);

  // Use layout effect so scrolling happens before paint on route change.
  useLayoutEffect(() => {
    // Primary: window/document scrolling element
    try {
      if (typeof window !== 'undefined' && window.scrollTo) {
        window.scrollTo({ top: 0, left: 0, behavior });
      }
    } catch (e) {
      try { window.scrollTo(0, 0); } catch (e2) { /* ignore */ }
    }

    // Also ensure common layout containers are reset (some layouts use <main> or root element with overflow)
    try {
      const scrollTargets = [document.scrollingElement, document.documentElement, document.body, document.querySelector('main'), document.getElementById('root')];
      for (const t of scrollTargets) {
        if (t && typeof t.scrollTop === 'number') {
          try { t.scrollTop = 0; } catch (e) {}
        }
      }
    } catch (e) { /* ignore */ }

    // Dev logging to help debugging issues where scroll doesn't happen
    try {
      if (import.meta.env.DEV) console.debug('[ScrollToTop] scrolled to top for pathname=', pathname);
    } catch (e) {}
  }, [pathname, behavior]);

  return null;
}
