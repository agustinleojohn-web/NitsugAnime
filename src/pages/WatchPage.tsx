import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bookmark, ListVideo, Sparkles } from 'lucide-react';
import { fetchSeriesDetail, getPlayerServers, PlayerLanguage, PlayerServer } from '@/lib/api/client';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useSettings } from '@/hooks/useSettings';
import { useCatalogIndex } from '@/lib/catalog/indexStore';
import { AnimePlayer } from '@/components/player/AnimePlayer';
import { EpisodeNavigation } from '@/components/player/EpisodeNavigation';
import { ServerSelector } from '@/components/player/ServerSelector';
import { PlayerEpisodeList } from '@/components/player/PlayerEpisodeList';
import { RelatedAnimeSidebar } from '@/components/player/RelatedAnimeSidebar';
import { SeriesDetailsBottom } from '@/components/player/SeriesDetailsBottom';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/states/ErrorState';

const PROGRESS_SAVE_INTERVAL_MS = 10000;

export const WatchPage: React.FC = () => {
  const { animeId, episodeId } = useParams<{ animeId: string; episodeId?: string }>();
  const navigate = useNavigate();

  const { settings, update: updateSettings } = useSettings();
  const { contains, toggle } = useWatchlist();
  const { record, getResumeForAnime } = useWatchHistory();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['anime', 'series', animeId],
    queryFn: ({ signal }) => fetchSeriesDetail(animeId || '', signal),
    enabled: Boolean(animeId),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { items: catalogItems } = useCatalogIndex();

  const anime = data?.anime;
  const episodes = useMemo(() => data?.episodes ?? [], [data]);

  const resume = animeId ? getResumeForAnime(animeId) : undefined;
  const defaultEpisodeId = useMemo(() => {
    if (episodes.length === 0) return undefined;
    return episodes.find((e) => e.id === resume?.episodeId)?.id ?? episodes[0].id;
  }, [episodes, resume?.episodeId]);

  const currentEpisodeIndex = useMemo(() => episodes.findIndex((e) => e.id === episodeId), [episodes, episodeId]);
  const currentEpisode = currentEpisodeIndex >= 0 ? episodes[currentEpisodeIndex] : null;

  const [requestedLanguage, setRequestedLanguage] = useState<PlayerLanguage>(settings.preferredLanguage);
  const [requestedServerId, setRequestedServerId] = useState<string | undefined>();

  const servers = useMemo(
    () => (currentEpisode ? getPlayerServers(currentEpisode, anime) : { sub: [], dub: [] }),
    [currentEpisode, anime]
  );

  const language: PlayerLanguage =
    servers[requestedLanguage].length > 0 ? requestedLanguage : requestedLanguage === 'sub' ? 'dub' : 'sub';
  const activeServer: PlayerServer | undefined =
    servers[language].find((s) => s.id === requestedServerId) ?? servers[language][0];

  const handleSelectServer = (server: PlayerServer) => {
    setRequestedLanguage(server.language);
    setRequestedServerId(server.id);
    updateSettings({ preferredLanguage: server.language });
  };

  const lastSavedRef = useRef(0);
  const baseRecord = useMemo(
    () =>
      anime && currentEpisode
        ? {
            animeId: anime.id,
            episodeId: currentEpisode.id,
            episodeNumber: currentEpisode.number,
            animeTitle: anime.title,
            episodeTitle: currentEpisode.title,
            posterUrl: anime.posterUrl,
            selectedLanguage: language,
          }
        : null,
    [anime, currentEpisode, language]
  );

  React.useEffect(() => {
    if (baseRecord) record(baseRecord);
    lastSavedRef.current = 0;
  }, [baseRecord, record]);

  const handleTimeUpdate = useCallback(
    (time: number, duration: number) => {
      if (!baseRecord) return;
      const now = Date.now();
      if (now - lastSavedRef.current < PROGRESS_SAVE_INTERVAL_MS) return;
      lastSavedRef.current = now;
      record({
        ...baseRecord,
        progressSeconds: Math.floor(time),
        durationSeconds: Math.floor(duration),
        completed: time >= duration - 10,
      });
    },
    [baseRecord, record]
  );

  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = currentEpisodeIndex >= 0 && currentEpisodeIndex < episodes.length - 1;
  const goTo = useCallback(
    (index: number) => {
      const target = episodes[index];
      if (target) navigate(`/watch/${animeId}/${target.id}`);
    },
    [episodes, animeId, navigate]
  );

  const handleEpisodeCompleted = useCallback(() => {
    if (baseRecord) record({ ...baseRecord, completed: true });
    if (settings.autoNext && hasNext) goTo(currentEpisodeIndex + 1);
  }, [baseRecord, record, settings.autoNext, hasNext, goTo, currentEpisodeIndex]);

  const related = useMemo(() => {
    if (!anime) return [];
    const mine = new Set(anime.genres.map((g) => g.toLowerCase()));
    if (mine.size === 0) return [];
    return catalogItems
      .filter((a) => a.id !== anime.id)
      .map((a) => ({ a, shared: a.genres.filter((g) => mine.has(g.toLowerCase())).length }))
      .filter((x) => x.shared >= Math.min(2, mine.size))
      .sort((x, y) => y.shared - x.shared || (y.a.score ?? 0) - (x.a.score ?? 0))
      .slice(0, 10)
      .map((x) => x.a);
  }, [anime, catalogItems]);

  const inWatchlist = anime ? contains(anime.id) : false;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_18rem] gap-4 animate-pulse">
        <div className="h-72 lg:h-[34rem] bg-[#111113] rounded-lg border border-[#2C2C32] order-2 lg:order-1" />
        <div className="order-1 lg:order-2 flex flex-col gap-3">
          <div className="w-full aspect-video bg-[#18181B] rounded-lg border border-[#2C2C32]" />
          <div className="h-24 bg-[#111113] rounded-lg" />
        </div>
      </div>
    );
  }

  if (!episodeId && defaultEpisodeId && anime) {
    return <Navigate to={`/watch/${anime.id}/${defaultEpisodeId}`} replace />;
  }

  if (isError || !anime) {
    return (
      <div className="py-16 flex flex-col items-center gap-4">
        <Link to="/explore">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Catalog
          </Button>
        </Link>
        <ErrorState
          title="Could not load this series"
          message={error instanceof Error ? error.message : 'Failed to retrieve episode details.'}
          error={error}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!currentEpisode) {
    return (
      <div className="flex flex-col gap-5 min-w-0">
        <ErrorState
          title={episodes.length === 0 ? 'No episodes available' : 'Episode not found'}
          message={
            episodes.length === 0
              ? `The catalog returned no episodes for ${anime.title}.`
              : `Episode "${episodeId}" is not in the episode list for ${anime.title}.`
          }
          onRetry={() => refetch()}
        />
        <SeriesDetailsBottom anime={anime} catalog={catalogItems} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 min-w-0">
      <div className="flex items-center justify-between gap-3 min-w-0">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors min-w-0"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="truncate">
            <strong className="text-white font-semibold">{anime.title}</strong>
          </span>
        </Link>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={() =>
            toggle({
              animeId: anime.id,
              title: anime.title,
              posterUrl: anime.posterUrl,
              type: anime.type,
              scoreFormatted: anime.scoreFormatted,
              hasDub: anime.hasDub,
            })
          }
          icon={<Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-current text-[#A78BFA]' : ''}`} />}
        >
          {inWatchlist ? 'Saved' : 'Add to list'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_18rem] gap-4 items-start">
        <aside
          aria-label="Episodes"
          className="order-2 lg:order-1 bg-[#0D0D0F] border border-[#2C2C32] rounded-lg overflow-hidden flex flex-col lg:self-stretch lg:max-h-[46rem]"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2C2C32] text-xs font-bold text-[#FAFAFA]">
            <ListVideo className="w-4 h-4 text-[#7C3AED]" />
            Episodes ({episodes.length})
          </div>
          <PlayerEpisodeList animeId={anime.id} episodes={episodes} currentEpisodeId={currentEpisode.id} />
        </aside>

        <section aria-label="Player" className="order-1 lg:order-2 flex flex-col gap-3 min-w-0">
          <AnimePlayer
            embedUrl={activeServer?.url ?? null}
            animeTitle={anime.title}
            episodeNumber={currentEpisode.number}
            episodeTitle={currentEpisode.title}
            onTimeUpdate={handleTimeUpdate}
            onEpisodeCompleted={handleEpisodeCompleted}
            onRetry={() => refetch()}
          />
          <EpisodeNavigation
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={() => goTo(currentEpisodeIndex - 1)}
            onNext={() => goTo(currentEpisodeIndex + 1)}
            autoNext={settings.autoNext}
            onToggleAutoNext={() => updateSettings({ autoNext: !settings.autoNext })}
          />
          <ServerSelector
            episodeNumber={currentEpisode.number}
            servers={servers}
            activeLanguage={language}
            activeServerId={activeServer?.id}
            onSelect={handleSelectServer}
          />
        </section>

        <div className="order-3 lg:col-span-2 xl:col-span-1 min-w-0">
          {related.length > 0 ? (
            <RelatedAnimeSidebar currentAnime={anime} relatedList={related} />
          ) : (
            <div className="bg-[#111113] border border-[#2C2C32] rounded-lg p-4 text-xs text-[#71717A] flex gap-2">
              <Sparkles className="w-4 h-4 text-[#7C3AED] shrink-0" />
              No similar titles found in the catalog index.
            </div>
          )}
        </div>
      </div>

      <SeriesDetailsBottom anime={anime} catalog={catalogItems} />
    </div>
  );
};
