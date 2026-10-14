import {
  RawRecentAnimeResponse,
  RawSeriesResponse,
  NormalizedAnime,
  NormalizedSeriesDetail,
  NormalizedEpisode,
} from '@/types/anime';
import { normalizeAnimeItem, normalizeEpisodeItem } from './normalize';
import { getApiBaseUrl, MEGAPLAY_BASE_URL } from './config';

export { getApiBaseUrl, MEGAPLAY_BASE_URL };

export type ApiErrorKind = 'http' | 'rate-limit' | 'network' | 'timeout' | 'invalid' | 'aborted';

export class ApiError extends Error {
  status?: number;
  kind: ApiErrorKind;
  isRateLimit: boolean;
  isNetwork: boolean;
  /** Epoch ms before which a retry is pointless (rate limits only). */
  retryAt?: number;

  constructor(message: string, kind: ApiErrorKind = 'http', status?: number, retryAt?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.retryAt = retryAt;
    this.isRateLimit = kind === 'rate-limit';
    this.isNetwork = kind === 'network' || kind === 'timeout';
  }
}

const REQUEST_TIMEOUT_MS = 12000;

// Documented limit: 60 requests per IP every 120 s. Used only when the server sends no retry guidance.
const DEFAULT_COOLDOWN_MS = 120_000;
const MIN_COOLDOWN_MS = 5_000;
const MAX_COOLDOWN_MS = 150_000;
let cooldownUntil = 0;

const RATE_LIMIT_MESSAGE = 'The catalog API rate limit was reached (documented limit: 60 requests per 120 seconds per IP).';

function cooldownFromHeaders(headers: Headers): number {
  const retryAfter = headers.get('retry-after');
  if (retryAfter) {
    const secs = Number(retryAfter);
    if (Number.isFinite(secs) && secs >= 0) return Date.now() + secs * 1000;
    const date = Date.parse(retryAfter);
    if (!Number.isNaN(date)) return date;
  }
  const reset = Number(headers.get('x-ratelimit-reset'));
  if (Number.isFinite(reset) && reset > 0) return reset * 1000 + 1000;
  return Date.now() + DEFAULT_COOLDOWN_MS;
}

function clampCooldown(at: number): number {
  const now = Date.now();
  return Math.min(Math.max(at, now + MIN_COOLDOWN_MS), now + MAX_COOLDOWN_MS);
}

/** Epoch ms until which requests are being held back after a 429, or 0. */
export function getRateLimitRetryAt(): number {
  return cooldownUntil > Date.now() ? cooldownUntil : 0;
}

async function fetchJson<T>(endpoint: string, externalSignal?: AbortSignal): Promise<T> {
  // While cooling down after a 429 no request is sent, so components re-rendering or remounting cannot hammer the API.
  const held = getRateLimitRetryAt();
  if (held) throw new ApiError(RATE_LIMIT_MESSAGE, 'rate-limit', 429, held);

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (response.status === 429) {
      cooldownUntil = clampCooldown(cooldownFromHeaders(response.headers));
      throw new ApiError(RATE_LIMIT_MESSAGE, 'rate-limit', 429, cooldownUntil);
    }
    if (response.headers.get('x-ratelimit-remaining') === '0') {
      // The next request would be rejected; hold off until the window resets.
      cooldownUntil = clampCooldown(cooldownFromHeaders(response.headers));
    }
    if (!response.ok) {
      throw new ApiError(`The catalog API responded with HTTP ${response.status}.`, 'http', response.status);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiError('The catalog API returned a response that is not valid JSON.', 'invalid', response.status);
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      if (timedOut) throw new ApiError('The catalog API took too long to respond.', 'timeout');
      throw new ApiError('Request cancelled.', 'aborted');
    }
    throw new ApiError(`Could not reach the catalog API (${err instanceof Error ? err.message : 'network failure'}).`, 'network');
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
}

export interface CatalogPageResult {
  items: NormalizedAnime[];
  pagination: {
    page: number;
    perPage: number;
    total?: number;
    totalPages?: number;
  };
}

// Verified: the server caps per_page at 100.
const MAX_PER_PAGE = 100;

