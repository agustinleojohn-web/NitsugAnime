export interface WatchlistItem {
  animeId: string;
  title: string;
  posterUrl: string;
  addedAt: number;
  type?: string;
  scoreFormatted?: string;
  hasDub?: boolean;
}

export interface WatchHistoryItem {
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  animeTitle: string;
  episodeTitle?: string;
  posterUrl: string;
  lastWatchedAt: number;
  progressSeconds?: number;
  durationSeconds?: number;
  completed?: boolean;
  selectedLanguage: 'sub' | 'dub';
}

export interface UserSettings {
  preferredLanguage: 'sub' | 'dub';
  autoNext: boolean;
  autoplay: boolean;
}
