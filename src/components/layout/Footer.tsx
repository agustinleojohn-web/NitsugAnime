import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Film, ExternalLink, Sparkles, Tv, Download } from 'lucide-react';
import { AZList } from '@/components/anime/AZList';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#09090B] border-t border-[#2C2C32] mt-20 pt-10 pb-24 md:pb-14 text-[#FAFAFA]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        {/* 1. Top Section: A-Z Index in Footer */}
        <div className="bg-[#111113] border border-[#2C2C32] rounded p-5 shadow-lg">
          <AZList />
        </div>

        {/* 2. Middle Section: Brand Column + Navigation Links + Featured Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pt-2">
          {/* Brand Info (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            <Link to="/" className="flex items-center ">
                         <img src="/logo.webp" alt="NitsugAnime" className="w-64 transition-transform hover:scale-105">
                           
                         </img>
                       
                       </Link>

            <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-sm">
              Discover and stream thousands of anime episodes and movies with crystal clear quality, fast playback, and private local tracking. No subscription walls or disruptive overlays.
            </p>

           
          </div>

          {/* Quick Links (2 columns) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAFAFA]">
              Discovery
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-[#A1A1AA]">
              <Link to="/" className="hover:text-[#A78BFA] transition-colors flex items-center gap-1.5">
                <span>Home</span>
              </Link>
              <Link to="/explore" className="hover:text-[#A78BFA] transition-colors flex items-center gap-1.5">
                <span>Anime Catalog</span>
              </Link>
              <Link to="/search" className="hover:text-[#A78BFA] transition-colors flex items-center gap-1.5">
                <span>Search Titles</span>
              </Link>
              <Link to="/explore?type=movie" className="hover:text-[#A78BFA] transition-colors">
                <span>Anime Movies</span>
              </Link>
              <Link to="/explore?status=finished+airing" className="hover:text-[#A78BFA] transition-colors">
                <span>Completed Series</span>
              </Link>
            </div>
          </div>

          {/* User Features (2 columns) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAFAFA]">
              Personal
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-[#A1A1AA]">
              <Link to="/watchlist" className="hover:text-[#A78BFA] transition-colors flex items-center gap-1.5">
                <span>My Watchlist</span>
              </Link>
              <Link to="/history" className="hover:text-[#A78BFA] transition-colors flex items-center gap-1.5">
                <span>Watch History</span>
              </Link>
              <Link to="/settings" className="hover:text-[#A78BFA] transition-colors flex items-center gap-1.5">
                <span>Player Settings</span>
              </Link>
            </div>
          </div>

          {/* Featured Resources (3 columns) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAFAFA]">
                Featured Resources
              </h4>
            </div>
            <p className="text-[11px] text-[#71717A]">
              Recommended entertainment hubs:
            </p>
            <div className="flex flex-col gap-2.5">
              <a
                href="https://juan4-all.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded bg-[#111113] hover:bg-[#18181B] border border-[#2C2C32] hover:border-[#7C3AED]/70 transition-all text-xs text-[#FAFAFA] shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center shrink-0">
                    <Film className="w-3.5 h-3.5 text-[#A78BFA]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold group-hover:text-[#A78BFA] transition-colors truncate">
                      Watch Movies & TV Series
                    </span>
                    <span className="text-[10px] text-[#71717A] truncate">Juan4All</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#A78BFA] shrink-0 transition-colors ml-2" />
              </a>

              <a
                href="https://chillax-mocha.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded bg-[#111113] hover:bg-[#18181B] border border-[#2C2C32] hover:border-[#7C3AED]/70 transition-all text-xs text-[#FAFAFA] shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center shrink-0">
                    <Download className="w-3.5 h-3.5 text-[#A78BFA]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold group-hover:text-[#A78BFA] transition-colors truncate">
                      Download Movies
                    </span>
                    <span className="text-[10px] text-[#71717A] truncate">Chillax</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#A78BFA] shrink-0 transition-colors ml-2" />
              </a>
            </div>
          </div>
        </div>

        {/* 3. Bottom Legal & Disclaimer Bar */}
        <div className="border-t border-[#2C2C32] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#71717A]">
          <p>
            &copy; {new Date().getFullYear()} NitsugAnime. All rights reserved.
          </p>
          <p className="text-center sm:text-right max-w-md">
            NitsugAnime does not store media files on its servers. All videos and stream embeds are provided by non-affiliated third parties.
          </p>
        </div>
      </div>
    </footer>
  );
};
