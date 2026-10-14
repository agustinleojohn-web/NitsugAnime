import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NormalizedAnime } from '@/types/anime';
import { AnimeCard } from './AnimeCard';

export interface AnimeCarouselProps {
  items: NormalizedAnime[];
}

export const AnimeCarousel: React.FC<AnimeCarouselProps> = ({ items }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const scrollByAmount = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -350 : 350;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  }, []);

  // Prevent link click when actively dragging
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleClick = (e: MouseEvent) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    el.addEventListener('click', handleClick, true);
    return () => el.removeEventListener('click', handleClick, true);
  }, [hasMoved]);

  return (
    <div className="relative group">
      {/* Scroll Left Button */}
      <button
        type="button"
        onClick={() => scrollByAmount('left')}
        aria-label="Scroll left"
        className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded bg-[#111113]/90 border border-[#2C2C32] text-white items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#18181B] hover:border-[#7C3AED]/70 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Swipable & Draggable Track */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`spotlight-grid flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 pt-1 select-none touch-pan-x ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          scrollSnapType: isDragging ? 'none' : 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map((anime, index) => (
          <div
            key={anime.id}
            className="w-[145px] sm:w-[170px] md:w-[185px] shrink-0 h-[280px] sm:h-[310px] md:h-[330px] flex flex-col"
            style={{ scrollSnapAlign: 'start' }}
          >
            <AnimeCard anime={anime} priority={index < 4} />
          </div>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        onClick={() => scrollByAmount('right')}
        aria-label="Scroll right"
        className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded bg-[#111113]/90 border border-[#2C2C32] text-white items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#18181B] hover:border-[#7C3AED]/70 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