/** GET /recent-anime?page=&per_page= */
export async function fetchRecentAnime(page = 1, perPage = 24, signal?: AbortSignal): Promise<CatalogPageResult> {
  const clampedPerPage = Math.min(Math.max(perPage, 1), MAX_PER_PAGE);
  const response = await fetchJson<RawRecentAnimeResponse>(
    `/recent-anime?page=${page}&per_page=${clampedPerPage}`,
    signal
  );

  if (!response || response.ok === false || !Array.isArray(response.data)) {
    throw new ApiError('The catalog API returned an unexpected response shape.', 'invalid');
  }

  const p = response.pagination;
  return {
    items: response.data.filter((r) => r && typeof r.id === 'number').map(normalizeAnimeItem),
    pagination: {
      page: typeof p?.page === 'number' ? p.page : page,
      perPage: typeof p?.per_page === 'number' ? p.per_page : clampedPerPage,
      total: typeof p?.total === 'number' ? p.total : undefined,
      totalPages: typeof p?.total_pages === 'number' ? p.total_pages : undefined,
    },
  };
}

/** Upcoming/scheduled titles among already-fetched catalog items. */
export function filterUpcoming(items: NormalizedAnime[]): NormalizedAnime[] {
  return items.filter((a) => {
    const status = a.status.toLowerCase();
    return Boolean(a.nextAirScheduleTime) || status.includes('not yet') || status.includes('upcoming');
  });
}

/** GET /series/{id} */
export async function fetchSeriesDetail(seriesId: string | number, signal?: AbortSignal): Promise<NormalizedSeriesDetail> {
  const cleanId = String(seriesId).trim();
  if (!cleanId) throw new ApiError('Missing anime ID', 'invalid');

  const response = await fetchJson<RawSeriesResponse>(`/series/${encodeURIComponent(cleanId)}`, signal);
  if (!response || response.ok === false || !response.data?.anime) {
    throw new ApiError(`Anime ${cleanId} was not found in the catalog.`, 'http', 404);
  }

  const episodes = (Array.isArray(response.data.episodes) ? response.data.episodes : [])
    .filter((e) => e && e.id != null)
    .map(normalizeEpisodeItem)
    .sort((a, b) => a.number - b.number);

  return { anime: normalizeAnimeItem(response.data.anime), episodes };
}

export type PlayerLanguage = 'sub' | 'dub';

export interface PlayerServer {
  id: string;
  label: string;
  language: PlayerLanguage;
  url: string;
  /** "provider" servers come from the catalog response; "alternate" routes are built from MAL/AniList ids and are unverified. */
  kind: 'provider' | 'alternate';
}

/** Lists the playback options configured for an episode. Presence here does not confirm a stream works. */
export function getPlayerServers(
  episode: NormalizedEpisode,
  anime?: NormalizedAnime
): Record<PlayerLanguage, PlayerServer[]> {
  const sub: PlayerServer[] = [];
  const dub: PlayerServer[] = [];

  if (episode.embedUrlSub) {
    sub.push({ id: 'sub-primary', label: 'MegaPlay', language: 'sub', url: episode.embedUrlSub, kind: 'provider' });
  }
  if (episode.embedUrlHsub) {
    sub.push({ id: 'sub-hsub', label: 'MegaPlay Hard-sub', language: 'sub', url: episode.embedUrlHsub, kind: 'provider' });
  }
  if (episode.embedUrlDub) {
    dub.push({ id: 'dub-primary', label: 'MegaPlay', language: 'dub', url: episode.embedUrlDub, kind: 'provider' });
  }

  const malId = anime?.malId?.trim();
  const aniId = anime?.aniId?.trim();
  const num = episode.number;
  if (malId) {
    sub.push({ id: 'sub-mal', label: 'MAL', language: 'sub', url: `${MEGAPLAY_BASE_URL}/stream/mal/${encodeURIComponent(malId)}/${num}/sub`, kind: 'alternate' });
    if (anime?.hasDub) {
      dub.push({ id: 'dub-mal', label: 'MAL', language: 'dub', url: `${MEGAPLAY_BASE_URL}/stream/mal/${encodeURIComponent(malId)}/${num}/dub`, kind: 'alternate' });
    }
  }
  if (aniId) {
    sub.push({ id: 'sub-ani', label: 'AniList', language: 'sub', url: `${MEGAPLAY_BASE_URL}/stream/ani/${encodeURIComponent(aniId)}/${num}/sub`, kind: 'alternate' });
    if (anime?.hasDub) {
      dub.push({ id: 'dub-ani', label: 'AniList', language: 'dub', url: `${MEGAPLAY_BASE_URL}/stream/ani/${encodeURIComponent(aniId)}/${num}/dub`, kind: 'alternate' });
    }
  }

  return { sub, dub };
}
