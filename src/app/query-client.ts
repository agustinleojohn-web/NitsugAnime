import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes in cache
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Do not retry 429 rate limit or 404
        if (error instanceof ApiError) {
          if (error.isRateLimit || error.status === 404 || error.status === 400) {
            return false;
          }
        }
        return failureCount < 1;
      },
    },
  },
});
