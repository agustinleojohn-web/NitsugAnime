import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Play, Star } from 'lucide-react';
import { NormalizedAnime } from '@/types/anime';

export interface SeriesDetailsBottomProps {
  anime: NormalizedAnime;
  catalog?: NormalizedAnime[];
}

const SYNOPSIS_LIMIT = 320;

const Chip: React.FC<{ children: React.ReactNode; tone?: 'plain' | 'accent' }> = ({ children, tone = 'plain' }) => (
  <span
    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
      tone === 'accent' ? 'bg-[#7C3AED] text-white border-[#8B5CF6]' : 'bg-[#18181B] text-[#A1A1AA] border-[#2C2C32]'
    }`}
  >
    {children}
  </span>
);

const Row: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) =>
  children ? (
    <p className="text-xs leading-relaxed text-[#A1A1AA]">
      <span className="text-[#71717A]">{label}:</span> <span className="text-[#E4E4E7]">{children}</span>
    </p>
  ) : null;

const LinkList: React.FC<{ items: string[]; param?: string }> = ({ items, param }) => (
  <>
    {items.map((g, i) => (
      <React.Fragment key={g}>
        {i > 0 && ', '}
        {param ? (
          <Link to={`/explore?${param}=${encodeURIComponent(g)}`} className="text-[#A78BFA] hover:underline">
            {g}
          </Link>
        ) : (
          g
        )}
      </React.Fragment>
    ))}
  </>
);

export const SeriesDetailsBottom: React.FC<SeriesDetailsBottomProps> = ({ anime, catalog = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const long = anime.synopsis.length > SYNOPSIS_LIMIT;
  const text = long && !expanded ? `${anime.synopsis.slice(0, SYNOPSIS_LIMIT).trimEnd()}...` : anime.synopsis;

  const relatedFranchise = React.useMemo(() => {
    const root = anime.title.split(':')[0].split(/season|part|\d+(st|nd|rd|th)/i)[0].trim().toLowerCase();
    if (root.length < 4) return [];
    return catalog.filter((a) => a.id !== anime.id && a.title.toLowerCase().includes(root)).slice(0, 10);
  }, [anime, catalog]);

  const premiered = [anime.season, anime.releaseYear].filter(Boolean).join(' ');

  return (
    <section aria-label="Anime details" className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-[10rem_minmax(0,1fr)] lg:grid-cols-[10.5rem_minmax(0,1fr)_16rem] gap-5 items-start">
        <img
          src={anime.posterUrl}
          alt={anime.title}
          className="w-32 md:w-full aspect-[3/4.2] object-cover rounded-lg border border-[#2C2C32] bg-[#18181B]"
        />

        <div className="min-w-0 flex flex-col gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-[#FAFAFA] leading-tight">{anime.title}</h1>
          {(anime.alternativeTitle || anime.nativeTitle) && (
            <p className="text-xs italic text-[#A1A1AA]">
              {[anime.alternativeTitle, anime.nativeTitle].filter(Boolean).join(';')}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            {anime.ageRating && <Chip>{anime.ageRating}</Chip>}
            {anime.hasSub && <Chip tone="accent">SUB</Chip>}
            {anime.hasDub && <Chip>DUB</Chip>}
          </div>

          {anime.synopsis && (
            <p className="text-[13px] leading-relaxed text-[#A1A1AA]">
              {text}{' '}
              {long && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="text-[#A78BFA] hover:underline cursor-pointer"
                >
                  [{expanded ? 'less' : 'more'}]
                </button>
              )}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 pt-1">
            <div className="flex flex-col gap-1">
              <Row label="Type">{anime.type !== 'Unknown' ? anime.type : undefined}</Row>
              <Row label="Premiered">{premiered || undefined}</Row>
              <Row label="Aired">{anime.aired}</Row>
              <Row label="Status">{anime.status !== 'Unknown' ? anime.status : undefined}</Row>
              <Row label="Genres">{anime.genres.length ? <LinkList items={anime.genres} param="genre" /> : undefined}</Row>
            </div>
            <div className="flex flex-col gap-1">
              <Row label="Score">{anime.scoreFormatted}</Row>
              <Row label="Duration">{anime.duration}</Row>
              <Row label="Episodes">{anime.episodeCount}</Row>
              <Row label="Source">{anime.source}</Row>
              <Row label="Studios">{anime.studios.length ? <LinkList items={anime.studios} /> : undefined}</Row>
              <Row label="Producers">{anime.producers.length ? <LinkList items={anime.producers} /> : undefined}</Row>
            </div>
          </div>
        </div>

        {anime.scoreFormatted && (
          <div className="md:col-span-2 lg:col-span-1 bg-[#111113] border border-[#2C2C32] rounded-lg p-5 flex flex-col items-center gap-2 text-center">
            <p className="text-3xl font-bold text-[#A78BFA]">
              {anime.scoreFormatted}
              <span className="text-base text-[#71717A]"> /10</span>
            </p>
            <div className="flex items-center gap-0.5" aria-hidden="true">
              {[2, 4, 6, 8, 10].map((n) => (
                <Star key={n} className={`w-5 h-5 ${(anime.score ?? 0) >= n - 1 ? 'fill-[#7C3AED] text-[#7C3AED]' : 'text-[#3F3F46]'}`} />
              ))}
            </div>
            <p className="text-[11px] text-[#71717A]">Catalog score for this title</p>
          </div>
        )}
      </div>

      {relatedFranchise.length > 0 && (
        <div className="border-t border-[#2C2C32] pt-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="text-sm font-bold text-[#FAFAFA]">Possibly related (matched by title)</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {relatedFranchise.map((item) => (
              <Link
                key={item.id}
                to={`/watch/${item.id}`}
                className="group flex flex-col bg-[#18181B] border border-[#2C2C32] rounded-lg overflow-hidden hover:border-[#7C3AED]/70 transition-colors p-2.5"
              >
                <div className="relative aspect-[3/4] w-full rounded-md overflow-hidden bg-[#202024] mb-2">
                  <img src={item.posterUrl} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </div>
                </div>
                <h3 className="text-xs font-semibold text-[#FAFAFA] truncate group-hover:text-[#A78BFA]">{item.title}</h3>
                <div className="flex items-center justify-between text-[10px] text-[#71717A] mt-1">
                  <span className="uppercase">{item.type !== 'Unknown' ? item.type : ''}</span>
                  {item.releaseYear && <span>{item.releaseYear}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
