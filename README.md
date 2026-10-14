# NitsugAnime

NitsugAnime is a responsive anime discovery and streaming web application inspired by the layout, navigation patterns, and user experience of modern streaming platforms. It features an original dark cinematic design, real catalog metadata integration, episode playback, watchlist management, and local watch history.

---

## 1. Features

- **Live Catalog Discovery:** Real-time data from the Anikoto catalog API with over 9,000 indexed anime titles.
- **Cinematic Discovery:** Featured hero banner, carousel rows, and responsive poster grids.
- **Detailed Anime Pages:** Full synopsis, metadata, alternative titles, genre tags, and comprehensive episode lists.
- **Episode Playback:** Integrates the documented MegaPlay stream embed player (`https://megaplay.buzz`) with native responsive widescreen 16:9 player container.
- **Audio Language Switching:** Switch between Subtitled (SUB) and Dubbed (DUB) versions when available.
- **Episode Navigation:** Previous/Next episode controls with verified episode ordering and Auto-Next on episode completion.
- **Local Persistence (No Account Needed):**
  - **Watchlist:** Save bookmarks with real-time sync across components.
  - **Watch History:** Tracks watched episodes, completion indicators, and direct episode resume points.
  - **Custom Preferences:** Persists preferred language (Sub vs Dub) and Auto-Next settings.
- **Explore & Filtering:** Multi-field filtering across formats (TV, Movie, ONA, OVA), air status, audio availability, and genres, with full server pagination support.
- **Instant Search:** Debounced title and genre search with shareable query URLs (`/search?q=...`) and quick-access modal dialog.
- **Strict Design System:**
  - Dark-only theme (`#09090B` background, `#7C3AED` accent).
  - Consistent `rounded` corner-radius rule across all cards, modals, badges, and controls.
  - Mobile bottom navigation bar with safe-area padding.

---

## 2. API & Provider Architecture

### Catalog Metadata API

- **Endpoint:** `https://anikotoapi.site`
- **Recent Anime:** `GET /recent-anime?page=1&per_page=30`
- **Series Detail & Episode List:** `GET /series/{id}`
- **Rate Limit:** 60 requests per 120 seconds per IP.

### Embed Video Player

- **Provider:** MegaPlay (`https://megaplay.buzz`)
- **Stream Format:** `https://megaplay.buzz/stream/s-2/{episode_embed_id}/{sub|dub}`
- **Fallback Formats:** `https://megaplay.buzz/stream/mal/{mal_id}/{episode_number}/{sub|dub}`

### Known Provider Status & Limitations

- **Stream File Availability:** Video playback relies entirely on third-party video hosts linked in the MegaPlay embed. Files that have been deleted or taken down by copyright holders return the provider's standard 410 error page. NitsugAnime handles this transparently by displaying native provider frames with direct stream links and error fallbacks.
- **Server Filtering:** The Anikoto API endpoint `/recent-anime` accepts `page` and `per_page`. Advanced filtering (by format, audio, genre, score) operates on the active loaded catalog batch, which is clearly communicated in the UI.

---

## 3. Getting Started

### Prerequisites

- Node.js 18+ or Node.js 20+
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Configuration

Copy `.env.example` to `.env`:

```bash
# Vite proxy / Catalog API configuration
VITE_ANIKOTO_API_BASE_URL="/api/anikoto"

# MegaPlay base embed URL
VITE_MEGAPLAY_BASE_URL="https://megaplay.buzz"
```

### Development

```bash
npm run dev
```

The application runs at `http://localhost:3000`. In development, Vite automatically proxies `/api/anikoto` requests to `https://anikotoapi.site` to prevent browser CORS restrictions.

### Production Build

```bash
npm run build
```

---

## 4. Deployment

### Vercel Deployment

The repository includes a preconfigured `vercel.json` file:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/anikoto/(.*)",
      "destination": "https://anikotoapi.site/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This enables both:

1. Edge-rewriting `/api/anikoto/*` to `https://anikotoapi.site/*` (resolving CORS without an intermediate node server).
2. SPA client-side routing fallback so direct navigation to `/anime/:id`, `/watch/:id/:ep`, `/explore`, and `/settings` works seamlessly upon page refresh.
