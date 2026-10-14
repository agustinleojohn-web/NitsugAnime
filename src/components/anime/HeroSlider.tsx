import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Bookmark, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { NormalizedAnime } from '@/types/anime';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Button } from '@/components/ui/Button';

export interface HeroSliderProps {
  slides: NormalizedAnime[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { contains, toggle } = useWatchlist();

  const activeSlides = slides.slice(0, 10);
  const total = activeSlides.length;

  const nextSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay timer: changes slide every 5.5s unless hovered
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, total, nextSlide]);

  if (total === 0) return null;

  const current = activeSlides[currentIndex];
  const inWatchlist = contains(current.id);

  const handleWatchlist = () => {
    toggle({
      animeId: current.id,
      title: current.title,
      posterUrl: current.posterUrl,
      type: current.type,
      scoreFormatted: current.scoreFormatted,
      hasDub: current.hasDub,
    });
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-lg overflow-hidden min-h-[380px] sm:min-h-[440px] md:min-h-[480px] flex items-end shadow-2xl group"
    >
      {/* Background Banner with Smooth Fade Transition */}
      {activeSlides.map((anime, idx) => {
        const isActive = idx === currentIndex;
        const banner = anime.bannerUrl || anime.posterUrl;

        return (
          <div
            key={anime.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={banner}
              alt=""
              className="w-full h-full object-cover object-top opacity-50 filter brightness-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/45 to-transparent" />
          </div>
        );
      })}

      {/* Hero Content */}
      <div className="relative z-10 p-5 sm:p-7 md:p-9 max-w-2xl flex flex-col gap-3">
        {/* Top Tag Badges strictly brand purple & neutral dark */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#A78BFA] bg-[#7C3AED]/20 border border-[#7C3AED]/40 px-2.5 py-0.5 rounded">
            <Sparkles className="w-3 h-3 text-[#A78BFA]" />
            Top #{currentIndex + 1}
          </span>
         
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#FAFAFA] leading-tight line-clamp-2">
          {current.title}
        </h1>

        {/* Synopsis Excerpt */}
        <p className="text-xs sm:text-sm text-[#A1A1AA] line-clamp-3 leading-relaxed">
          {current.synopsis}
        </p>

        {/* Genre Tags */}
       
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] font-bold text-[#A1A1AA] bg-[#18181B] border border-[#2C2C32] px-2 py-0.5 rounded">
            {current.type || 'TV'}
          </span>
          {current.scoreFormatted && (
            <span className="text-[11px] font-bold text-[#A78BFA] bg-[#7C3AED]/20 border border-[#7C3AED]/40 px-2 py-0.5 rounded flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {current.scoreFormatted}
            </span>
          )}
          {current.hasSub && (
            <span className="text-[10px] font-bold text-white bg-[#7C3AED]/40 px-1.5 py-0.5 rounded">
              SUB
            </span>
          )}
          {current.hasDub && (
            <span className="text-[10px] font-bold text-[#EDE9FE] bg-[#5B21B6] border border-[#7C3AED]/40 px-1.5 py-0.5 rounded">
              DUB
            </span>
          )}
          </div>
      

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <Link to={`/watch/${current.id}`}>
            <Button variant="primary" size="md" icon={<Play className="w-4 h-4 fill-current" />}>
              Watch Now
            </Button>
          </Link>

          <Link to={`/watch/${current.id}`}>
            <Button variant="secondary" size="md" icon={<Info className="w-4 h-4" />}>
              Details
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="md"
            onClick={handleWatchlist}
            icon={<Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-current text-[#A78BFA]' : ''}`} />}
          >
            {inWatchlist ? 'Saved' : 'Watchlist'}
          </Button>
        </div>
      </div>

      {/* Prev / Next Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous featured anime"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded bg-black/60 hover:bg-[#7C3AED] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-[#2C2C32] cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next featured anime"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded bg-black/60 hover:bg-[#7C3AED] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-[#2C2C32] cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicator Dots (1..10) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-[#2C2C32]">
        {activeSlides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded transition-all cursor-pointer ${
              i === currentIndex ? 'w-5 bg-[#7C3AED]' : 'w-1.5 bg-[#3F3F46] hover:bg-[#71717A]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
