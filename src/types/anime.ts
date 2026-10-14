export interface RawAnimeItem {
  id: number;
  title: string;
  alternative?: string;
  titles?: string;
  native?: string;
  slug?: string;
  rating?: string;
  poster?: string;
  is_sub?: number;
  is_dub?: number;
  description?: string;
  aired?: string;
  season?: string;
  year?: number;
  duration?: string;
  status?: string;
  score?: string | number;
  mal_id?: string;
  episodes?: string;
  ani_id?: string;
  source?: string;
  s_id?: number;
  background_image?: string;
  updated_at?: string;
  next_air_schedule_time?: number;
  next_air_ep?: number;
  terms_by_type?: {
    genre?: string[];
    producers?: string[];
    studios?: string[];
    type?: string[];
  };
}

export interface RawEpisodeItem {
  id: number;
  title: string;
  jp_title?: string;
  number: number;
  episode_embed_id: string;
  embed_url?: {
    sub?: string;
    dub?: string;
    hsub?: string;
  };
  updated_at?: string;
}

export interface RawSeriesResponse {
  ok: boolean;
  anikoto_domains?: string[];
  data: {
    anime: RawAnimeItem;
    episodes: RawEpisodeItem[];
  };
}

export interface RawRecentAnimeResponse {
  ok: boolean;
  anikoto_domains?: string[];
  data: RawAnimeItem[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface NormalizedAnime {
  id: string;
  rawId: number;
  title: string;
  alternativeTitle?: string;
  /** Comma-separated alias list from the catalog's `titles` field. */
  synonyms?: string;
  nativeTitle?: string;
  /** Empty when the title comes from the catalog index (no descriptions are indexed). */
  synopsis: string;
  posterUrl: string;
  bannerUrl?: string;
  genres: string[];
  type: string;
  status: string;
  releaseYear?: number;
  aired?: string;
  season?: string;
  duration?: string;
  score?: number;
  scoreFormatted?: string;
  ageRating?: string;
  episodeCount?: number;
  isSubCount: number;
  isDubCount: number;
  hasSub: boolean;
  hasDub: boolean;
  malId?: string;
  aniId?: string;
  source?: string;
  studios: string[];
  producers: string[];
  updatedAt?: string;
  nextAirScheduleTime?: number;
  nextAirEp?: number;
}

export interface NormalizedEpisode {
  id: string;
  rawId: number;
  number: number;
  title: string;
  jpTitle?: string;
  episodeEmbedId: string;
  embedUrlSub?: string;
  embedUrlDub?: string;
  embedUrlHsub?: string;
  hasSub: boolean;
  hasDub: boolean;
  updatedAt?: string;
}

export interface NormalizedSeriesDetail {
  anime: NormalizedAnime;
  episodes: NormalizedEpisode[];
}
