import { WatchlistItem, WatchHistoryItem, UserSettings } from '@/types/storage';

const STORAGE_KEYS = {
  WATCHLIST: 'nitsug_anime_watchlist_v1',
  HISTORY: 'nitsug_anime_history_v1',
  SETTINGS: 'nitsug_anime_settings_v1',
} as const;

const DEFAULT_SETTINGS: UserSettings = {
  preferredLanguage: 'sub',
  autoNext: true,
  autoplay: false,
};

const MAX_HISTORY_ITEMS = 100;

// Custom event name for instant cross-component synchronization
export const STORAGE_SYNC_EVENT = 'nitsug_storage_sync';

function notifyStorageChange(type: 'watchlist' | 'history' | 'settings') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_SYNC_EVENT, { detail: { type } }));
  }
}

// Watchlist
export function getStoredWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read watchlist from localStorage:', err);
    return [];
  }
}

export function saveWatchlist(items: WatchlistItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(items));
    notifyStorageChange('watchlist');
  } catch (err) {
    console.error('Failed to save watchlist to localStorage:', err);
  }
}

export function addToWatchlist(item: Omit<WatchlistItem, 'addedAt'>): void {
  const current = getStoredWatchlist();
  const filtered = current.filter((i) => i.animeId !== item.animeId);
  const updated: WatchlistItem[] = [{ ...item, addedAt: Date.now() }, ...filtered];
  saveWatchlist(updated);
}

export function removeFromWatchlist(animeId: string): void {
  const current = getStoredWatchlist();
  const updated = current.filter((i) => i.animeId !== animeId);
  saveWatchlist(updated);
}

export function isInWatchlist(animeId: string): boolean {
  const current = getStoredWatchlist();
  return current.some((i) => i.animeId === animeId);
}

export function clearWatchlist(): void {
  saveWatchlist([]);
}

// Watch History
export function getStoredHistory(): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Sort by lastWatchedAt desc
    return parsed.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);
  } catch (err) {
    console.error('Failed to read history from localStorage:', err);
    return [];
  }
}

export function saveHistory(items: WatchHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Cap to MAX_HISTORY_ITEMS
    const capped = items.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(capped));
    notifyStorageChange('history');
  } catch (err) {
    console.error('Failed to save history to localStorage:', err);
  }
}

export function recordWatchProgress(item: Omit<WatchHistoryItem, 'lastWatchedAt'>): void {
  const current = getStoredHistory();
  // Filter out existing record for this exact anime + episode
  const filtered = current.filter(
    (h) => !(h.animeId === item.animeId && h.episodeId === item.episodeId)
  );

  const newRecord: WatchHistoryItem = {
    ...item,
    lastWatchedAt: Date.now(),
  };

  saveHistory([newRecord, ...filtered]);
}

export function removeFromHistory(animeId: string, episodeId: string): void {
  const current = getStoredHistory();
  const updated = current.filter(
    (h) => !(h.animeId === animeId && h.episodeId === episodeId)
  );
  saveHistory(updated);
}

export function clearWatchHistory(): void {
  saveHistory([]);
}

// User Settings
export function getStoredSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      preferredLanguage: parsed.preferredLanguage === 'dub' ? 'dub' : 'sub',
      autoNext: typeof parsed.autoNext === 'boolean' ? parsed.autoNext : true,
      autoplay: typeof parsed.autoplay === 'boolean' ? parsed.autoplay : false,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<UserSettings>): UserSettings {
  const current = getStoredSettings();
  const updated: UserSettings = {
    ...current,
    ...settings,
  };
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    notifyStorageChange('settings');
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
  return updated;
}
