
import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { NormalizedAnime } from '@/types/anime';
import { AnimeCard } from './AnimeCard';

export type AnimeViewMode = 'grid' | 'list';

export interface AnimeGridProps {
  items: NormalizedAnime[];
  priorityCount?: number;
  className?: string;
  viewMode?: AnimeViewMode;
}

export const AnimeGrid: React.FC<AnimeGridProps> = ({
  items,
  priorityCount = 4,
  className = '',
  viewMode = 'grid',
}) => {
  if (items.length === 0) {
    return (
      <div className={`py-16 text-center ${className}`}>
        <p className="text-lg font-semibold text-white">
          No anime found
        </p>
        <p className="mt-2 text-sm text-white/50">
          Try adjusting your filters.
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {items.map((anime) => (
          <Link
            key={anime.id}
            to={`/watch/${encodeURIComponent(anime.id)}`}
            className="group flex min-w-0 gap-3 rounded-lg border border-white/10 bg-[#111116] p-3 transition-colors hover:border-[#7C3AED]/60 sm:gap-4"
          >
            <img
              src={anime.posterUrl}
              alt={anime.title}
              loading="lazy"
              className="h-28 w-20 shrink-0 rounded-lg object-cover sm:h-36 sm:w-24"
            />

            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <h3 className="line-clamp-2 font-semibold text-white transition-colors group-hover:text-[#A78BFA]">
                {anime.title}
              </h3>

              {anime.alternativeTitle && (
                <p className="mt-1 line-clamp-1 text-xs text-white/45">
                  {anime.alternativeTitle}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/60">
                {anime.type && (
                  <span className="rounded-md bg-white/10 px-2 py-1">
                    {anime.type}
                  </span>
                )}

                {anime.releaseYear && (
                  <span>{anime.releaseYear}</span>
                )}

                {anime.status && (
                  <span>{anime.status}</span>
                )}

                {anime.episodeCount != null && (
                  <span>{anime.episodeCount} eps</span>
                )}
              </div>

              {anime.genres.length > 0 && (
                <p className="mt-2 line-clamp-1 text-xs text-white/50">
                  {anime.genres.join(' · ')}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                {anime.score != null && (
                  <span className="inline-flex items-center gap-1 text-amber-400">
                    <Star size={13} fill="currentColor" />
                    {anime.scoreFormatted ?? anime.score}
                  </span>
                )}

                {anime.hasSub && (
                  <span className="text-[#A78BFA]">SUB</span>
                )}

                {anime.hasDub && (
                  <span className="text-white/60">DUB</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`spotlight-grid grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 ${className}`}
    >
      {items.map((anime, index) => (
        <div key={anime.id} className="h-full min-w-0">
          <AnimeCard
            anime={anime}
            priority={index < priorityCount}
          />
        </div>
      ))}
    </div>
  );
};
