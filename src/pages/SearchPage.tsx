import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Sparkles } from 'lucide-react';
import { useCatalogIndex } from '@/lib/catalog/indexStore';
import { matchRank, norm } from '@/lib/catalog/filters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { PosterSkeletonGrid } from '@/components/states/PosterSkeleton';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { IndexCoverage } from '@/components/states/IndexCoverage';
import { Button } from '@/components/ui/Button';

const PAGE = 60;

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(urlQuery);
  const debouncedQuery = useDebouncedValue(searchInput, 200);
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed !== urlQuery.trim()) {
      const next = new URLSearchParams(searchParams);
      if (trimmed) next.set('q', trimmed);
      else next.delete('q');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  useEffect(() => {
    if (urlQuery !== searchInput.trim() && debouncedQuery === searchInput) setSearchInput(urlQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  const index = useCatalogIndex();
  const { items } = index;
  const queryNorm = norm(debouncedQuery);

  const results = useMemo(() => {
    if (!queryNorm) return [];
    const scored: { a: (typeof items)[number]; rank: number; i: number }[] = [];
    items.forEach((a, i) => {
      const rank = matchRank(a, queryNorm);
      if (rank >= 0) scored.push({ a, rank, i });
    });
    scored.sort((x, y) => x.rank - y.rank || x.i - y.i);
    return scored.map((x) => x.a);
  }, [items, queryNorm]);

  useEffect(() => setShown(PAGE), [queryNorm]);

  const topRated = useMemo(
    () => items.filter((a) => a.score !== undefined).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 12),
    [items]
  );
  const indexing = index.status === 'loading' || index.status === 'idle';
  const handleClear = () => setSearchInput('');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#FAFAFA] mb-1">Search Anime</h1>
        <p className="text-xs md:text-sm text-[#A1A1AA] mb-4">Searches titles, English names, native names and synonyms across the catalog index.</p>

        <div className="relative max-w-2xl">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Type an anime title..."
            aria-label="Search anime"
            className="w-full bg-[#111113] border border-[#2C2C32] rounded-lg py-3 pl-11 pr-10 text-sm text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#7C3AED] shadow-sm transition-colors"
          />
          <Search className="w-5 h-5 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchInput && (
            <button type="button" onClick={handleClear} aria-label="Clear search" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#FAFAFA] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <IndexCoverage state={index} onRetry={index.retry} className="mt-3 max-w-2xl" />
      </div>

      {queryNorm && (
        <div className="text-xs text-[#A1A1AA] border-b border-[#2C2C32] pb-3" aria-live="polite">
          {results.length.toLocaleString()} {results.length === 1 ? 'result' : 'results'} for &ldquo;
          <span className="text-[#A78BFA] font-medium">{debouncedQuery.trim()}</span>&rdquo;
          {!index.complete && ` in the ${items.length.toLocaleString()} titles ${indexing ? 'indexed so far' : 'indexed'}`}
        </div>
      )}

      {items.length === 0 && index.status === 'error' ? (
        <ErrorState title="Could not load the catalog index" message={index.error ?? undefined} onRetry={index.retry} />
      ) : items.length === 0 ? (
        <PosterSkeletonGrid count={12} />
      ) : !queryNorm ? (
        <div className="flex flex-col gap-6">
          
          {topRated.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#FAFAFA] mb-3">Highest rated in the index</h3>
              <AnimeGrid items={topRated} priorityCount={4} />
            </div>
          )}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title="No anime found"
          description={
            index.complete
              ? `None of the ${items.length.toLocaleString()} indexed titles match "${debouncedQuery.trim()}". Check the spelling or try another name.`
              : `No match yet, but the index is ${indexing ? 'still loading' : 'incomplete'} (${items.length.toLocaleString()}${index.catalogTotal ? ` of ${index.catalogTotal.toLocaleString()}` : ''} titles), so this title may exist and not be indexed.`
          }
          actionText="Clear Search"
          onAction={handleClear}
        />
      ) : (
        <>
          <AnimeGrid items={results.slice(0, shown)} priorityCount={6} />
          {results.length > shown && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => setShown((n) => n + PAGE)}>
                Show more ({(results.length - shown).toLocaleString()} left)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
