const CLIENT_ID     = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

export const ARTIST_IDS = [
  '5PA8c8hzkgW5MhJgyWMuby',
  '1uJFG2oqOx1gPnqLe9jQtw',
];

export const PLAYLIST_ID = '3IdRl1tVoQ7h7PFX4zRRMH';

let _cache = { token: null, expires: 0 };

export async function getToken() {
  if (_cache.token && Date.now() < _cache.expires) return _cache.token;

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
        _cache = { token: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 };
        return _cache.token;
      }
    } catch (e) {
      // silencioso
    }
  }

  return import.meta.env.VITE_SPOTIFY_TOKEN || '';
}

export async function spotifyFetch(endpoint) {
  const token = await getToken();
  if (!token) return null;
  try {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export async function getArtist(id) {
  return spotifyFetch(`v1/artists/${id}`);
}

export async function getArtistAlbums(id, limit = 6) {
  const data = await spotifyFetch(
    `v1/artists/${id}/albums?include_groups=album,single&market=BR&limit=${limit}`
  );
  return data?.items || [];
}

// top-tracks pode retornar 403 com Client Credentials em alguns casos
// retorna array vazio silenciosamente — secao fica oculta
export async function getArtistTopTracks(id) {
  const data = await spotifyFetch(`v1/artists/${id}/top-tracks?market=BR`);
  return data?.tracks?.slice(0, 5) || [];
}

export async function getPlaylist(id) {
  return spotifyFetch(`v1/playlists/${id}`);
}

export const embedUrl = (type, id) =>
  `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
