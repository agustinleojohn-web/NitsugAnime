import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Bookmark, Star, Sparkles } from 'lucide-react';
import { NormalizedAnime } from '@/types/anime';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface FeaturedAnimeProps {
  anime: NormalizedAnime;
}

export const FeaturedAnime: React.FC<FeaturedAnimeProps> = ({ anime }) => {
  const { contains, toggle } = useWatchlist();
  const inWatchlist = contains(anime.id);
  const [bannerError, setBannerError] = useState(false);

  const heroImage = !bannerError && anime.bannerUrl ? anime.bannerUrl : anime.posterUrl;

  const handleWatchlistToggle = () => {
    toggle({
      animeId: anime.id,
      title: anime.title,
      posterUrl: anime.posterUrl,
      type: anime.type,
      scoreFormatted: anime.scoreFormatted,
      hasDub: anime.hasDub,
    });
  };

  return (
    <div className="relative w-full rounded overflow-hidden border border-[#2C2C32] bg-[#111113] min-h-[360px] md:min-h-[460px] lg:min-h-[500px] flex items-end">
      {/* Background Hero Banner */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={anime.title}
          onError={() => setBannerError(true)}
          className="w-full h-full object-cover object-top opacity-50 filter brightness-90 transition-transform duration-700 hover:scale-105"
        />
        {/* Cinematic Multi-stop Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/70 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-5 md:p-8 lg:p-10 max-w-3xl flex flex-col gap-3">
        {/* Featured Tag & Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="accent" icon={<Sparkles className="w-3 h-3 text-[#A78BFA]" />}>
            Featured Spotlight
          </Badge>
          <Badge variant="type">{anime.type || 'TV Series'}</Badge>
          {anime.scoreFormatted && (
            <Badge variant="score" icon={<Star className="w-3 h-3 fill-current" />}>
              Score {anime.scoreFormatted}
            </Badge>
          )}
          {anime.hasSub && <Badge variant="sub">SUB</Badge>}
          {anime.hasDub && <Badge variant="dub">DUB</Badge>}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#FAFAFA] leading-tight">
          {anime.title}
        </h1>

        {/* Synopsis */}
        <p className="text-xs sm:text-sm md:text-base text-[#A1A1AA] line-clamp-3 md:line-clamp-4 leading-relaxed max-w-2xl">
          {anime.synopsis}
        </p>

        {/* Genres */}
        {anime.genres.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {anime.genres.slice(0, 4).map((genre) => (
              <span
                key={genre}
                className="text-xs text-[#FAFAFA] bg-[#18181B]/80 border border-[#2C2C32] px-2.5 py-1 rounded"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3 flex-wrap">
          <Link to={`/watch/${anime.id}`}>
            <Button variant="primary" size="lg" icon={<Play className="w-5 h-5 fill-current" />}>
              Start Watching
            </Button>
          </Link>

          <Link to={`/watch/${anime.id}`}>
            <Button variant="secondary" size="lg" icon={<Info className="w-5 h-5" />}>
              View Details
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleWatchlistToggle}
            icon={<Bookmark className={`w-5 h-5 ${inWatchlist ? 'fill-current text-[#A78BFA]' : ''}`} />}
          >
            {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          </Button>
        </div>
      </div>
    </div>
  );
};
