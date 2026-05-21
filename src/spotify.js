const CLIENT_ID     = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

export const ARTIST_IDS = [
  '5PA8c8hzkgW5MhJgyWMuby',
  '1uJFG2oqOx1gPnqLe9jQtw',
];

export const PLAYLIST_ID = '3IdRl1tVoQ7h7PFX4zRRMH';

// ── Token cache (memória, expira com o token) ──────────────────
let _tokenCache = { token: null, expires: 0 };

// ── Data cache (localStorage, TTL 1 hora) ─────────────────────
// Evita repetir chamadas à API a cada visita ou remount do componente.
const DATA_TTL = 60 * 60 * 1000;

function lsGet(key) {
  try {
    const raw = localStorage.getItem('sp_' + key);
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (Date.now() < item.expires) return item.data;
    localStorage.removeItem('sp_' + key);
  } catch {}
  return null;
}

function lsSet(key, data) {
  try {
    localStorage.setItem('sp_' + key, JSON.stringify({
      data,
      expires: Date.now() + DATA_TTL,
    }));
  } catch {}
}

export async function getToken() {
  if (_tokenCache.token && Date.now() < _tokenCache.expires) return _tokenCache.token;

  // Tenta Client Credentials (token auto-renovável)
  if (CLIENT_ID && CLIENT_SECRET) {
    try {
      const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${creds}`,
        },
        body: 'grant_type=client_credentials',
      });
      const data = await res.json();
      if (data.access_token) {
        _tokenCache = { token: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 };
        return _tokenCache.token;
      }
    } catch {}
  }

  // Fallback: token manual do .env (gerado pelo developer console)
  return import.meta.env.VITE_SPOTIFY_TOKEN || '';
}

// Verifica se um endpoint está retornando rate limit com o token atual
// Se sim, tenta limpar cache e usar fallback
async function fetchWithFallback(endpoint) {
  const cached = lsGet(endpoint);
  if (cached) return cached;

  const token = await getToken();
  if (!token) return null;
  try {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Se rate limit com client credentials, tenta com token manual
    if (res.status === 429) {
      const manualToken = import.meta.env.VITE_SPOTIFY_TOKEN;
      if (manualToken && manualToken !== token) {
        const res2 = await fetch(`https://api.spotify.com/${endpoint}`, {
          headers: { Authorization: `Bearer ${manualToken}` },
        });
        if (res2.ok) {
          const data2 = await res2.json();
          lsSet(endpoint, data2);
          return data2;
        }
      }
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    lsSet(endpoint, data);
    return data;
  } catch {
    return null;
  }
}

export async function spotifyFetch(endpoint) {
  return fetchWithFallback(endpoint);
}

export async function getArtist(id) {
  return spotifyFetch(`v1/artists/${id}`);
}

export async function getArtistAlbums(id, limit = 8) {
  const data = await spotifyFetch(
    `v1/artists/${id}/albums?include_groups=album,single&market=BR&limit=${limit}`
  );
  return data?.items || [];
}

// top-tracks retorna 403 com Client Credentials — seção fica oculta silenciosamente
export async function getArtistTopTracks(id) {
  const data = await spotifyFetch(`v1/artists/${id}/top-tracks?market=BR`);
  return data?.tracks?.slice(0, 5) || [];
}

export async function getPlaylist(id) {
  return spotifyFetch(`v1/playlists/${id}`);
}

export const embedUrl = (type, id) =>
  `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
