import { useState, useEffect, useCallback } from 'react';
import { WatchlistItem } from '@/types/storage';
import {
  getStoredWatchlist,
  addToWatchlist as storageAdd,
  removeFromWatchlist as storageRemove,
  isInWatchlist as storageCheck,
  clearWatchlist as storageClear,
  STORAGE_SYNC_EVENT,
} from '@/lib/storage/localStorage';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => getStoredWatchlist());

  const refresh = useCallback(() => {
    setWatchlist(getStoredWatchlist());
  }, []);

  useEffect(() => {
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent<{ type?: string }>;
      if (!customEvent.detail || customEvent.detail.type === 'watchlist') {
        refresh();
      }
    };

    window.addEventListener(STORAGE_SYNC_EVENT, handleSync);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const add = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    storageAdd(item);
    refresh();
  }, [refresh]);

  const remove = useCallback((animeId: string) => {
    storageRemove(animeId);
    refresh();
  }, [refresh]);

  const toggle = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    if (storageCheck(item.animeId)) {
      storageRemove(item.animeId);
    } else {
      storageAdd(item);
    }
    refresh();
  }, [refresh]);

  const contains = useCallback((animeId: string) => {
    return watchlist.some((item) => item.animeId === animeId);
  }, [watchlist]);

  const clear = useCallback(() => {
    storageClear();
    refresh();
  }, [refresh]);

  return {
    watchlist,
    add,
    remove,
    toggle,
    contains,
    clear,
  };
}
