/**
 * Sangeetify API Service
 * Connects the React frontend to the JioSaavn backend API.
 */

const API_BASE = '/api';

/**
 * Search for songs by query text or JioSaavn URL.
 * @param {string} query - Search text or JioSaavn URL
 * @returns {Promise<Array>} - Array of song objects
 */
export async function searchSongs(query) {
  try {
    const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();

    if (data.type === 'query' && Array.isArray(data.result)) {
      return data.result.map(normalizeSong);
    }
    if (data.type === 'song' && data.result) {
      return [normalizeSong(data.result)];
    }
    if ((data.type === 'album' || data.type === 'playlist') && data.result) {
      const songs = data.result.songs || [];
      return songs.map(normalizeSong);
    }
    return [];
  } catch (err) {
    console.error('Search API error:', err);
    return [];
  }
}

/**
 * Get song details by song ID.
 * @param {string} songId
 * @returns {Promise<Object|null>}
 */
export async function getSongDetails(songId) {
  try {
    const res = await fetch(`${API_BASE}/song/${songId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeSong(data);
  } catch (err) {
    console.error('Song details error:', err);
    return null;
  }
}

/**
 * Get verified media/streaming URL for a song.
 * @param {string} songId
 * @returns {Promise<string>}
 */
export async function getMediaUrl(songId) {
  try {
    const res = await fetch(`${API_BASE}/media_url/${songId}`);
    if (!res.ok) return '';
    const data = await res.json();
    return data.media_url || '';
  } catch (err) {
    console.error('Media URL error:', err);
    return '';
  }
}

/**
 * Get the direct stream URL (redirect) for a song.
 * @param {string} songId
 * @returns {string}
 */
export function getStreamUrl(songId) {
  return `${API_BASE}/stream/${songId}`;
}

/**
 * Get lyrics for a song.
 * @param {string} songId
 * @returns {Promise<Object|null>}
 */
export async function getLyrics(songId) {
  try {
    const res = await fetch(`${API_BASE}/lyrics/${songId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Lyrics error:', err);
    return null;
  }
}

/**
 * Get album details with all songs.
 * @param {string} albumId
 * @returns {Promise<Object|null>}
 */
export async function getAlbumDetails(albumId) {
  try {
    const res = await fetch(`${API_BASE}/album/${albumId}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.songs) {
      data.songs = data.songs.map(normalizeSong);
    }
    return data;
  } catch (err) {
    console.error('Album details error:', err);
    return null;
  }
}

/**
 * Get playlist details with all songs.
 * @param {string} playlistId
 * @param {number} pageNo
 * @returns {Promise<Object|null>}
 */
export async function getPlaylistDetails(playlistId, pageNo = 1) {
  try {
    const res = await fetch(`${API_BASE}/playlist/${playlistId}?page_no=${pageNo}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.songs) {
      data.songs = data.songs.map(normalizeSong);
    }
    return data;
  } catch (err) {
    console.error('Playlist details error:', err);
    return null;
  }
}

/**
 * Check if the backend API is healthy.
 * @returns {Promise<boolean>}
 */
export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch all sections synced with JioSaavn database suggestions and local tracks.
 * @returns {Promise<Object|null>}
 */
export async function getSyncedSections() {
  try {
    const res = await fetch(`${API_BASE}/sections`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Sections API error:', err);
    return null;
  }
}

/**
 * Fetch search suggestions, moods, and popular tags.
 * @returns {Promise<Object|null>}
 */
export async function getSuggestions() {
  try {
    const res = await fetch(`${API_BASE}/suggestions`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Suggestions API error:', err);
    return null;
  }
}

/**
 * Fetch recommendation songs based on query.
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getRecommendations(query = 'Bollywood Love Songs', limit = 10) {
  try {
    const res = await fetch(`${API_BASE}/recommendations?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Recommendations API error:', err);
    return [];
  }
}


/**
 * Normalize a JioSaavn song object into the format used by Sangeetify.
 * @param {Object} song - Raw song data from API
 * @returns {Object} - Normalized song object
 */
function normalizeSong(song) {
  if (!song) return null;

  // Extract artist names
  let artist = song.subtitle || '';
  if (!artist && song.artistMap) {
    const primaryArtists = song.artistMap.primary_artists || [];
    artist = primaryArtists.map(a => a.name).join(', ');
  }
  if (!artist) artist = song.music || 'Unknown Artist';

  // Build cover image URL (use high quality)
  let cover = song.image || '';
  if (cover) {
    cover = cover.replace('150x150', '500x500').replace('http://', 'https://');
  }
  if (!cover) {
    cover = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600';
  }

  // Build audio URL — prefer media_url (decrypted high quality), fallback to stream endpoint
  let audio = '';
  if (song.media_url) {
    audio = song.media_url;
  } else if (song.id) {
    audio = `${API_BASE}/stream/${song.id}`;
  }

  // Duration in seconds
  let duration = 0;
  if (song.duration) {
    duration = typeof song.duration === 'string' ? parseInt(song.duration, 10) : song.duration;
  }

  return {
    id: `jiosaavn-${song.id}`,
    jiosaavnId: song.id,
    title: cleanTitle(song.title || 'Unknown'),
    artist: cleanTitle(artist),
    language: song.language || 'Hindi',
    mood: song.label || '',
    category: song.album || song.type || 'Online',
    cover,
    audio,
    duration,
    isOnline: true,
    album: cleanTitle(song.album || ''),
    albumId: song.album_id || '',
    year: song.year || '',
    hasLyrics: song.has_lyrics === true || song.has_lyrics === 'true',
    playCount: song.play_count || 0,
    permaUrl: song.perma_url || '',
  };
}

/**
 * Clean HTML entities from titles.
 */
function cleanTitle(text) {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}
