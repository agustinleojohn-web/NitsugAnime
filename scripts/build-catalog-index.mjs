#!/usr/bin/env node
// Generates the static catalog index from GET /recent-anime (the only listing endpoint Anikoto documents).
// Sequential, rate-limit aware (60 req / 120 s per IP), resumable, and atomic: a failed run never replaces a good index.
//   node scripts/build-catalog-index.mjs            (resume from cached pages)
//   node scripts/build-catalog-index.mjs --fresh    (ignore cached pages)
import { mkdir, readFile, writeFile, rm, rename, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.ANIKOTO_API_BASE || 'https://anikotoapi.site';
const OUT_DIR = path.join(ROOT, 'public', 'catalog');
const CACHE_DIR = path.join(ROOT, 'node_modules', '.cache', 'nitsug-catalog');
const PER_PAGE = 100; // server-enforced maximum (verified: per_page=500 returns 100)
const CHUNK_SIZE = 1500;
const SCHEMA_VERSION = 1;
const fresh = process.argv.includes('--fresh');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

let remaining = Infinity;
let resetAt = 0; // epoch seconds

async function waitForBudget() {
  if (remaining > 2) return;
  const wait = Math.max(0, resetAt * 1000 - Date.now()) + 2000;
  log(`rate budget low (${remaining} left); waiting ${Math.ceil(wait / 1000)}s for window reset`);
  await sleep(wait);
  remaining = Infinity;
}

async function fetchPage(page, attempt = 1) {
  await waitForBudget();
  const url = `${BASE}/recent-anime?page=${page}&per_page=${PER_PAGE}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    const rem = res.headers.get('x-ratelimit-remaining');
    const reset = res.headers.get('x-ratelimit-reset');
    if (rem !== null) remaining = Number(rem);
    if (reset !== null) resetAt = Number(reset);
    if (res.status === 429) {
      if (attempt > 4) throw new Error(`429 on page ${page} after ${attempt} attempts`);
      const ra = Number(res.headers.get('retry-after'));
      const wait = Number.isFinite(ra) && ra > 0 ? ra * 1000 : Math.max(5000, resetAt * 1000 - Date.now()) + 2000;
      log(`429 on page ${page}; waiting ${Math.ceil(wait / 1000)}s (attempt ${attempt})`);
      await sleep(wait);
      remaining = Infinity;
      return fetchPage(page, attempt + 1);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} on page ${page}`);
    const json = await res.json();
    if (!json || json.ok !== true || !Array.isArray(json.data) || !json.pagination) throw new Error(`Invalid payload on page ${page}`);
    return json;
  } catch (e) {
    if (attempt <= 3 && (e.name === 'AbortError' || e.cause)) {
      log(`network/timeout on page ${page}; retry ${attempt}`);
      await sleep(2000 * attempt);
      return fetchPage(page, attempt + 1);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function getPage(page) {
  const file = path.join(CACHE_DIR, `page-${page}.json`);
  if (!fresh && existsSync(file)) {
    try {
      const cached = JSON.parse(await readFile(file, 'utf8'));
      if (cached?.data?.length) return cached;
    } catch {}
  }
  const json = await fetchPage(page);
  await writeFile(file, JSON.stringify(json));
  return json;
}

function compact(raw, posterBase) {
  const terms = raw.terms_by_type || {};
  const rec = { id: raw.id, t: raw.title || '' };
  const alt = raw.alternative && raw.alternative !== raw.title ? raw.alternative : '';
  const syn = raw.titles && raw.titles !== raw.title && raw.titles !== raw.alternative ? raw.titles : '';
  if (alt) rec.a = alt;
  if (syn) rec.s = syn;
  if (raw.native && raw.native !== raw.title) rec.n = raw.native;
  if (raw.poster) rec.p = raw.poster.startsWith(posterBase) ? raw.poster.slice(posterBase.length) : raw.poster;
  if (terms.type?.[0]) rec.ty = terms.type[0];
  if (terms.genre?.length) rec.g = terms.genre.filter(Boolean);
  if (raw.year) rec.y = raw.year;
  if (raw.season) rec.se = raw.season;
  if (raw.status) rec.st = raw.status;
  if (raw.score && Number(raw.score) > 0) rec.sc = Number(raw.score);
  if (raw.episodes && Number(raw.episodes) > 0) rec.ep = Number(raw.episodes);
  if (raw.rating) rec.r = raw.rating;
  if (raw.is_sub) rec.sub = raw.is_sub;
  if (raw.is_dub) rec.dub = raw.is_dub;
  if (raw.source) rec.so = String(raw.source).trim();
  if (raw.mal_id) rec.mal = String(raw.mal_id);
  if (raw.ani_id) rec.ai = String(raw.ani_id);
  if (raw.aired) rec.ad = raw.aired;
  if (raw.duration) rec.d = raw.duration;
  if (raw.updated_at) rec.up = raw.updated_at;
  return rec;
}

async function main() {
  await mkdir(CACHE_DIR, { recursive: true });
  const first = await getPage(1);
  const { total, total_pages: totalPages } = first.pagination;
  if (!Number.isInteger(total) || !Number.isInteger(totalPages) || totalPages < 1) throw new Error('Pagination metadata missing');
  log(`API reports total=${total}, total_pages=${totalPages} at per_page=${PER_PAGE}`);

  const byId = new Map();
  const typeCounts = {};
  const ingest = (json) => {
    for (const raw of json.data) if (raw && raw.id != null) byId.set(raw.id, raw);
  };
  ingest(first);
  for (let p = 2; p <= totalPages; p++) {
    const json = await getPage(p);
    ingest(json);
    if (p % 10 === 0 || p === totalPages) log(`page ${p}/${totalPages}; unique=${byId.size}; budget=${remaining}`);
  }

  // Offsets can shift if titles update while we traverse. Verify and re-fetch (fresh) to fill gaps.
  for (let pass = 1; pass <= 2 && byId.size < total; pass++) {
    log(`unique ${byId.size} < total ${total}; verification pass ${pass}`);
    for (let p = 1; p <= totalPages; p++) {
      const json = await fetchPage(p);
      await writeFile(path.join(CACHE_DIR, `page-${p}.json`), JSON.stringify(json));
      ingest(json);
      if (byId.size >= total) break;
    }
  }

  const complete = byId.size === total;
  if (byId.size === 0) throw new Error('No records collected; refusing to publish');
  log(`collected unique=${byId.size} of reported total=${total} (complete=${complete})`);

  const posterBase = 'https://cdn.anipixcdn.co/thumbnail/';
  const records = [...byId.values()].map((r) => compact(r, posterBase));
  for (const r of records) typeCounts[r.ty || 'unknown'] = (typeCounts[r.ty || 'unknown'] || 0) + 1;
  const years = records.map((r) => r.y).filter(Boolean);

  const tmp = `${OUT_DIR}.tmp`;
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });
  const chunks = [];
  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    const name = `chunk-${chunks.length}.json`;
    const slice = records.slice(i, i + CHUNK_SIZE);
    await writeFile(path.join(tmp, name), JSON.stringify(slice));
    chunks.push({ file: name, count: slice.length });
  }
  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    source: `${BASE}/recent-anime`,
    apiReportedTotal: total,
    apiTotalPages: totalPages,
    perPage: PER_PAGE,
    recordCount: records.length,
    complete,
    posterBase,
    yearRange: years.length ? [Math.min(...years), Math.max(...years)] : null,
    typeCounts,
    chunks,
  };
  // Re-read what we wrote before publishing.
  let check = 0;
  for (const c of chunks) check += JSON.parse(await readFile(path.join(tmp, c.file), 'utf8')).length;
  if (check !== records.length) throw new Error('Chunk validation failed; not publishing');
  await writeFile(path.join(tmp, 'manifest.json'), JSON.stringify(manifest));

  await rm(OUT_DIR, { recursive: true, force: true });
  await rename(tmp, OUT_DIR);
  log('published', OUT_DIR, JSON.stringify({ records: records.length, complete, chunks: chunks.length, typeCounts }));
  const sizes = await Promise.all((await readdir(OUT_DIR)).map(async (f) => [f, (await readFile(path.join(OUT_DIR, f))).length]));
  log('sizes (bytes):', JSON.stringify(Object.fromEntries(sizes)));
}

main().catch((e) => {
  console.error('FAILED, existing index (if any) left untouched:', e.message);
  process.exit(1);
});
