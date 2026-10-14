import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchRecentAnime, ApiError } from '@/lib/api/client';
import { NormalizedAnime } from '@/types/anime';

export const CATALOG_PAGE_SIZE = 60;

/**
 * One shared, progressively loaded slice of the live catalog (GET /recent-anime).
 * Search, Explore and Watch all read the same cache entry, so pages are never fetched twice.
 * `minPages` loads pages sequentially (never in parallel) until that many are present.
 */
export function useCatalogPages({ enabled = true, minPages = 1 }: { enabled?: boolean; minPages?: number } = {}) {
  const query = useInfiniteQuery({
    queryKey: ['catalog', 'recent', CATALOG_PAGE_SIZE],
    queryFn: ({ pageParam, signal }) => fetchRecentAnime(pageParam, CATALOG_PAGE_SIZE, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { page, totalPages, perPage } = last.pagination;
      if (totalPages !== undefined) return page < totalPages ? page + 1 : undefined;
      return last.items.length >= perPage ? page + 1 : undefined;
    },
    enabled,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    retry: (count, err) => !(err instanceof ApiError && (err.isRateLimit || err.kind === 'aborted')) && count < 1,
  });

  const { data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage, isError } = query;
  const pageCount = data?.pages.length ?? 0;

  useEffect(() => {
    if (!enabled || isError || isFetchNextPageError) return;
    if (pageCount > 0 && pageCount < minPages && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [enabled, minPages, pageCount, hasNextPage, isFetchingNextPage, isError, isFetchNextPageError, fetchNextPage]);

  const items: NormalizedAnime[] = (() => {
    if (!data) return [];
    const seen = new Set<string>();
    const out: NormalizedAnime[] = [];
    for (const page of data.pages) {
      for (const item of page.items) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          out.push(item);
        }
      }
    }
    return out;
  })();

  const total = data?.pages[0]?.pagination.total;

  return { ...query, items, total, pageCount };
}
