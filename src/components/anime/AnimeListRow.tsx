import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Mic, Subtitles } from 'lucide-react';
import { NormalizedAnime } from '@/types/anime';

export const AnimeListRow: React.FC<{ anime: NormalizedAnime }> = ({ anime }) => {
  const meta = [anime.type, anime.releaseYear, anime.status, anime.episodeCount ? `${anime.episodeCount} eps` : null].filter(Boolean);
  return (
    <Link
      to={`/watch/${anime.id}`}
      className="group flex gap-3 p-2 rounded-lg bg-[#111113] border border-[#2C2C32] hover:border-[#7C3AED]/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
    >
      <img src={anime.posterUrl} alt="" loading="lazy" width={64} height={90} className="w-14 h-20 sm:w-16 sm:h-[5.5rem] rounded object-cover bg-[#18181B] shrink-0" />
      <div className="min-w-0 flex-1 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-[#FAFAFA] truncate group-hover:text-[#A78BFA]">{anime.title}</h3>
        {anime.alternativeTitle && <p className="text-xs text-[#71717A] truncate">{anime.alternativeTitle}</p>}
        <p className="text-xs text-[#A1A1AA] truncate">{meta.join(' · ')}</p>
        {anime.genres.length > 0 && <p className="text-[11px] text-[#71717A] truncate">{anime.genres.join(', ')}</p>}
        <div className="mt-auto flex items-center gap-2 text-[11px] font-semibold">
          {anime.score !== undefined && (
            <span className="inline-flex items-center gap-1 text-[#FBBF24]"><Star className="w-3 h-3 fill-current" />{anime.score.toFixed(2)}</span>
          )}
          {anime.hasSub && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#7C3AED] text-white"><Subtitles className="w-3 h-3" />Sub</span>}
          {anime.hasDub && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#5B21B6] text-[#EDE9FE]"><Mic className="w-3 h-3" />Dub</span>}
        </div>
      </div>
    </Link>
  );
};
