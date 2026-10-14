import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { NormalizedAnime } from '@/types/anime';
import { AnimePopover, PopoverAnchor } from './AnimePopover';

export interface AnimeCardProps {
  anime: NormalizedAnime;
  priority?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, priority = false }) => {
  const [imgError, setImgError] = useState(false);
  const [anchor, setAnchor] = useState<PopoverAnchor | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const fallbackPoster = '/Neon Purple Anime Placeholder Poster-optimized.webp';

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setAnchor({ top: r.top, left: r.left, right: r.right, bottom: r.bottom });
  };

  // Any scroll (page or carousel track) invalidates the measured anchor.
  useEffect(() => {
    if (!anchor) return;
    const close = () => setAnchor(null);
    window.addEventListener('scroll', close, { capture: true, passive: true });
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, { capture: true });
      window.removeEventListener('resize', close);
    };
  }, [anchor]);

  const subCount = anime.isSubCount > 0 ? anime.isSubCount : anime.hasSub ? (anime.episodeCount || 1) : 0;
  const dubCount = anime.isDubCount > 0 ? anime.isDubCount : anime.hasDub ? (anime.episodeCount || 1) : 0;
  const totalCount = anime.episodeCount || Math.max(subCount, dubCount, 1);

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setAnchor(null)}
      className="anime-card-item relative h-full flex flex-col justify-between group transition-all duration-300"
    >
      <Link
        to={`/watch/${anime.id}`}
        className="flex flex-col h-full rounded bg-[#111113] border border-[#2C2C32] overflow-hidden hover:border-[#7C3AED]/70 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
      >
        {/* Poster Image Container - Fixed Aspect Ratio */}
        <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-[#18181B]">
          <img
            src={imgError ? fallbackPoster : anime.posterUrl}
            alt={anime.title}
            loading={priority ? 'eager' : 'lazy'}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          

          {/* Bottom Badge Strip: strictly brand purple and dark slate */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[10px] font-bold pointer-events-none">
            <div className="flex items-center gap-1">
              {subCount > 0 && (
                <span className="flex items-center gap-0.5 bg-[#7C3AED] text-white px-1.5 py-0.5 rounded shadow-sm">
                  <span className="text-[9px]">CC</span>
                  <span>{subCount}</span>
                </span>
              )}

              {dubCount > 0 && (
                <span className="flex items-center gap-0.5 bg-[#5B21B6] text-[#EDE9FE] px-1.5 py-0.5 rounded border border-[#7C3AED]/40 shadow-sm">
                  <Mic className="w-2.5 h-2.5" />
                  <span>{dubCount}</span>
                </span>
              )}

              {totalCount > 0 && (
                <span className="bg-[#27272A] text-[#A1A1AA] px-1.5 py-0.5 rounded">
                  {totalCount}
                </span>
              )}
            </div>

            <span className="text-[#A1A1AA] text-[10px] uppercase font-semibold tracking-wider">
              {anime.type !== 'Unknown' ? anime.type : ''}
            </span>
          </div>
        </div>

        {/* Title area with fixed min-height for perfectly uniform card heights */}
        <div className="p-2.5 flex-1 flex flex-col justify-start min-h-[3rem]">
          <h3
            className="text-xs sm:text-[13px] font-medium text-[#E4E4E7] line-clamp-2 leading-snug group-hover:text-[#A78BFA] transition-colors"
            title={anime.title}
          >
            {anime.title}
          </h3>
        </div>
      </Link>

      {/* Popover on hover with rating and details */}
      {anchor && <AnimePopover anime={anime} anchor={anchor} />}
    </div>
  );
};
