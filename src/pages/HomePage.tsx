import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Play, Flame, ChevronRight, CalendarClock, Sparkles } from 'lucide-react';
import { fetchRecentAnime, filterUpcoming } from '@/lib/api/client';
import { registerLiveItems, useCatalogIndex } from '@/lib/catalog/indexStore';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { HeroSlider } from '@/components/anime/HeroSlider';
import { TopAnimeSidebar } from '@/components/anime/TopAnimeSidebar';
import { EstimatedSchedule } from '@/components/anime/EstimatedSchedule';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { AnimeCarousel } from '@/components/anime/AnimeCarousel';
import { PosterSkeletonGrid } from '@/components/states/PosterSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { ANIKOTO_TOP_ANIME_DAY } from '@/data/topAnimeData';

export const HomePage: React.FC = () => {
  const { history } = useWatchHistory();
  const [activeTab, setActiveTab] = useState<'all' | 'sub' | 'dub' | 'trending' | 'random'>('all');

  // One request feeds Latest, Upcoming, Trending and the schedule (page 1, API maximum of 100 per page).
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['anime', 'home-feed'],
    queryFn: ({ signal }) => fetchRecentAnime(1, 100, signal),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (data?.items.length) registerLiveItems(data.items);
  }, [data]);

  // Only when the live feed failed: fall back to the static catalog index (no API calls).
  const fallbackIndex = useCatalogIndex({ enabled: isError });
  const liveItems = useMemo(() => data?.items || [], [data]);
  const stale = isError && liveItems.length === 0;
  const animeList = useMemo(() => {
    if (!stale) return liveItems;
    const time = (a: { updatedAt?: string }) => (a.updatedAt ? Date.parse(a.updatedAt) || 0 : 0);
    return [...fallbackIndex.items].sort((x, y) => time(y) - time(x)).slice(0, 100);
  }, [stale, liveItems, fallbackIndex.items]);
  const upcomingList = useMemo(() => filterUpcoming(animeList), [animeList]);

  // Tab filtering for Latest Episode section matching Anikoto
  const latestFiltered = useMemo(() => {
    if (activeTab === 'sub') {
      return animeList.filter((a) => a.hasSub);
    }
    if (activeTab === 'dub') {
      return animeList.filter((a) => a.hasDub);
    }
    if (activeTab === 'trending') {
      return [...animeList].sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    if (activeTab === 'random') {
      return [...animeList].reverse();
    }
    return animeList;
  }, [animeList, activeTab]);

  // 12 to 16 cards displayed in Latest Episode
  const displayedLatest = latestFiltered.slice(0, 16);
  const errorBanner = isError ? (
    <ErrorState
      className="max-w-none mx-0"
      title={stale && animeList.length > 0 ? 'Live updates are unavailable' : 'Could not load anime catalog'}
      message={
        (error instanceof Error ? error.message : 'Failed to retrieve anime titles.') +
        (stale && animeList.length > 0 ? ' Showing titles from the saved catalog index instead; episode counts may be out of date.' : '')
      }
      error={error}
      onRetry={() => refetch()}
    />
  ) : null;

  // Continue Watching items from local history
  const continueWatchingList = history.slice(0, 6);

  if ((isLoading || (stale && fallbackIndex.status === "loading")) && animeList.length === 0) {
    return (
      <div className="flex flex-col gap-10">
        <div className="h-[380px] sm:h-[440px] md:h-[480px] bg-[#111113] border border-[#2C2C32] rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="h-6 w-48 bg-[#18181B] rounded animate-pulse" />
            <PosterSkeletonGrid count={8} />
          </div>
          <div className="lg:col-span-4 h-96 bg-[#111113] rounded border border-[#2C2C32] animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError && animeList.length === 0) {
    return <div className="py-16">{errorBanner}</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {errorBanner}

      {/* 1. Autoplay Smooth Fading Hero Slider: Real Top 10 Anime of the Week */}
      <HeroSlider slides={ANIKOTO_TOP_ANIME_DAY} />

      {/* 2. Main 2-Column Responsive Layout: Left Main Feed (8 cols) + Right Top Anime Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Main Feed */}
        <div className="lg:col-span-8 flex flex-col gap-8 min-w-0">
          {/* Continue Watching Row (if user has watch history) */}
          {continueWatchingList.length > 0 && (
            <section className="bg-[#111113] border border-[#2C2C32] rounded p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#A78BFA]" />
                  <h2 className="text-base font-bold text-[#FAFAFA]">Continue Watching</h2>
                </div>
                <Link to="/history" className="text-xs text-[#A78BFA] hover:underline font-semibold">
                  All history &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {continueWatchingList.map((item) => (
                  <Link
                    key={`${item.animeId}-${item.episodeId}`}
                    to={`/watch/${item.animeId}/${item.episodeId}`}
                    className="group relative flex flex-col bg-[#18181B] border border-[#2C2C32] rounded overflow-hidden hover:border-[#7C3AED]/70 transition-all"
                  >
                    <div className="relative aspect-video w-full bg-[#202024] overflow-hidden">
                      <img
                        src={item.posterUrl}
                        alt={item.animeTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/80 text-[10px] font-bold text-white px-1.5 py-0.2 rounded">
                        Ep {item.episodeNumber}
                      </div>
                    </div>
                    <div className="p-2">
                      <h4 className="text-xs font-semibold text-[#FAFAFA] truncate group-hover:text-[#A78BFA]">
                        {item.animeTitle}
                      </h4>
                      <p className="text-[10px] text-[#71717A] mt-0.5 uppercase">
                        {item.selectedLanguage}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Latest Episode Section: Exactly matching real Anikoto recent episodes */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                <h2 className="text-xl font-extrabold text-[#FAFAFA] tracking-tight">
                  Latest Episode
                </h2>
              </div>

              {/* Sub, Dub, Trending, Random Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['all', 'sub', 'dub', 'trending', 'random'] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  const label = tab.charAt(0).toUpperCase() + tab.slice(1);
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs font-bold px-3 py-1 rounded border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#7C3AED] text-white border-[#8B5CF6] shadow-sm'
                          : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border-[#2C2C32] hover:bg-[#202024]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}

                <Link
                  to="/explore"
                  className="p-1 rounded bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#2C2C32] ml-1"
                  title="View all"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Spotlight Grid with uniform card heights and hover popover */}
            <div className="spotlight-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {displayedLatest.map((anime, idx) => (
                <div key={anime.id} className="h-full">
                  <AnimeCard anime={anime} priority={idx < 4} />
                </div>
              ))}
            </div>
          </section>

          {/* 3. Upcoming Anime Section: Explicitly requested by user */}
          {upcomingList.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-[#7C3AED]" />
                  <h2 className="text-xl font-extrabold text-[#FAFAFA] tracking-tight">
                    Upcoming Anime
                  </h2>
                </div>
                <Link to="/explore?status=currently+airing" className="text-xs text-[#A78BFA] hover:underline font-semibold">
                  View all upcoming &rarr;
                </Link>
              </div>

              {/* Swipable & Draggable Upcoming Carousel */}
              <AnimeCarousel items={upcomingList.slice(0, 15)} />
            </section>
          )}

          {/* 4. Estimated Schedule (Live Weekly Schedule) */}
          <EstimatedSchedule animeList={animeList} />

          {/* 5. Trending Action & Fantasy Carousel (Draggable / Swipable) */}
          {animeList.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#7C3AED]" />
                  <h2 className="text-lg md:text-xl font-extrabold text-[#FAFAFA] tracking-tight">
                    Trending Action & Adventure
                  </h2>
                </div>
                <Link to="/explore?genre=Action" className="text-xs text-[#A78BFA] hover:underline font-semibold">
                  View all &rarr;
                </Link>
              </div>

              <AnimeCarousel
                items={animeList
                  .filter((a) => a.genres.includes('Action') || a.genres.includes('Adventure'))
                  .slice(0, 15)}
              />
            </section>
          )}
        </div>

        {/* Right Sidebar: Real Anikoto Top Anime (4 columns on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <TopAnimeSidebar />
        </div>
      </div>
    </div>
  );
};
