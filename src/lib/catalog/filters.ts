import { NormalizedAnime } from '@/types/anime';

export interface CatalogFilters {
  query: string;
  letter: string;
  genres: string[];
  seasons: string[];
  year: string;
  types: string[];
  statuses: string[];
  language: 'any' | 'sub' | 'dub' | 'both';
  rating: string;
  sources: string[];
  episodes: string[];
  sort: string;
  hideExcluded: boolean;
}

export const EMPTY_FILTERS: CatalogFilters = {
  query: '',
  letter: '',
  genres: [],
  seasons: [],
  year: '',
  types: [],
  statuses: [],
  language: 'any',
  rating: '',
  sources: [],
  episodes: [],
  sort: 'default',
  hideExcluded: true,
};

export const norm = (s: string | undefined): string => (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

interface SearchKeys {
  titles: string[];
  genres: string[];
  season: string;
  type: string;
  status: string;
  source: string;
}
const keyCache = new WeakMap<NormalizedAnime, SearchKeys>();
export function keysFor(a: NormalizedAnime): SearchKeys {
  let k = keyCache.get(a);
  if (!k) {
    k = {
      titles: [a.title, a.alternativeTitle, a.nativeTitle, a.synonyms].filter(Boolean).map((t) => norm(t)),
      genres: a.genres.map(norm),
      season: norm(a.season),
      type: norm(a.type),
      status: norm(a.status),
      source: norm(a.source),
    };
    keyCache.set(a, k);
  }
  return k;
}

/** Rank a title match: 0 exact, 1 prefix, 2 substring, -1 none. Query must already be normalised. */
export function matchRank(a: NormalizedAnime, q: string): number {
  if (!q) return -1;
  const { titles } = keysFor(a);
  if (titles.some((t) => t === q)) return 0;
  if (titles.some((t) => t.startsWith(q))) return 1;
  if (titles.some((t) => t.includes(q))) return 2;
  return -1;
}

export const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall'];
export const RATING_OPTIONS = [
  { value: '9', label: '9.0+' },
  { value: '8', label: '8.0+' },
  { value: '7', label: '7.0+' },
  { value: '6', label: '6.0+' },
  { value: 'unrated', label: 'Unrated' },
];
export const EPISODE_RANGES = [
  { value: 'unknown', label: 'Unknown' },
  { value: '1-12', label: '1 – 12' },
  { value: '13-24', label: '13 – 24' },
  { value: '25-49', label: '25 – 49' },
  { value: '50+', label: '50+' },
];
export const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'newest', label: 'Newest year' },
  { value: 'oldest', label: 'Oldest year' },
  { value: 'episodes', label: 'Most episodes' },
];
export const LANGUAGE_OPTIONS = [
  { value: 'sub', label: 'Sub' },
  { value: 'dub', label: 'Dub' },
  { value: 'both', label: 'Sub + Dub' },
];

function inEpisodeRange(count: number | undefined, range: string): boolean {
  if (range === 'unknown') return count === undefined;
  if (count === undefined) return false;
  if (range === '1-12') return count >= 1 && count <= 12;
  if (range === '13-24') return count >= 13 && count <= 24;
  if (range === '25-49') return count >= 25 && count <= 49;
  if (range === '50+') return count >= 50;
  return false;
}

export function countActiveFilters(f: CatalogFilters): number {
  return (
    (f.query.trim() ? 1 : 0) + (f.letter ? 1 : 0) + f.genres.length + f.seasons.length + (f.year ? 1 : 0) +
    f.types.length + f.statuses.length + (f.language !== 'any' ? 1 : 0) + (f.rating ? 1 : 0) +
    f.sources.length + f.episodes.length + (f.sort !== 'default' ? 1 : 0)
  );
}

export function applyFilters(items: NormalizedAnime[], f: CatalogFilters, excludedIds: Set<string>): NormalizedAnime[] {
  const q = norm(f.query);
  const genreSet = f.genres.map(norm);
  const seasonSet = f.seasons.map(norm);
  const typeSet = f.types.map(norm);
  const statusSet = f.statuses.map(norm);
  const sourceSet = f.sources.map(norm);

  const filtered = items.filter((a) => {
    if (f.hideExcluded && excludedIds.has(a.id)) return false;
    const k = keysFor(a);
    if (q && !k.titles.some((t) => t.includes(q))) return false;
    if (f.letter) {
      const first = a.title.trim().charAt(0).toUpperCase();
      if (f.letter === '#' || f.letter === '0-9') {
        if (/[A-Z]/.test(first)) return false;
      } else if (first !== f.letter.toUpperCase()) return false;
    }
    if (genreSet.length) {
      if (!genreSet.every((g) => k.genres.includes(g))) return false;
    }
    if (seasonSet.length && !seasonSet.includes(k.season)) return false;
    if (f.year && String(a.releaseYear ?? '') !== f.year) return false;
    if (typeSet.length && !typeSet.includes(k.type)) return false;
    if (statusSet.length && !statusSet.includes(k.status)) return false;
    if (f.language === 'sub' && !a.hasSub) return false;
    if (f.language === 'dub' && !a.hasDub) return false;
    if (f.language === 'both' && !(a.hasSub && a.hasDub)) return false;
    if (f.rating) {
      if (f.rating === 'unrated') {
        if (a.score !== undefined) return false;
      } else if (a.score === undefined || a.score < Number(f.rating)) return false;
    }
    if (sourceSet.length && !sourceSet.includes(k.source)) return false;
    if (f.episodes.length && !f.episodes.some((r) => inEpisodeRange(a.episodeCount, r))) return false;
    return true;
  });

  if (f.sort === 'default') return filtered;

  const missingLast = (x: number | undefined, y: number | undefined, dir: 1 | -1) =>
    x === undefined && y === undefined ? 0 : x === undefined ? 1 : y === undefined ? -1 : (x - y) * dir;
  const time = (a: NormalizedAnime) => (a.updatedAt ? Date.parse(a.updatedAt) || undefined : undefined);

  return filtered
    .map((a, index) => ({ a, index }))
    .sort((x, y) => {
      let c = 0;
      switch (f.sort) {
        case 'updated': c = missingLast(time(x.a), time(y.a), -1); break;
        case 'title': c = x.a.title.localeCompare(y.a.title, undefined, { sensitivity: 'base', numeric: true }); break;
        case 'rating': c = missingLast(x.a.score, y.a.score, -1); break;
        case 'newest': c = missingLast(x.a.releaseYear, y.a.releaseYear, -1); break;
        case 'oldest': c = missingLast(x.a.releaseYear, y.a.releaseYear, 1); break;
        case 'episodes': c = missingLast(x.a.episodeCount, y.a.episodeCount, -1); break;
      }
      return c || x.index - y.index;
    })
    .map((x) => x.a);
}

export function uniqueSorted(values: (string | undefined)[]): string[] {
  const map = new Map<string, string>();
  values.forEach((v) => {
    const t = v?.trim();
    if (t && !map.has(norm(t))) map.set(norm(t), t);
  });
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}
