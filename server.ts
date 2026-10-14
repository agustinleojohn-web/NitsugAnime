import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ANIKOTO_API_BASE = process.env.ANIKOTO_API_BASE_URL || 'https://anikotoapi.site';

app.use(express.json());

// In-memory cache to stay strictly within rate limits
const cache = new Map<string, { timestamp: number; data: unknown }>();
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

app.get('/api/anikoto/recent-anime', async (req, res) => {
  const page = String(req.query.page || '1');
  const per_page = String(req.query.per_page || '24');
  const cacheKey = `recent_${page}_${per_page}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const upstreamUrl = `${ANIKOTO_API_BASE}/recent-anime?page=${encodeURIComponent(page)}&per_page=${encodeURIComponent(per_page)}`;
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 NitsugAnime/1.0',
      },
    });

    if (response.status === 429) {
      if (cached) return res.json(cached.data);
      return res.status(429).json({ ok: false, error: 'Catalog rate limit reached, please retry shortly' });
    }

    if (!response.ok) {
      if (cached) return res.json(cached.data);
      return res.status(response.status).json({ ok: false, error: `Upstream error ${response.status}` });
    }

    const data = await response.json();
    cache.set(cacheKey, { timestamp: Date.now(), data });
    return res.json(data);
  } catch (err: unknown) {
    if (cached) return res.json(cached.data);
    const message = err instanceof Error ? err.message : 'Proxy connection failure';
    return res.status(500).json({ ok: false, error: message });
  }
});

app.get('/api/anikoto/series/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `series_${id}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const upstreamUrl = `${ANIKOTO_API_BASE}/series/${encodeURIComponent(id)}`;
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 NitsugAnime/1.0',
      },
    });

    if (response.status === 429) {
      if (cached) return res.json(cached.data);
      return res.status(429).json({ ok: false, error: 'Catalog rate limit reached, please retry shortly' });
    }

    if (!response.ok) {
      return res.status(response.status).json({ ok: false, error: `Series ${id} not found` });
    }

    const data = await response.json();
    cache.set(cacheKey, { timestamp: Date.now(), data });
    return res.json(data);
  } catch (err: unknown) {
    if (cached) return res.json(cached.data);
    const message = err instanceof Error ? err.message : 'Proxy connection failure';
    return res.status(500).json({ ok: false, error: message });
  }
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NitsugAnime server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
