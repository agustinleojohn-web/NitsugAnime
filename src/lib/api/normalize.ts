import { MEGAPLAY_BASE_URL } from './config';
import { RawAnimeItem, RawEpisodeItem, NormalizedAnime, NormalizedEpisode } from '@/types/anime';

const SEASONS = new Set(['winter', 'spring', 'summer', 'fall']);

/** The catalog contains values like "&nbsp", "unknown" and mixed casing for season. */
export function canonicalSeason(raw?: string | null): string | undefined {
  const v = (raw ?? '').trim().toLowerCase();
  return SEASONS.has(v) ? v.charAt(0).toUpperCase() + v.slice(1) : undefined;
}

/** Collapses casing/underscore variants ("light_novel", "Light novel") and drops non-values. */
export function canonicalSource(raw?: string | null): string | undefined {
  const v = (raw ?? '').replace(/_/g, ' ').trim().toLowerCase();
  if (!v || v === '-' || v === 'unknown' || v === 'en') return undefined;
  return v.charAt(0).toUpperCase() + v.slice(1);
}

/** Keeps the real catalog type; never invents "TV" for a missing one. */
export function canonicalType(raw?: string | null): string {
  const v = (raw ?? '').trim();
  if (!v) return 'Unknown';
  if (v === 'TV_SHORT') return 'TV Short';
  return v;
}

export function canonicalAgeRating(raw?: string | null): string | undefined {
  const v = (raw ?? '').trim();
  if (!v || v === '-' || v.toLowerCase() === 'n/a' || v.toLowerCase() === 'none') return undefined;
  return v === 'PG 13' ? 'PG-13' : v;
}

export const POSTER_PLACEHOLDER = '/Neon Purple Anime Placeholder Poster-optimized.webp';

export function normalizeAnimeItem(raw: RawAnimeItem): NormalizedAnime {
  const genres = raw.terms_by_type?.genre || [];
  const typeList = raw.terms_by_type?.type || [];
  const studios = raw.terms_by_type?.studios || [];
  const producers = raw.terms_by_type?.producers || [];

  const rawScore = typeof raw.score === 'string' ? parseFloat(raw.score) : typeof raw.score === 'number' ? raw.score : undefined;
  const validScore = rawScore && !isNaN(rawScore) && rawScore > 0 ? rawScore : undefined;

  const episodeCountNum = raw.episodes ? parseInt(raw.episodes, 10) : undefined;
  const validEpCount = episodeCountNum && !isNaN(episodeCountNum) ? episodeCountNum : undefined;

  const subCount = typeof raw.is_sub === 'number' ? raw.is_sub : 0;
  const dubCount = typeof raw.is_dub === 'number' ? raw.is_dub : 0;

  return {
    id: String(raw.id),
    rawId: raw.id,
    title: raw.title || 'Untitled Anime',
    alternativeTitle: raw.alternative || undefined,
    synonyms: raw.titles && raw.titles !== raw.title && raw.titles !== raw.alternative ? raw.titles : undefined,
    nativeTitle: raw.native || undefined,
    synopsis: raw.description ? raw.description.trim() : 'No synopsis available for this title.',
    posterUrl: raw.poster || POSTER_PLACEHOLDER,
    bannerUrl: raw.background_image || undefined,
    genres: genres.filter(Boolean),
    type: canonicalType(typeList[0]),
    status: raw.status || 'Unknown',
    releaseYear: raw.year || undefined,
    aired: raw.aired || undefined,
    season: canonicalSeason(raw.season),
    duration: raw.duration || undefined,
    score: validScore,
    scoreFormatted: validScore ? validScore.toFixed(2) : undefined,
    ageRating: canonicalAgeRating(raw.rating),
    episodeCount: validEpCount,
    isSubCount: subCount,
    isDubCount: dubCount,
    hasSub: subCount > 0,
    hasDub: dubCount > 0,
    source: canonicalSource(raw.source),
    malId: raw.mal_id || undefined,
    aniId: raw.ani_id || undefined,
    studios: studios.filter(Boolean),
    producers: producers.filter(Boolean),
    updatedAt: raw.updated_at || undefined,
    nextAirScheduleTime: raw.next_air_schedule_time || undefined,
    nextAirEp: raw.next_air_ep || undefined,
  };
}

export function normalizeEpisodeItem(raw: RawEpisodeItem): NormalizedEpisode {
  const embedId = raw.episode_embed_id ? String(raw.episode_embed_id).trim() : '';
  // Documented pattern: /stream/s-2/{episode_embed_id}/{language}. Only built from the real embed id.
  const subUrl = raw.embed_url?.sub || (embedId ? `${MEGAPLAY_BASE_URL}/stream/s-2/${encodeURIComponent(embedId)}/sub` : undefined);
  const dubUrl = raw.embed_url?.dub || undefined;
  const hsubUrl = raw.embed_url?.hsub || undefined;

  return {
    id: String(raw.id),
    rawId: raw.id,
    number: raw.number || 1,
    title: raw.title || `Episode ${raw.number || 1}`,
    jpTitle: raw.jp_title || undefined,
    episodeEmbedId: embedId,
    embedUrlSub: subUrl,
    embedUrlDub: dubUrl,
    embedUrlHsub: hsubUrl,
    hasSub: Boolean(subUrl),
    hasDub: Boolean(dubUrl),
    updatedAt: raw.updated_at || undefined,
  };
}
