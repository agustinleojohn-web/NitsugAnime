import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Bookmark, History, Settings, Tv } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { NavSearch } from '@/components/search/NavSearch';

export const Header: React.FC = () => {
  const location = useLocation();
  const { watchlist } = useWatchlist();
  const navLinks = [
    { label: 'Home', href: '/', icon: Tv },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Watchlist', href: '/watchlist', icon: Bookmark, badge: watchlist.length > 0 ? watchlist.length : null },
    { label: 'History', href: '/history', icon: History },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#09090B]/95 backdrop-blur-md border-b border-[#2C2C32]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link
  to="/"
  aria-label="NitsugAnime Home"
  className="group flex shrink-0 items-center"
>
  <img
    src="/logo.webp"
    alt="NitsugAnime"
    width={500}
    height={333}
    className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
  />
</Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`relative px-3.5 py-1.5 text-sm font-semibold rounded transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'text-[#FAFAFA] bg-[#18181B]'
                        : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#111113]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-[#7C3AED] text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Search bar & Settings */}
          <div className="flex items-center gap-2.5">
            <NavSearch />

            {/* Settings link */}
            <Link
              to="/settings"
              aria-label="Settings"
              className={`p-2 rounded border transition-colors ${
                location.pathname === '/settings'
                  ? 'bg-[#18181B] text-[#FAFAFA] border-[#7C3AED]'
                  : 'bg-[#111113] text-[#A1A1AA] border-[#2C2C32] hover:text-[#FAFAFA] hover:border-[#7C3AED]/50'
              }`}
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

    </>
  );
};
