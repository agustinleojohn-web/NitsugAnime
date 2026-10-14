import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Play } from 'lucide-react';
import { NormalizedAnime } from '@/types/anime';
import {
  ANIKOTO_TOP_ANIME_DAY,
  ANIKOTO_TOP_ANIME_WEEK,
  ANIKOTO_TOP_ANIME_MONTH,
} from '@/data/topAnimeData';

export interface TopAnimeSidebarProps {
  animeList?: NormalizedAnime[];
}

export const TopAnimeSidebar: React.FC<TopAnimeSidebarProps> = () => {
  const [filterPeriod, setFilterPeriod] = useState<'day' | 'week' | 'month'>('day');

  // Exact real Anikoto top anime lists matching Anikoto day/week/month tabs
  const top10 = useMemo(() => {
    if (filterPeriod === 'day') {
      return ANIKOTO_TOP_ANIME_DAY;
    }
    if (filterPeriod === 'week') {
      return ANIKOTO_TOP_ANIME_WEEK;
    }
    return ANIKOTO_TOP_ANIME_MONTH;
  }, [filterPeriod]);

  const numberOne = top10[0];
  const restRanked = top10.slice(1);

  return (
    <aside className="w-full flex flex-col gap-3">
      {/* Sidebar Header with Day, Week, Month toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-[#FAFAFA] tracking-tight">Top anime</h2>

        <div className="flex items-center bg-[#111113] border border-[#2C2C32] rounded p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilterPeriod('day')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filterPeriod === 'day'
                ? 'bg-[#7C3AED] text-white shadow-sm font-bold'
                : 'text-[#71717A] hover:text-[#FAFAFA]'
            }`}
          >
            Day
          </button>
          <button
            type="button"
            onClick={() => setFilterPeriod('week')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filterPeriod === 'week'
                ? 'bg-[#7C3AED] text-white shadow-sm font-bold'
                : 'text-[#71717A] hover:text-[#FAFAFA]'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setFilterPeriod('month')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filterPeriod === 'month'
                ? 'bg-[#7C3AED] text-white shadow-sm font-bold'
                : 'text-[#71717A] hover:text-[#FAFAFA]'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* #1 MOST WATCHED Highlighted Card (brand purple glow) */}
      {numberOne && (
        <Link
          to={`/watch/${numberOne.id}`}
          className="group relative rounded border border-[#2C2C32] bg-[#111113] overflow-hidden p-3.5 flex items-center gap-3.5 hover:border-[#7C3AED]/70 transition-all shadow-lg"
        >
          <div className="absolute inset-0 bg-radial from-[#7C3AED]/15 to-transparent pointer-events-none" />

          {/* Mini Poster */}
          <div className="relative w-16 h-22 rounded overflow-hidden bg-[#18181B] border border-[#2C2C32] shrink-0">
            <img
              src={numberOne.posterUrl}
              alt={numberOne.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-4 h-4 fill-white text-white" />
            </div>
          </div>

          {/* Details */}
          <div className="relative z-10 flex-1 min-w-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#A78BFA] block mb-1">
              #1 MOST WATCHED
            </span>
            <h3 className="text-sm font-bold text-[#FAFAFA] truncate group-hover:text-[#A78BFA] transition-colors">
              {numberOne.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold">
              <span className="bg-[#7C3AED] text-white px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <span>CC</span>
                <span>{numberOne.isSubCount || numberOne.episodeCount || 1}</span>
              </span>
              {numberOne.hasDub && (
                <span className="bg-[#5B21B6] text-[#EDE9FE] px-1.5 py-0.5 rounded border border-[#7C3AED]/40 flex items-center gap-0.5">
                  <Mic className="w-2.5 h-2.5" />
                  <span>{numberOne.isDubCount || 1}</span>
                </span>
              )}
              <span className="text-[#A1A1AA] uppercase">{numberOne.type || 'TV'}</span>
            </div>
          </div>
        </Link>
      )}

      {/* #2 through #10 Ranked List */}
      <div className="flex flex-col gap-2">
        {restRanked.map((anime, index) => {
          const rank = index + 2;
          const isTopThree = rank <= 3;
          const subCount = anime.isSubCount || anime.episodeCount || 1;
          const dubCount = anime.isDubCount || 0;

          return (
            <Link
              key={`${filterPeriod}-${anime.id}-${rank}`}
              to={`/watch/${anime.id}`}
              className="group flex items-center gap-3 p-2 rounded bg-[#111113] hover:bg-[#18181B] border border-[#2C2C32] hover:border-[#7C3AED]/50 transition-all"
            >
              <span
                className={`w-5 text-center text-sm font-extrabold shrink-0 ${
                  isTopThree ? 'text-[#A78BFA]' : 'text-[#71717A]'
                }`}
              >
                {rank}
              </span>

              <div className="w-10 h-13 rounded overflow-hidden bg-[#18181B] shrink-0 border border-[#2C2C32]">
                <img
                  src={anime.posterUrl}
                  alt={anime.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-[#FAFAFA] truncate group-hover:text-[#A78BFA] transition-colors">
                  {anime.title}
                </h4>

                <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold">
                  {subCount > 0 && (
                    <span className="bg-[#7C3AED] text-white px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <span>CC</span>
                      <span>{subCount}</span>
                    </span>
                  )}
                  {dubCount > 0 && (
                    <span className="bg-[#5B21B6] text-[#EDE9FE] px-1.5 py-0.5 rounded border border-[#7C3AED]/40 flex items-center gap-0.5">
                      <Mic className="w-2 h-2" />
                      <span>{dubCount}</span>
                    </span>
                  )}
                  <span className="text-[#71717A] uppercase text-[9px]">{anime.type || 'TV'}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};
