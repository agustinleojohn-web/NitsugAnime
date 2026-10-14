import { useState, useEffect, useCallback } from 'react';
import { WatchHistoryItem } from '@/types/storage';
import {
  getStoredHistory,
  recordWatchProgress as storageRecord,
  removeFromHistory as storageRemove,
  clearWatchHistory as storageClear,
  STORAGE_SYNC_EVENT,
} from '@/lib/storage/localStorage';

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>(() => getStoredHistory());

  const refresh = useCallback(() => {
    setHistory(getStoredHistory());
  }, []);

  useEffect(() => {
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent<{ type?: string }>;
      if (!customEvent.detail || customEvent.detail.type === 'history') {
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

  const record = useCallback((item: Omit<WatchHistoryItem, 'lastWatchedAt'>) => {
    storageRecord(item);
    refresh();
  }, [refresh]);

  const remove = useCallback((animeId: string, episodeId: string) => {
    storageRemove(animeId, episodeId);
    refresh();
  }, [refresh]);

  const clear = useCallback(() => {
    storageClear();
    refresh();
  }, [refresh]);

  const getResumeForAnime = useCallback(
    (animeId: string): WatchHistoryItem | undefined => {
      return history.find((h) => h.animeId === animeId);
    },
    [history]
  );

  return {
    history,
    record,
    remove,
    clear,
    getResumeForAnime,
  };
}
