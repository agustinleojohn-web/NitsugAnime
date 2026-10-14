import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw, LayoutGrid, List, X, EyeOff, Star } from 'lucide-react';
import { useCatalogIndex } from '@/lib/catalog/indexStore';
import { IndexCoverage } from '@/components/states/IndexCoverage';
import { useExcludeList } from '@/hooks/useExcludeList';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { AnimeListRow } from '@/components/anime/AnimeListRow';
import { FilterDropdown } from '@/components/filters/FilterDropdown';
import { PosterSkeletonGrid } from '@/components/states/PosterSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { Button } from '@/components/ui/Button';
import {
  CatalogFilters, EMPTY_FILTERS, SEASONS, RATING_OPTIONS, EPISODE_RANGES,
  SORT_OPTIONS, LANGUAGE_OPTIONS, applyFilters, uniqueSorted, norm,
} from '@/lib/catalog/filters';

const VIEW_KEY = 'nitsug_explore_view_v1';
const PAGE_SIZE = 48;

const toOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }));

function filtersFromParams(p: URLSearchParams): CatalogFilters {
  const list = (k: string) => (p.get(k) ? [p.get(k) as string] : []);
  const lang = p.get('lang');
  return {
    ...EMPTY_FILTERS,
    letter: p.get('letter') && p.get('letter') !== 'All' ? (p.get('letter') as string) : '',
    genres: list('genre'),
    types: list('type'),
    statuses: list('status'),
    language: lang === 'sub' || lang === 'dub' || lang === 'both' ? lang : 'any',
    query: p.get('q') || '',
  };
}

