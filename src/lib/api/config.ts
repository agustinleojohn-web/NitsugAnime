const stripQuotes = (v: unknown): string => String(v ?? '').replace(/^["']|["']$/g, '').trim();

export const DEFAULT_PROXY_BASE = '/api/anikoto';

export function getApiBaseUrl(): string {
  const raw = stripQuotes(import.meta.env?.VITE_ANIKOTO_API_BASE_URL).replace(/\/+$/, '');
  if (!raw) return DEFAULT_PROXY_BASE;
  // Absolute third-party URLs are blocked by CORS in the browser; always go through the proxy.
  if (/^https?:\/\//i.test(raw) && !(typeof window !== 'undefined' && raw.startsWith(window.location.origin))) {
    return DEFAULT_PROXY_BASE;
  }
  return raw;
}

export const MEGAPLAY_BASE_URL =
  stripQuotes(import.meta.env?.VITE_MEGAPLAY_BASE_URL).replace(/\/+$/, '') || 'https://megaplay.buzz';

export const MEGAPLAY_ORIGIN = (() => {
  try {
    return new URL(MEGAPLAY_BASE_URL).origin;
  } catch {
    return 'https://megaplay.buzz';
  }
})();
