import { useCallback, useEffect, useState } from 'react';

const KEY = 'nitsug_anime_exclude_v1';
const EVENT = 'nitsug_exclude_sync';

export interface ExcludedItem {
  animeId: string;
  title: string;
}

function read(): ExcludedItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((x): x is ExcludedItem => x && typeof x.animeId === 'string' && typeof x.title === 'string')
      : [];
  } catch {
    return [];
  }
}

/** Local-only list of titles hidden from Explore results. Separate from the watchlist. */
export function useExcludeList() {
  const [items, setItems] = useState<ExcludedItem[]>(read);

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const write = useCallback((next: ExcludedItem[]) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable; state still updates for this session */
    }
    setItems(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const add = useCallback((item: ExcludedItem) => write([...read().filter((i) => i.animeId !== item.animeId), item]), [write]);
  const remove = useCallback((animeId: string) => write(read().filter((i) => i.animeId !== animeId)), [write]);
  const clear = useCallback(() => write([]), [write]);

  return { items, add, remove, clear };
}