export const ExplorePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const seed = useMemo(() => filtersFromParams(searchParams), [searchParams]);

  const [draft, setDraft] = useState<CatalogFilters>(seed);
  const [applied, setApplied] = useState<CatalogFilters>(seed);
  const [pageNo, setPageNo] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>(() => (localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid'));

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setDraft(seed);
    setApplied(seed);
    setPageNo(1);
  }, [seed]);

  const index = useCatalogIndex();
  const { items } = index;
  const isLoading = items.length === 0 && index.status !== 'error';
  const excluded = useExcludeList();
  const excludedIds = useMemo(() => new Set(excluded.items.map((i) => i.animeId)), [excluded.items]);

  const genreOptions = useMemo(() => toOptions(uniqueSorted(items.flatMap((a) => a.genres))), [items]);
  const typeOptions = useMemo(() => toOptions(uniqueSorted(items.map((a) => a.type).filter((t) => norm(t) !== 'unknown'))), [items]);
  const statusOptions = useMemo(() => toOptions(uniqueSorted(items.map((a) => a.status).filter((s) => norm(s) !== 'unknown'))), [items]);
  const sourceOptions = useMemo(() => toOptions(uniqueSorted(items.map((a) => a.source))), [items]);
  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    for (const a of items) if (a.releaseYear !== undefined) years.add(a.releaseYear);
    return [...years].sort((a, b) => b - a).map((y) => ({ value: String(y), label: String(y) }));
  }, [items]);

  const results = useMemo(() => applyFilters(items, applied, excludedIds), [items, applied, excludedIds]);
  const topRated = useMemo(
    () => items.filter((a) => a.score !== undefined).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 10),
    [items]
  );

  const set = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);

  const apply = (next: CatalogFilters) => {
    setApplied(next);
    setPageNo(1);
  };
  const reset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPageNo(1);
  };
  const removeApplied = (patch: Partial<CatalogFilters>) => {
    const next = { ...applied, ...patch };
    setApplied(next);
    setPageNo(1);
    setDraft((d) => ({ ...d, ...patch }));
  };

  const chips = useMemo(() => {
    const out: { key: string; label: string; patch: Partial<CatalogFilters> }[] = [];
    if (applied.query.trim()) out.push({ key: 'q', label: `"${applied.query.trim()}"`, patch: { query: '' } });
    if (applied.letter) out.push({ key: 'letter', label: `Letter ${applied.letter}`, patch: { letter: '' } });
    applied.genres.forEach((g) => out.push({ key: `g-${g}`, label: g, patch: { genres: applied.genres.filter((x) => x !== g) } }));
    applied.seasons.forEach((s) => out.push({ key: `s-${s}`, label: s, patch: { seasons: applied.seasons.filter((x) => x !== s) } }));
    if (applied.year) out.push({ key: 'year', label: applied.year, patch: { year: '' } });
    applied.types.forEach((t) => out.push({ key: `t-${t}`, label: t, patch: { types: applied.types.filter((x) => x !== t) } }));
    applied.statuses.forEach((t) => out.push({ key: `st-${t}`, label: t, patch: { statuses: applied.statuses.filter((x) => x !== t) } }));
    if (applied.language !== 'any') out.push({ key: 'lang', label: applied.language === 'both' ? 'Sub + Dub' : applied.language.toUpperCase(), patch: { language: 'any' } });
    if (applied.rating) out.push({ key: 'rating', label: `Rating ${RATING_OPTIONS.find((r) => r.value === applied.rating)?.label}`, patch: { rating: '' } });
    applied.sources.forEach((t) => out.push({ key: `so-${t}`, label: `Source: ${t}`, patch: { sources: applied.sources.filter((x) => x !== t) } }));
    applied.episodes.forEach((t) => out.push({ key: `e-${t}`, label: `${EPISODE_RANGES.find((r) => r.value === t)?.label} eps`, patch: { episodes: applied.episodes.filter((x) => x !== t) } }));
    if (applied.sort !== 'default') out.push({ key: 'sort', label: SORT_OPTIONS.find((s) => s.value === applied.sort)?.label ?? applied.sort, patch: { sort: 'default' } });
    return out;
  }, [applied]);

  const changeView = (v: 'grid' | 'list') => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const partial = !index.complete;
  const filtering = chips.length > 0;
  const indexing = index.status === 'loading' || index.status === 'idle';
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(pageNo, pageCount);
  const visible = useMemo(() => results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [results, currentPage]);
  const goPage = (n: number) => {
    setPageNo(n);
    resultsTopRef.current?.scrollIntoView({ block: 'start' });
  };
  const resultsTopRef = useRef<HTMLDivElement>(null);

  const excludeButton = (a: { id: string; title: string }) => (
    <button
      type="button"
      onClick={() => excluded.add({ animeId: a.id, title: a.title })}
      aria-label={`Exclude ${a.title} from results`}
      title="Exclude from results"
      className="absolute top-1.5 right-1.5 z-10 w-7 h-7 rounded-lg bg-black/70 text-[#D4D4D8] hover:bg-[#EF4444] hover:text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/ex:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
    >
      <EyeOff className="w-3.5 h-3.5" />
    </button>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_20rem] gap-8 min-w-0">
      <div className="flex flex-col gap-5 min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-[#FAFAFA]">Filter</h1>

        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            apply(draft);
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-2.5">
            <input
              type="search"
              value={draft.query}
              onChange={(e) => set('query', e.target.value)}
              placeholder="Search..."
              aria-label="Search titles"
              className="col-span-2 sm:col-span-1 h-9 min-w-0 px-3 rounded-lg bg-[#111113] border border-[#2C2C32] text-[13px] text-[#FAFAFA] placeholder-[#71717A] hover:border-[#3F3F46] focus:outline-none focus:border-[#7C3AED]"
            />
            <FilterDropdown label="Select genre" multi wide options={genreOptions} selected={draft.genres} onChange={(v) => set('genres', v)} />
            <FilterDropdown label="Select season" multi options={toOptions(SEASONS)} selected={draft.seasons} onChange={(v) => set('seasons', v)} />
            <FilterDropdown label="Select year" options={yearOptions} selected={draft.year ? [draft.year] : []} onChange={(v) => set('year', v[0] ?? '')} />
            <FilterDropdown label="Select type" multi options={typeOptions} selected={draft.types} onChange={(v) => set('types', v)} />
            <FilterDropdown label="Select status" multi options={statusOptions} selected={draft.statuses} onChange={(v) => set('statuses', v)} emptyText="Statuses appear once the index loads" />
            <FilterDropdown
              label="Select language"
              options={LANGUAGE_OPTIONS}
              selected={draft.language === 'any' ? [] : [draft.language]}
              onChange={(v) => set('language', (v[0] as CatalogFilters['language']) ?? 'any')}
            />
            <FilterDropdown label="Select rating" options={RATING_OPTIONS} selected={draft.rating ? [draft.rating] : []} onChange={(v) => set('rating', v[0] ?? '')} />
            <FilterDropdown label="Select source" multi options={sourceOptions} selected={draft.sources} onChange={(v) => set('sources', v)} emptyText="No source data in the index" />
            <FilterDropdown label="Episode range" multi options={EPISODE_RANGES} selected={draft.episodes} onChange={(v) => set('episodes', v)} />
            <FilterDropdown label="Default" options={SORT_OPTIONS.slice(1)} selected={draft.sort === 'default' ? [] : [draft.sort]} onChange={(v) => set('sort', v[0] ?? 'default')} />
            <FilterDropdown
              label="Exclude list"
              multi
              options={excluded.items.map((i) => ({ value: i.animeId, label: i.title }))}
              selected={excluded.items.map((i) => i.animeId)}
              onChange={(next) => excluded.items.filter((i) => !next.includes(i.animeId)).forEach((i) => excluded.remove(i.animeId))}
              emptyText="Nothing excluded. Use the eye-off button on a title."
            />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" size="sm" icon={<Filter className="w-3.5 h-3.5" />}>
              Filter{dirty ? ' *' : ''}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={reset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
              Reset
            </Button>
            {dirty && <span className="text-[11px] text-[#A1A1AA]">Changes not applied yet</span>}
          </div>
        </form>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5" aria-label="Applied filters">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => removeApplied(c.patch)}
                aria-label={`Remove filter ${c.label}`}
                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-[#7C3AED]/15 border border-[#7C3AED]/40 text-xs text-[#DDD6FE] hover:bg-[#7C3AED]/30 cursor-pointer"
              >
                {c.label}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        <IndexCoverage state={index} onRetry={index.retry} />

        <div ref={resultsTopRef} className="flex items-center justify-between gap-3 min-h-8 scroll-mt-20">
          <p className="text-xs text-[#A1A1AA]" aria-live="polite">
            {isLoading
              ? 'Loading catalog index...'
              : `${results.length.toLocaleString()} ${filtering ? 'matching of ' : ''}${items.length.toLocaleString()} indexed${indexing ? ' so far' : ''}`}
          </p>
          <div className="flex items-center gap-1 bg-[#111113] border border-[#2C2C32] rounded-lg p-0.5" role="group" aria-label="Result layout">
            {([['grid', LayoutGrid, 'Grid view'], ['list', List, 'List view']] as const).map(([v, Icon, label]) => (
              <button
                key={v}
                type="button"
                aria-label={label}
                aria-pressed={view === v}
                onClick={() => changeView(v)}
                className={`w-8 h-7 flex items-center justify-center rounded-lg cursor-pointer ${view === v ? 'bg-[#7C3AED] text-white' : 'text-[#A1A1AA] hover:text-[#FAFAFA]'}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <PosterSkeletonGrid count={12} />
        ) : index.status === 'error' && items.length === 0 ? (
          <ErrorState title="Could not load the catalog index" message={index.error ?? 'The index files could not be loaded.'} onRetry={index.retry} />
        ) : (
          <>
            {results.length === 0 ? (
              <div className="py-14 text-center flex flex-col items-center gap-3 border border-dashed border-[#2C2C32] rounded-lg px-4">
                <p className="text-sm font-semibold text-[#FAFAFA]">No titles match these filters</p>
                <p className="text-xs text-[#A1A1AA] max-w-md">
                  {partial
                    ? `The index is ${indexing ? 'still loading' : 'incomplete'} (${items.length.toLocaleString()}${index.catalogTotal ? ` of ${index.catalogTotal.toLocaleString()}` : ''} titles), so a matching title may exist that is not indexed yet.`
                    : `All ${items.length.toLocaleString()} indexed titles were checked.`}
                </p>
                <div className="flex gap-2">
                  {filtering && <Button size="sm" variant="secondary" onClick={reset}>Reset filters</Button>}
                </div>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 spotlight-grid">
                {visible.map((a, i) => (
                  <div key={a.id} className="relative group/ex">
                    <AnimeCard anime={a} priority={i < 6} />
                    {excludeButton(a)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                {visible.map((a) => (
                  <div key={a.id} className="relative group/ex">
                    <AnimeListRow anime={a} />
                    {excludeButton(a)}
                  </div>
                ))}
              </div>
            )}

            {pageCount > 1 && (
              <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Result pages">
                <Button variant="secondary" size="sm" disabled={currentPage <= 1} onClick={() => goPage(currentPage - 1)}>Previous</Button>
                <span className="text-xs text-[#A1A1AA]">Page {currentPage} of {pageCount.toLocaleString()}</span>
                <Button variant="secondary" size="sm" disabled={currentPage >= pageCount} onClick={() => goPage(currentPage + 1)}>Next</Button>
              </nav>
            )}
          </>
        )}
      </div>

      <aside aria-label="Top rated anime" className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight text-[#FAFAFA] mb-4">Top rated anime</h2>
        {topRated.length === 0 ? (
          <p className="text-xs text-[#71717A]">{isLoading ? 'Loading...' : 'No rated titles in the index.'}</p>
        ) : (
          <>
            <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
              {topRated.map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/watch/${a.id}`}
                    className="flex items-center gap-3 p-1.5 rounded-lg bg-[#111113] border border-transparent hover:border-[#7C3AED]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
                  >
                    <img src={a.posterUrl} alt="" loading="lazy" className="w-12 h-[4.25rem] rounded object-cover bg-[#18181B] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-[#FAFAFA] line-clamp-2 leading-snug">{a.title}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-[#71717A]">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#FBBF24]"><Star className="w-3 h-3 fill-current" />{a.score?.toFixed(2)}</span>
                        <span>{a.type}</span>
                        {a.duration && <span className="truncate">{a.duration}</span>}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-[11px] text-[#71717A]">Ranked among the {items.length.toLocaleString()} indexed titles.</p>
          </>
        )}
      </aside>
    </div>
  );
};
