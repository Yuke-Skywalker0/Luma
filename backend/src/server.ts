import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = Number(process.env.PORT || 8787);
const ORIGIN = process.env.FRONTEND_ORIGIN || '';
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
const APP_VERSION = process.env.APP_VERSION || '6.9.0';
const startedAt = Date.now();

type Provider = 'spotify' | 'audius' | 'jamendo' | 'musicbrainz' | 'soundcloud';
type Track = {
  id: string; title: string; artist: string; album: string; artwork?: string;
  duration?: number; isrc?: string; playable?: boolean; downloadable?: boolean;
  provider?: Provider; providerId?: string; externalUrl?: string; score?: number;
  version?: 'original' | 'remix' | 'live' | 'instrumental' | 'acoustic' | 'edit' | 'unknown';
};
type GraphTrack = Track & { sources: Track[]; matchConfidence: number };

const norm = (s = '') => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/\b(feat\.?|ft\.?|featuring)\b/g, ' ')
  .replace(/\((official|audio|video|lyrics?)\)/gi, ' ')
  .replace(/\[(official|audio|video|lyrics?)\]/gi, ' ')
  .replace(/[^a-z0-9]+/g, ' ').trim();
const tokenize = (s: string) => new Set(norm(s).split(' ').filter(Boolean));
const jaccard = (a: Set<string>, b: Set<string>) => {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const x of a) if (b.has(x)) intersection++;
  return intersection / (a.size + b.size - intersection);
};
const detectVersion = (title: string): Track['version'] => {
  const x = title.toLowerCase();
  if (/remix|rework|bootleg/.test(x)) return 'remix';
  if (/live|concert|festival/.test(x)) return 'live';
  if (/instrumental|karaoke/.test(x)) return 'instrumental';
  if (/acoustic|unplugged/.test(x)) return 'acoustic';
  if (/radio edit|edit\b/.test(x)) return 'edit';
  return 'original';
};

async function getJson(url: string, init: RequestInit = {}, timeout = 7000) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), timeout);
  try { const r = await fetch(url, { ...init, signal: c.signal }); if (!r.ok) throw new Error(`${r.status}`); return await r.json(); }
  finally { clearTimeout(t); }
}
async function safe<T>(fn: () => Promise<T>, fallback: T) { try { return await fn(); } catch { return fallback; } }

