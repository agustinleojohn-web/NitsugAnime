import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const positions = new Map<string, number>();
const MAX_RESTORE_FRAMES = 40;

/**
 * Single scroll owner for the app.
 * - PUSH/REPLACE to a different pathname: jump to top.
 * - Query-string-only change (same pathname): leave scroll alone.
 * - POP (Back/Forward): restore the position saved for that history entry once the page is tall enough.
 */
export function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const keyRef = useRef(location.key);
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => positions.set(keyRef.current, window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      window.history.scrollRestoration = prev;
    };
  }, []);

  useLayoutEffect(() => {
    keyRef.current = location.key;
    const pathChanged = prevPath.current !== null && prevPath.current !== location.pathname;
    const first = prevPath.current === null;
    prevPath.current = location.pathname;

    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }

    if (navType === 'POP') {
      const target = positions.get(location.key) ?? 0;
      let frames = 0;
      let raf = 0;
      const attempt = () => {
        window.scrollTo(0, target);
        const reached = Math.abs(window.scrollY - target) < 2;
        if (!reached && frames++ < MAX_RESTORE_FRAMES) raf = requestAnimationFrame(attempt);
      };
      attempt();
      return () => cancelAnimationFrame(raf);
    }

    if (first || pathChanged) window.scrollTo(0, 0);
  }, [location.key, location.pathname, location.hash, navType]);

  return null;
}
