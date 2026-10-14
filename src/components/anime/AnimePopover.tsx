import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Play, Plus, Check } from 'lucide-react';
import { NormalizedAnime } from '@/types/anime';
import { useWatchlist } from '@/hooks/useWatchlist';

export interface PopoverAnchor {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface AnimePopoverProps {
  anime: NormalizedAnime;
  anchor: PopoverAnchor;
}

const WIDTH = 300;
const GAP = 8;
const EST_HEIGHT = 360;

export const AnimePopover: React.FC<AnimePopoverProps> = ({ anime, anchor }) => {
  const { contains, toggle } = useWatchlist();
  const inWatchlist = contains(anime.id);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      animeId: anime.id,
      title: anime.title,
      posterUrl: anime.posterUrl,
      type: anime.type,
      scoreFormatted: anime.scoreFormatted,
      hasDub: anime.hasDub,
    });
  };

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const fitsRight = anchor.right + GAP + WIDTH <= vw - GAP;
  const left = fitsRight ? anchor.right + GAP : Math.max(GAP, anchor.left - GAP - WIDTH);
  const top = Math.max(GAP, Math.min(anchor.top, vh - EST_HEIGHT - GAP));

  // Portaled to <body> with fixed positioning so no carousel overflow/transform can clip it.
  // React still bubbles mouse events to the card, so moving onto the popover keeps it open.
  return createPortal(
    <div
      role="tooltip"
      style={{ top, left, width: WIDTH }}
      className="hidden md:block fixed z-[100] bg-[#111113] border border-[#2C2C32] rounded-lg p-4 shadow-2xl shadow-black/60 text-left"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Title */}
      <h3 className="text-sm font-bold text-[#FAFAFA] line-clamp-2 leading-snug">
        {anime.title}
      </h3>

      {/* Badges: Age Rating, HD, CC, Rating - strictly brand colors */}
      <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold">
        {anime.ageRating && (
          <span className="bg-[#18181B] text-[#A1A1AA] px-1.5 py-0.5 rounded border border-[#2C2C32]">
            {anime.ageRating}
          </span>
        )}
        {anime.hasSub && (
          <span className="bg-[#7C3AED] text-white px-1.5 py-0.5 rounded">SUB</span>
        )}
        {anime.hasDub && (
          <span className="bg-[#5B21B6] text-[#EDE9FE] px-1.5 py-0.5 rounded border border-[#7C3AED]/40">DUB</span>
        )}
        {anime.scoreFormatted && (
          <span className="ml-auto text-[#A78BFA] font-bold">
            ★ {anime.scoreFormatted}
          </span>
        )}
      </div>

      {/* Synopsis snippet */}
      {anime.synopsis && (
        <p className="text-xs text-[#A1A1AA] mt-2.5 line-clamp-3 leading-relaxed">{anime.synopsis}</p>
      )}

      {/* Metadata List */}
      <div className="mt-3 pt-2.5 border-t border-[#2C2C32] text-[11px] space-y-1 text-[#A1A1AA]">
        {anime.alternativeTitle && (
          <p className="line-clamp-1">
            <span className="text-[#71717A]">Other names:</span>{' '}
            <span className="text-[#E4E4E7]">{anime.alternativeTitle}</span>
          </p>
        )}

        {anime.scoreFormatted && (
          <p>
            <span className="text-[#71717A]">Score:</span>{' '}
            <span className="text-[#E4E4E7] font-semibold">{anime.scoreFormatted}</span>
          </p>
        )}

        {anime.releaseYear && (
          <p>
            <span className="text-[#71717A]">Year:</span>{' '}
            <span className="text-[#E4E4E7]">{anime.releaseYear}</span>
          </p>
        )}

        {anime.duration && (
          <p>
            <span className="text-[#71717A]">Duration:</span>{' '}
            <span className="text-[#E4E4E7]">{anime.duration}</span>
          </p>
        )}

        <p>
          <span className="text-[#71717A]">Status:</span>{' '}
          <span className="text-[#E4E4E7]">{anime.status}</span>
        </p>

        {anime.genres.length > 0 && (
          <p className="line-clamp-1">
            <span className="text-[#71717A]">Genre:</span>{' '}
            <span className="text-[#A78BFA] font-medium">{anime.genres.slice(0, 3).join(', ')}</span>
          </p>
        )}
      </div>

      {/* Popover Action Buttons */}
      <div className="flex items-center gap-2 mt-3.5 pt-2 border-t border-[#2C2C32]">
        <Link
          to={`/watch/${anime.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#7C3AED] hover:bg-[#8B5CF6] text-white text-xs font-bold py-2 rounded transition-colors shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Watch</span>
        </Link>

        <button
          type="button"
          onClick={handleWatchlist}
          aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          className={`p-2 rounded border transition-colors cursor-pointer ${
            inWatchlist
              ? 'bg-[#7C3AED] text-white border-[#8B5CF6]'
              : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border-[#2C2C32] hover:bg-[#202024]'
          }`}
        >
          {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
    </div>,
    document.body
  );
};