let spToken: { v: string; exp: number } | null = null;
async function spotifyToken() {
  const id = process.env.SPOTIFY_CLIENT_ID, sec = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !sec) return null;
  if (spToken && spToken.exp > Date.now() + 30000) return spToken.v;
  const basic = Buffer.from(`${id}:${sec}`).toString('base64');
  const r = await getJson('https://accounts.spotify.com/api/token', { method: 'POST', headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  spToken = { v: r.access_token, exp: Date.now() + r.expires_in * 1000 }; return spToken.v;
}
async function spotify(path: string, params: Record<string, string> = {}) {
  const tok = await spotifyToken(); if (!tok) return null;
  const u = new URL('https://api.spotify.com/v1' + path); Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  return getJson(u.toString(), { headers: { Authorization: `Bearer ${tok}` } });
}
async function spotifySearch(q: string, offset = 0) {
  const r = await spotify('/search', { q, type: 'artist,album,track', limit: '10', offset: String(offset), market: 'IT' });
  if (!r) return { artists: [], albums: [], tracks: [], total: 0 };
  return {
    artists: (r.artists?.items || []).map((x: any) => ({ id: `spotify:${x.id}`, name: x.name, image: x.images?.[0]?.url, provider: 'spotify', providerId: x.id, externalUrl: x.external_urls?.spotify })),
    albums: (r.albums?.items || []).map((x: any) => ({ id: `spotify:${x.id}`, title: x.name, artist: x.artists?.map((a: any) => a.name).join(', ') || '', artwork: x.images?.[0]?.url, releaseDate: x.release_date, trackCount: x.total_tracks, albumType: x.album_type, provider: 'spotify', providerId: x.id, externalUrl: x.external_urls?.spotify })),
    tracks: (r.tracks?.items || []).map((x: any): Track => ({ id: `spotify:${x.id}`, title: x.name, artist: x.artists?.map((a: any) => a.name).join(', ') || '', album: x.album?.name || '', artwork: x.album?.images?.[0]?.url, duration: Math.round((x.duration_ms || 0) / 1000), isrc: x.external_ids?.isrc, playable: false, provider: 'spotify', providerId: x.id, externalUrl: x.external_urls?.spotify, version: detectVersion(x.name) })),
    total: Math.max(r.artists?.total || 0, r.albums?.total || 0, r.tracks?.total || 0)
  };
}
async function spotifyArtist(id: string) { const r = await spotify(`/artists/${encodeURIComponent(id)}`); if (!r) return null; return { id: `spotify:${r.id}`, name: r.name, image: r.images?.[0]?.url, provider: 'spotify', providerId: r.id, externalUrl: r.external_urls?.spotify, genres: r.genres || [], followers: r.followers?.total || 0, popularity: r.popularity || 0 }; }
async function spotifyArtistTopTracks(id: string) {
  const r = await spotify(`/artists/${encodeURIComponent(id)}/top-tracks`, { market: 'IT' });
  if (!r) return [];
  return (r.tracks || []).map((x: any): Track => ({ id: `spotify:${x.id}`, title: x.name, artist: x.artists?.map((a: any) => a.name).join(', ') || '', album: x.album?.name || '', artwork: x.album?.images?.[0]?.url, duration: Math.round((x.duration_ms || 0) / 1000), isrc: x.external_ids?.isrc, playable: false, provider: 'spotify', providerId: x.id, externalUrl: x.external_urls?.spotify, version: detectVersion(x.name) }));
}
async function spotifyArtistAlbums(id: string, offset = 0) {
  const r = await spotify(`/artists/${encodeURIComponent(id)}/albums`, { include_groups: 'album,single,compilation,appears_on', limit: '10', offset: String(offset), market: 'IT' });
  if (!r) return { items: [], total: 0 };
  return { items: (r.items || []).map((x: any) => ({ id: `spotify:${x.id}`, title: x.name, artist: x.artists?.map((a: any) => a.name).join(', ') || '', artwork: x.images?.[0]?.url, releaseDate: x.release_date, trackCount: x.total_tracks, albumType: x.album_type, provider: 'spotify', providerId: x.id, externalUrl: x.external_urls?.spotify })), total: r.total || 0 };
}
async function spotifyAlbum(id: string) {
  const r = await spotify(`/albums/${encodeURIComponent(id)}`, { market: 'IT' }); if (!r) return null;
  return { id: `spotify:${r.id}`, title: r.name, artist: r.artists?.map((a: any) => a.name).join(', ') || '', artwork: r.images?.[0]?.url, releaseDate: r.release_date, trackCount: r.total_tracks, albumType: r.album_type, label: r.label, copyrights: r.copyrights?.map((c: any) => c.text) || [], provider: 'spotify', providerId: r.id, externalUrl: r.external_urls?.spotify,
    tracks: (r.tracks?.items || []).map((x: any): Track => ({ id: `spotify:${x.id}`, title: x.name, artist: x.artists?.map((a: any) => a.name).join(', ') || '', album: r.name, artwork: r.images?.[0]?.url, duration: Math.round((x.duration_ms || 0) / 1000), playable: false, provider: 'spotify', providerId: x.id, externalUrl: x.external_urls?.spotify, version: detectVersion(x.name) })) };
}
async function audiusSearch(q: string, offset = 0) {
  const base = process.env.AUDIUS_API_BASE || 'https://discoveryprovider.audius.co/v1'; const u = new URL(`${base}/tracks/search`); u.searchParams.set('query', q); u.searchParams.set('limit', '50'); u.searchParams.set('offset', String(offset)); u.searchParams.set('sort_method', 'relevant'); if (process.env.AUDIUS_API_KEY) u.searchParams.set('api_key', process.env.AUDIUS_API_KEY);
  const r = await getJson(u.toString()); return (r.data || []).map((x: any): Track => ({ id: `audius:${x.id}`, title: x.title, artist: x.user?.name || '', album: x.album_title || '', artwork: x.artwork?.['1000x1000'] || x.artwork?.['480x480'], duration: x.duration, isrc: x.isrc, playable: true, downloadable: Boolean(x.downloadable), provider: 'audius', providerId: x.id, externalUrl: x.permalink ? `https://audius.co${x.permalink}` : undefined, version: detectVersion(x.title) }));
}
async function jamendoSearch(q: string, offset = 0) {
  const id = process.env.JAMENDO_CLIENT_ID; if (!id) return []; const u = new URL(`${process.env.JAMENDO_API_BASE || 'https://api.jamendo.com/v3.0'}/tracks/`); u.searchParams.set('client_id', id); u.searchParams.set('format', 'json'); u.searchParams.set('limit', '50'); u.searchParams.set('offset', String(offset)); u.searchParams.set('namesearch', q); u.searchParams.set('include', 'musicinfo');
  const r = await getJson(u.toString()); return (r.results || []).map((x: any): Track => ({ id: `jamendo:${x.id}`, title: x.name, artist: x.artist_name || '', album: x.album_name || '', artwork: x.album_image || x.image, duration: x.duration, playable: Boolean(x.audio), downloadable: Boolean(x.audiodownload_allowed), provider: 'jamendo', providerId: String(x.id), externalUrl: x.shareurl, version: detectVersion(x.name) }));
}
async function musicbrainzSearch(q: string) {
  const u = new URL('https://musicbrainz.org/ws/2/recording'); u.searchParams.set('query', q); u.searchParams.set('fmt', 'json'); u.searchParams.set('limit', '25');
  const r = await getJson(u.toString(), { headers: { 'User-Agent': process.env.MUSICBRAINZ_USER_AGENT || 'LumaMusic/6.5 (contact@example.com)' } });
  return (r.recordings || []).map((x: any): Track => ({ id: `musicbrainz:${x.id}`, title: x.title, artist: x['artist-credit']?.map((a: any) => a.name || a.artist?.name).join(', ') || '', album: x.releases?.[0]?.title || '', duration: x.length ? Math.round(x.length / 1000) : undefined, isrc: x.isrcs?.[0], playable: false, provider: 'musicbrainz', providerId: x.id, version: detectVersion(x.title) }));
}

function score(a: Track, b: Track) {
  if (a.provider === b.provider && a.providerId === b.providerId) return 200;
  let s = 0;
  if (a.isrc && b.isrc && a.isrc.replace(/-/g, '').toUpperCase() === b.isrc.replace(/-/g, '').toUpperCase()) s += 120;
  const aa = norm(a.artist), ba = norm(b.artist), at = norm(a.title), bt = norm(b.title);
  const artistSim = jaccard(tokenize(a.artist), tokenize(b.artist));
  const titleSim = jaccard(tokenize(a.title), tokenize(b.title));
  s += Math.round(artistSim * 30) + Math.round(titleSim * 45);
  if (aa && ba && (aa === ba || aa.includes(ba) || ba.includes(aa))) s += 20;
  if (at === bt) s += 30;
  if (a.duration && b.duration) { const d = Math.abs(a.duration - b.duration); if (d <= 2) s += 25; else if (d <= 5) s += 12; else if (d > 15) s -= 20; }
  if (norm(a.album) && norm(b.album) && norm(a.album) === norm(b.album)) s += 8;
  if (a.version && b.version && a.version !== b.version && a.version !== 'unknown' && b.version !== 'unknown') s -= 35;
  return Math.max(0, s);
}
function matchThreshold(a: Track, b: Track) { return Boolean(a.isrc && b.isrc && a.isrc.replace(/-/g, '').toUpperCase() === b.isrc.replace(/-/g, '').toUpperCase()) || score(a, b) >= 72; }
function buildGraph(tracks: Track[]): GraphTrack[] {
  const groups: GraphTrack[] = [];
  for (const t of tracks) {
    let best: GraphTrack | undefined; let bestScore = -1;
    for (const g of groups) { const s = score(g, t); if (s > bestScore) { bestScore = s; best = g; } }
    if (best && matchThreshold(best, t)) {
      best.sources.push(t); best.matchConfidence = Math.max(best.matchConfidence, Math.min(100, bestScore));
      if (!best.playable && t.playable) Object.assign(best, t, { id: best.id, sources: best.sources, matchConfidence: best.matchConfidence });
      else { best.playable = Boolean(best.playable || t.playable); best.downloadable = Boolean(best.downloadable || t.downloadable); }
    } else {
      groups.push({ ...t, sources: [t], matchConfidence: 100 });
    }
  }
  return groups.map(g => ({ ...g, score: g.sources.length > 1 ? g.matchConfidence : undefined }));
}

const memoryCache = new Map<string, { expires: number; data: any }>();
const inflight = new Map<string, Promise<any>>();
const MAX_CACHE = 250;
async function cached<T>(key: string, fn: () => Promise<T>, ttl = 120000): Promise<T> {
  const now = Date.now();
  const old = memoryCache.get(key);
  if (old && old.expires > now) return old.data as T;
  const running = inflight.get(key);
  if (running) return running as Promise<T>;
  const job = fn().then(data => {
    if (memoryCache.size >= MAX_CACHE) {
      const first = memoryCache.keys().next().value;
      if (first) memoryCache.delete(first);
    }
    memoryCache.set(key, { expires: Date.now() + ttl, data });
    return data;
  }).finally(() => inflight.delete(key));
  inflight.set(key, job);
  return job;
}


app.get('/health', (_, res) => res.json({ ok: true, version: APP_VERSION, graph: true, cache: true, cacheEntries: memoryCache.size, uptimeSeconds: Math.floor((Date.now()-startedAt)/1000) }));
app.get('/api/config', (_, res) => res.json({ app: 'Luma Music', version: APP_VERSION, environment: process.env.NODE_ENV || 'production', frontend: true, providers: { spotify: Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET), audius: Boolean(process.env.AUDIUS_API_KEY || process.env.AUDIUS_API_BASE), jamendo: Boolean(process.env.JAMENDO_CLIENT_ID), soundcloud: Boolean(process.env.SOUNDCLOUD_CLIENT_ID), musicbrainz: true } }));
app.get('/api/version', (_, res) => res.json({ version: APP_VERSION }));
app.get('/api/providers', (_, res) => res.json({ providers: [
  { id: 'spotify', role: 'metadata', configured: Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) },
  { id: 'musicbrainz', role: 'metadata', configured: true },
  { id: 'audius', role: 'audio', configured: true },
  { id: 'jamendo', role: 'audio', configured: Boolean(process.env.JAMENDO_CLIENT_ID) },
  { id: 'soundcloud', role: 'audio', configured: Boolean(process.env.SOUNDCLOUD_CLIENT_ID) }
] }));
app.get('/api/search', async (req, res) => {
  const q = String(req.query.q || '').trim(); if (!q) return res.json({ artists: [], albums: [], tracks: [], graph: [], sources: {} });
  const offset = Number(req.query.offset || 0);
  const data = await cached(`search:${q}:${offset}`, async () => {
    const [sp, au, ja, mb] = await Promise.all([
      safe(() => spotifySearch(q, offset), { artists: [], albums: [], tracks: [], total: 0 }),
      safe(() => audiusSearch(q, offset), []), safe(() => jamendoSearch(q, offset), []), safe(() => musicbrainzSearch(q), [])
    ]);
    const graph = buildGraph([...sp.tracks, ...au, ...ja, ...mb]);
    return {
      artists: sp.artists, albums: sp.albums, tracks: graph, musicbrainz: mb, total: sp.total,
      pagination: { offset, pageSize: 10, nextOffset: offset + 10, hasMore: offset + 10 < sp.total },
      providers: { spotify: sp.tracks.length > 0 || sp.artists.length > 0, audius: au.length > 0, jamendo: ja.length > 0, musicbrainz: mb.length > 0 },
      cache: { key: `search:${q}:${offset}`, ttlMs: 120000 }
    };
  });
  res.json(data);
});
app.get('/api/graph/preview', async (req, res) => {
  const a: Track = { id: 'demo:a', title: String(req.query.title || 'Cenere'), artist: String(req.query.artist || 'Lazza'), album: String(req.query.album || 'Sirio'), duration: Number(req.query.duration || 196), isrc: String(req.query.isrc || '') || undefined, provider: 'spotify', providerId: 'demo' };
  const candidates: Track[] = [
    { id: 'demo:b', title: a.title, artist: a.artist, album: a.album, duration: a.duration, isrc: a.isrc, provider: 'audius', providerId: 'demo-au', playable: true },
    { id: 'demo:c', title: `${a.title} (Official Audio)`, artist: a.artist, album: a.album, duration: (a.duration || 0) + 1, provider: 'jamendo', providerId: 'demo-ja', playable: true },
    { id: 'demo:d', title: `${a.title} (Live)`, artist: a.artist, album: a.album, duration: (a.duration || 0) + 80, provider: 'musicbrainz', providerId: 'demo-mb', playable: false, version: 'live' }
  ];
  res.json({ base: a, graph: buildGraph([a, ...candidates]) });
});
app.get('/api/artists/:provider/:id', async (req, res) => {
  if (req.params.provider === 'spotify') {
    const [artist, topTracks, albums] = await Promise.all([spotifyArtist(req.params.id), spotifyArtistTopTracks(req.params.id), spotifyArtistAlbums(req.params.id, 0)]);
    if (!artist) return res.status(404).json({ error: 'artist not found' });
    return res.json({ ...artist, topTracks, albums: albums.items, albumTotal: albums.total });
  }
  res.status(404).json({ error: 'provider not implemented' });
});
app.get('/api/artists/:provider/:id/albums', async (req, res) => { if (req.params.provider === 'spotify') return res.json(await spotifyArtistAlbums(req.params.id, Number(req.query.offset || 0))); res.status(404).json({ error: 'provider not implemented' }); });
app.get('/api/albums/:provider/:id', async (req, res) => {
  if (req.params.provider === 'spotify') { const a = await spotifyAlbum(req.params.id); if (!a) return res.status(404).json({ error: 'album not found' }); return res.json(a); }
  res.status(404).json({ error: 'provider not implemented' });
});
app.get('/api/resolve/:provider/:id', async (req, res) => {
  const { provider, id } = req.params;
  if (provider === 'audius') { const u = new URL(`${process.env.AUDIUS_API_BASE || 'https://discoveryprovider.audius.co/v1'}/tracks/${encodeURIComponent(id)}/stream`); if (process.env.AUDIUS_API_KEY) u.searchParams.set('api_key', process.env.AUDIUS_API_KEY); return res.json({ provider, streamUrl: u.toString(), playable: true }); }
  if (provider === 'jamendo') { const cid = process.env.JAMENDO_CLIENT_ID; if (!cid) return res.status(404).json({ error: 'Jamendo not configured' }); const r = await getJson(`${process.env.JAMENDO_API_BASE || 'https://api.jamendo.com/v3.0'}/tracks/?client_id=${encodeURIComponent(cid)}&format=json&tracks=${encodeURIComponent(id)}`); const x = r.results?.[0]; if (!x?.audio) return res.status(404).json({ error: 'No playable source' }); return res.json({ provider, streamUrl: x.audio, playable: true, downloadable: Boolean(x.audiodownload_allowed) }); }
  res.status(404).json({ error: 'No direct resolver for this provider' });
});
// In production Render serves both the React app and API from one public URL.
app.use(express.static(frontendDist, { index: 'index.html' }));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/') || req.path === '/health') return next();
  res.sendFile(path.join(frontendDist, 'index.html'), err => { if (err) next(err); });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Luma Music ${APP_VERSION} listening on :${PORT}`));
