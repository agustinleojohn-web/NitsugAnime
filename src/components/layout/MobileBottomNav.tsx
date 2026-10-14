import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Search, Bookmark, History } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { watchlist } = useWatchlist();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Search', href: '/search', icon: Search },
    {
      label: 'Watchlist',
      href: '/watchlist',
      icon: Bookmark,
      badge: watchlist.length > 0 ? watchlist.length : null,
    },
    { label: 'History', href: '/history', icon: History },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090B]/95 backdrop-blur-md border-t border-[#2C2C32] px-2 py-2"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded transition-colors ${
                isActive
                  ? 'text-[#A78BFA] font-bold'
                  : 'text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded bg-[#7C3AED] text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
