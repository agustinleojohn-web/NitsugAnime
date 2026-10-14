import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Play, Mic } from 'lucide-react';
import { NormalizedAnime } from '@/types/anime';

export interface RelatedAnimeSidebarProps {
  currentAnime: NormalizedAnime;
  relatedList: NormalizedAnime[];
}

export const RelatedAnimeSidebar: React.FC<RelatedAnimeSidebarProps> = ({
  currentAnime,
  relatedList,
}) => {
  // Filter out the current show
  const filtered = relatedList
    .filter((a) => a.id !== currentAnime.id)
    .slice(0, 10);

  if (filtered.length === 0) return null;

  return (
    <aside className="bg-[#111113] border border-[#2C2C32] rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[#2C2C32] pb-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#7C3AED]" />
          <h3 className="text-sm font-bold text-[#FAFAFA]">Related Anime</h3>
        </div>
        <span className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider">
          Similar genres
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.map((anime) => {
          const subCount = anime.isSubCount || anime.episodeCount || 1;
          const dubCount = anime.isDubCount || 0;

          return (
            <Link
              key={anime.id}
              to={`/watch/${anime.id}`}
              className="group flex items-center gap-3 p-2 rounded bg-[#18181B] hover:bg-[#202024] border border-[#2C2C32] hover:border-[#7C3AED]/70 transition-all"
            >
              {/* Mini Poster */}
              <div className="relative w-11 h-14 rounded-md overflow-hidden bg-[#202024] shrink-0 border border-[#2C2C32]">
                <img
                  src={anime.posterUrl}
                  alt={anime.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                </div>
              </div>

              {/* Title & Metadata */}
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
                  {anime.scoreFormatted && (
                    <span className="text-[#A78BFA] ml-auto">★ {anime.scoreFormatted}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};
