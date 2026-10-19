import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Home,
  Search,
  Library,
  Heart,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Volume2,
  Volume1,
  VolumeX,
  Clock,
  Music,
  User,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Plus,
  Trash2,
  ListMusic,
  Check,
  Upload,
  X,
  Globe,
  Wifi,
  WifiOff,
  Loader,
  BookOpen,
  Download,
  Maximize2,
  RotateCcw,
  RotateCw,
  Sparkles,
  ListOrdered,
} from "lucide-react";
import "./Sangeetify.css";
import {
  searchSongs,
  getMediaUrl,
  getLyrics,
  checkApiHealth,
  getSyncedSections,
  getSuggestions,
} from "./api.js";

import { LOCAL_SONGS } from "./localSongsData.js";

/* =========================================================
   DYNAMIC ARTISTIC COVER GENERATOR
   Guarantees 100% unique cover templates for every song.
   If two songs share an identical compilation artwork,
   or if an artwork is missing, each gets its own unique
   tailor-made vinyl gradient artwork with title and artist!
========================================================= */
const ARTISTIC_PALETTES = [
  { from: "#ff416c", to: "#8a2387", accent: "#ff4b2b", name: "Sunset Neon" },
  { from: "#200122", to: "#6f0000", accent: "#ff0844", name: "Crimson Velvet" },
  { from: "#0f2027", to: "#203a43", accent: "#00d2ff", name: "Deep Cyan" },
  { from: "#134e5e", to: "#71b280", accent: "#2ecc71", name: "Emerald Glade" },
  { from: "#3a1c71", to: "#d76d77", accent: "#ffaf7b", name: "Coral Sunset" },
  { from: "#1f1c2c", to: "#928dab", accent: "#a18cd1", name: "Mystic Lavender" },
  { from: "#000428", to: "#004e92", accent: "#00c6ff", name: "Midnight Ocean" },
  { from: "#1a2a6c", to: "#b21f1f", accent: "#fdbb2d", name: "Triad Fire" },
  { from: "#141e30", to: "#243b55", accent: "#1ed760", name: "Spotify Noir" },
  { from: "#4b1248", to: "#f0c27b", accent: "#f37335", name: "Amber Aura" },
  { from: "#0d1b2a", to: "#415a77", accent: "#778da9", name: "Slate Groove" },
  { from: "#2c3e50", to: "#fd746c", accent: "#ff9068", name: "Peach Wave" },
];

function getHash(str) {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateUniqueCoverArt(title = "Track", artist = "Artist", category = "Music") {
  const hash = getHash(`${title}-${artist}`);
  const grad = ARTISTIC_PALETTES[hash % ARTISTIC_PALETTES.length];
  const cleanTitle = (title || "Track").replace(/[<>&"']/g, "").slice(0, 22);
  const cleanArtist = (artist || "Artist").replace(/[<>&"']/g, "").slice(0, 26);
  const initials = (cleanTitle.trim() || "SG").slice(0, 2).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
    <defs>
      <linearGradient id="bg_${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${grad.from}"/>
        <stop offset="100%" stop-color="${grad.to}"/>
      </linearGradient>
      <radialGradient id="vignette_${hash}" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.75"/>
      </radialGradient>
      <linearGradient id="glow_${hash}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${grad.accent}"/>
        <stop offset="100%" stop-color="#1ed760"/>
      </linearGradient>
    </defs>
    <rect width="500" height="500" fill="url(#bg_${hash})"/>
    <rect width="500" height="500" fill="url(#vignette_${hash})"/>

    <!-- High-res vinyl record geometric art -->
    <circle cx="250" cy="205" r="148" fill="#111113" stroke="${grad.accent}" stroke-width="2" stroke-opacity="0.5"/>
    <circle cx="250" cy="205" r="128" fill="none" stroke="#222225" stroke-width="1.8"/>
    <circle cx="250" cy="205" r="108" fill="none" stroke="#1c1c1f" stroke-width="1.8"/>
    <circle cx="250" cy="205" r="88" fill="none" stroke="#252529" stroke-width="1.5"/>
    <circle cx="250" cy="205" r="68" fill="url(#bg_${hash})" fill-opacity="0.95"/>
    <circle cx="250" cy="205" r="22" fill="#111113"/>
    <circle cx="250" cy="205" r="7" fill="#ffffff" fill-opacity="0.9"/>

    <!-- Center initial stamp -->
    <text x="250" y="213" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="24" letter-spacing="1">${initials}</text>

    <!-- Category Pill Badge top-left -->
    <rect x="30" y="30" width="${Math.min(180, (category.length * 9) + 28)}" height="26" rx="13" fill="#000000" fill-opacity="0.65" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="44" y="47" fill="${grad.accent}" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="11" letter-spacing="0.8">${(category || "MUSIC").toUpperCase()}</text>

    <!-- Acoustic Sound Wave Equalizer top-right -->
    <rect x="420" y="32" width="4" height="18" rx="2" fill="${grad.accent}"/>
    <rect x="428" y="26" width="4" height="24" rx="2" fill="#1ed760"/>
    <rect x="436" y="36" width="4" height="14" rx="2" fill="${grad.accent}"/>
    <rect x="444" y="28" width="4" height="22" rx="2" fill="#1ed760"/>
    <rect x="452" y="34" width="4" height="16" rx="2" fill="${grad.accent}"/>

    <!-- Typography bottom banner -->
    <rect x="0" y="360" width="500" height="140" fill="#000000" fill-opacity="0.55"/>
    <rect x="30" y="382" width="28" height="4" rx="2" fill="url(#glow_${hash})"/>
    <text x="30" y="420" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="28" letter-spacing="-0.3">${cleanTitle}</text>
    <text x="30" y="454" fill="rgba(255,255,255,0.72)" font-family="Inter, Arial, sans-serif" font-weight="500" font-size="16">${cleanArtist}</text>

    <!-- Sangeetify Originals Brand Tag -->
    <text x="470" y="475" text-anchor="end" fill="rgba(255,255,255,0.3)" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="9" letter-spacing="1.5">SANGEETIFY MASTER</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function computeGridCovers(songList = []) {
  const seenCovers = new Set();
  const coverMap = new Map();
  songList.forEach((s) => {
    const rawCover = s.cover;
    if (rawCover && !seenCovers.has(rawCover)) {
      seenCovers.add(rawCover);
      coverMap.set(s.id, rawCover);
    } else {
      // If cover is duplicate (compilation album) or missing, generate unique cover art!
      coverMap.set(s.id, generateUniqueCoverArt(s.title, s.artist, s.category || s.language || "Music"));
    }
  });
  return coverMap;
}

const DEFAULT_FALLBACK_COVER = generateUniqueCoverArt("Sangeetify", "Original", "Master");

/* =========================================================
   HELPERS
========================================================= */
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function resolveAudioUrl(audioPath) {
  if (!audioPath) return "";
  try {
    return new URL(audioPath, window.location.href).href;
  } catch {
    return audioPath;
  }
}

/* =========================================================
   SONG CARD TEMPLATE
   Features:
   - 100% Unique cover artwork guarantee
   - Category / Language pill badge
   - Top-right Add to Playlist (+) button
   - Top-right Favorite (Heart) button
   - Live animated sound equalizer wave bars on active song
   - Circular floating play/pause button
   - Crisp typography and metadata row
========================================================= */
function SongCard({
  song,
  liked,
  onPlay,
  onToggleLike,
  onAddToPlaylist,
  isCurrentSong,
  isPlaying,
  customCover,
}) {
  const coverSrc =
    customCover ||
    song.cover ||
    generateUniqueCoverArt(song.title, song.artist, song.category || song.language);

  const getBadgeLabel = () => {
    if (song.category === "90s Gold") return "📼 90s Gold";
    if (song.category === "Trending") return "🔥 Trending";
    if (song.category === "Bhakti") return "🙏 Bhakti";
    if (song.category === "Regional") return `🌐 ${song.language || "Regional"}`;
    return song.language || "Music";
  };

  return (
    <div
      className={`song-card ${isCurrentSong ? "song-card-active" : ""}`}
      onClick={() => onPlay(song)}
    >
      <div className="song-image-wrapper">
        <img
          src={coverSrc}
          alt={song.title}
          className="song-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = generateUniqueCoverArt(
              song.title,
              song.artist,
              song.category || song.language
            );
          }}
        />

        {/* Category / Language Pill Badge */}
        <span className="card-badge">{getBadgeLabel()}</span>

        {/* Card Top Action Buttons: Add to Playlist (+) & Like (Heart) */}
        <div className="card-top-actions">
          <button
            className="card-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist && onAddToPlaylist(song);
            }}
            title="Add to Playlist (+)"
          >
            <Plus size={16} />
          </button>

          <button
            className={`card-like-btn ${liked ? "card-like-active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(song.id);
            }}
            title={liked ? "Remove from Liked" : "Like Song"}
          >
            <Heart
              size={15}
              fill={liked ? "#1ed760" : "none"}
              color={liked ? "#1ed760" : "white"}
            />
          </button>
        </div>

        {/* Live Audio Waves when this song is actively playing */}
        {isCurrentSong && isPlaying && (
          <div className="card-playing-indicator" title="Now Playing">
            <span className="eq-bar bar-1"></span>
            <span className="eq-bar bar-2"></span>
            <span className="eq-bar bar-3"></span>
            <span className="eq-bar bar-4"></span>
          </div>
        )}

        {/* Play/Pause Button */}
        <button
          className={`card-play-button ${isCurrentSong && isPlaying ? "playing" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onPlay(song);
          }}
          title={isCurrentSong && isPlaying ? "Pause" : "Play"}
        >
          {isCurrentSong && isPlaying ? (
            <Pause size={20} fill="black" color="black" />
          ) : (
            <Play size={20} fill="black" color="black" style={{ marginLeft: 2 }} />
          )}
        </button>
      </div>

      <div className="song-card-info">
        <div className="song-card-title-row">
          <span className="song-card-title" title={song.title}>
            {song.title}
          </span>
          {song.isOnline && (
            <span className="online-tag" title="JioSaavn Online Track">
              <Globe size={12} />
            </span>
          )}
        </div>

        <div className="song-card-artist" title={song.artist}>
          {song.artist}
        </div>

        <div className="song-card-meta">
          <span>{song.language}</span>
          <span className="meta-dot">•</span>
          <span>{song.mood || song.category}</span>
          {song.year && (
            <>
              <span className="meta-dot">•</span>
              <span>{song.year}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN SANGEETIFY APPLICATION
========================================================= */
export default function Sangeetify() {
  // Songs repository: starts with verified local songs, dynamically synced with JioSaavn database
  const [songs, setSongs] = useState(LOCAL_SONGS);

  // Synced sections state
  const [syncedSections, setSyncedSections] = useState({
    trending: LOCAL_SONGS.filter((s) => s.category === "Trending"),
    bollywood90s: LOCAL_SONGS.filter((s) => s.category === "90s Gold"),
    regional: LOCAL_SONGS.filter((s) => s.category === "Regional"),
    bhakti: LOCAL_SONGS.filter((s) => s.category === "Bhakti"),
    romantic: LOCAL_SONGS.filter(
      (s) => s.category === "Bollywood" || s.mood?.includes("Romantic")
    ),
  });

  // Home filter pill
  const [activeFilter, setActiveFilter] = useState("all");

  // Navigation
  const [currentTab, setCurrentTab] = useState("home");
  const [historyStack, setHistoryStack] = useState(["home"]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Playback state
  // Default to famous track "Dil Ne Yeh Kaha Hain Dil Se" or first song
  const initialSong =
    LOCAL_SONGS.find((s) => s.title.includes("Dil Ne Yeh Kaha")) || LOCAL_SONGS[0];
  const [currentSong, setCurrentSong] = useState(initialSong);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // 'off' | 'all' | 'one'
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.75 | 1 | 1.25 | 1.5 | 2

  // Volume
  const [volume, setVolume] = useState(0.8);
  const [previousVolume, setPreviousVolume] = useState(0.8);

  // Progress
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialSong?.duration || 0);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState("all"); // 'all' | 'library' | 'online'
  const [searchOnlineResults, setSearchOnlineResults] = useState([]);
  const [isSearchSearching, setIsSearchSearching] = useState(false);
  const [onlineSearchQuery, setOnlineSearchQuery] = useState("");
  const [onlineResults, setOnlineResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  // Synced Suggestions & Tags
  const [suggestions, setSuggestions] = useState({
    popular_queries: [
      "Arijit Singh",
      "Barsaat",
      "Dil Ne Yeh Kaha Hai Dil Se",
      "Kesariya",
      "Anuv Jain",
      "Karan Aujla",
      "Lata Mangeshkar",
      "Kalyani Remix",
      "Shree Hanuman Chalisa",
      "Naatu Naatu",
      "Arabic Kuthu",
      "Shreya Ghoshal",
      "Atif Aslam",
      "Pritam",
    ],
    moods: [
      "90s Nostalgia",
      "Romantic",
      "Party",
      "Devotional",
      "Soulful",
      "Indie Pop",
    ],
    languages: ["Hindi", "Punjabi", "Tamil", "Telugu", "Gujarati", "Bhojpuri", "Marathi"],
  });

  // Studio / Expanded Player & Queue Drawer State
  const [isExpandedPlayerOpen, setIsExpandedPlayerOpen] = useState(false);
  const [expandedTab, setExpandedTab] = useState("player"); // 'player' | 'lyrics' | 'queue'
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Lyrics state
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [currentLyrics, setCurrentLyrics] = useState(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

  // User Library state
  const [likedSongIds, setLikedSongIds] = useState(() => {
    try {
      const saved = localStorage.getItem("sangeetify_liked");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [playedHistory, setPlayedHistory] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("sangeetify_history") || "[1,2,3]"
      );
    } catch {
      return [1, 2, 3];
    }
  });

  const [customPlaylists, setCustomPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem("sangeetify_custom_playlists");
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 101,
          name: "90s Retro Romance 📼",
          songIds: [42, 36, 11, 9],
        },
        {
          id: 102,
          name: "Morning Bhakti Vibe 🙏",
          songIds: [15, 25, 40],
        },
        {
          id: 103,
          name: "Multi-Language Party 🎉",
          songIds: [1, 31, 12, 3],
        },
      ];
    } catch {
      return [];
    }
  });

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(101);
  const [playlistModalSong, setPlaylistModalSong] = useState(null);
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastProgressBucketRef = useRef(-1);
  const searchTimerRef = useRef(null);
  const searchOnlineTimerRef = useRef(null);

  /* =====================================================
     SYNC ALLOVER DATABASE SONGS IN APPLICATION
  ===================================================== */
  const syncWithDatabase = useCallback(async () => {
    try {
      const isHealthy = await checkApiHealth();
      setApiOnline(isHealthy);

      if (isHealthy) {
        // Fetch synced sections from backend
        const sectionsData = await getSyncedSections();
        if (sectionsData) {
          setSyncedSections({
            trending: sectionsData.trending?.songs || [],
            bollywood90s: sectionsData.bollywood90s?.songs || [],
            regional: sectionsData.regional?.songs || [],
            bhakti: sectionsData.bhakti?.songs || [],
            romantic: sectionsData.romantic?.songs || [],
          });

          // Merge into all available songs
          if (sectionsData.all_local) {
            setSongs((prev) => {
              const map = new Map();
              // First local songs
              sectionsData.all_local.forEach((s) => map.set(s.id, s));
              // Then database suggestions from each section
              (sectionsData.trending?.songs || []).forEach((s) => map.set(s.id, s));
              (sectionsData.bollywood90s?.songs || []).forEach((s) => map.set(s.id, s));
              (sectionsData.regional?.songs || []).forEach((s) => map.set(s.id, s));
              (sectionsData.bhakti?.songs || []).forEach((s) => map.set(s.id, s));
              (sectionsData.romantic?.songs || []).forEach((s) => map.set(s.id, s));
              // And any user uploaded files
              prev.filter((s) => s.localFile).forEach((s) => map.set(s.id, s));

              return Array.from(map.values());
            });
          }
        }

        // Fetch search suggestions
        const suggData = await getSuggestions();
        if (suggData) {
          setSuggestions(suggData);
        }
      }
    } catch (err) {
      console.warn("Database sync notice:", err);
    }
  }, []);

  useEffect(() => {
    syncWithDatabase();
    const interval = setInterval(syncWithDatabase, 30000);
    return () => clearInterval(interval);
  }, [syncWithDatabase]);

  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;
  const playNextSongRef = useRef(null);

  /* =====================================================
     AUDIO INITIALIZATION & EVENT LISTENERS
  ===================================================== */
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = 0.8;
    audio.playbackRate = 1;
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      const nextTime = audio.currentTime || 0;
      const progressBucket = Math.floor(nextTime * 4);
      if (progressBucket !== lastProgressBucketRef.current) {
        lastProgressBucketRef.current = progressBucket;
        setCurrentTime(nextTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const handleEnded = () => {
      if (repeatModeRef.current === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      playNextSongRef.current?.();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.src = "";
    };
  }, []);


  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  /* =====================================================
     TOAST NOTIFICATION
  ===================================================== */
  const showToast = (message) => {
    setToastMessage(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      setToastMessage("");
    }, 2400);
  };

  /* =====================================================
     NAVIGATION
  ===================================================== */
  const navigateToTab = (tab) => {
    const targetTab = tab === "online" ? "search" : tab;
    if (targetTab === currentTab) return;
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(targetTab);
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
    setCurrentTab(targetTab);
  };

  const handleBack = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setCurrentTab(historyStack[newIndex]);
  };

  const handleForward = () => {
    if (historyIndex >= historyStack.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setCurrentTab(historyStack[newIndex]);
  };

  /* =====================================================
     PLAYBACK LOGIC
  ===================================================== */
  const playSong = async (song) => {
    if (!song || !audioRef.current) return;
    const audio = audioRef.current;

    try {
      let songUrl;
      if (song.isOnline && song.jiosaavnId) {
        if (
          song.audio &&
          (song.audio.startsWith("http://") || song.audio.startsWith("https://"))
        ) {
          songUrl = song.audio;
        } else {
          showToast(`Loading: ${song.title}...`);
          const mediaUrl = await getMediaUrl(song.jiosaavnId);
          songUrl = mediaUrl || resolveAudioUrl(song.audio) || `/api/stream/${song.jiosaavnId}`;
        }
      } else {
        songUrl = resolveAudioUrl(song.audio);
      }

      if (audio.src !== songUrl) {
        audio.pause();
        audio.src = songUrl;
        audio.currentTime = 0;
      }

      setCurrentSong(song);
      setCurrentTime(0);
      await audio.play();
      setIsPlaying(true);

      // Save into history
      setPlayedHistory((prev) => {
        const updated = [song.id, ...prev.filter((id) => id !== song.id)].slice(0, 40);
        localStorage.setItem("sangeetify_history", JSON.stringify(updated));
        return updated;
      });

      // Clear lyrics when track changes
      setCurrentLyrics(null);
      showToast(`Playing: ${song.title}`);
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
      showToast("Unable to play track. Trying direct audio stream...");
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current || !currentSong) return;
    const audio = audioRef.current;

    try {
      if (audio.paused) {
        const songUrl = resolveAudioUrl(currentSong.audio);
        if (!audio.src || audio.src !== songUrl) {
          audio.src = songUrl;
        }
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Toggle play error:", err);
      showToast("Click Play to start audio.");
    }
  };

  // Next song
  const playNextSong = () => {
    const list = songs.length > 0 ? songs : LOCAL_SONGS;
    const currentIndex = list.findIndex((s) => s.id === currentSong?.id);
    let nextIndex;

    if (isShuffle) {
      do {
        nextIndex = Math.floor(Math.random() * list.length);
      } while (nextIndex === currentIndex && list.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % list.length;
    }

    playSong(list[nextIndex]);
  };
  playNextSongRef.current = playNextSong;


  // Previous song
  const playPreviousSong = () => {
    const list = songs.length > 0 ? songs : LOCAL_SONGS;
    if (audioRef.current && audioRef.current.currentTime > 5) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const currentIndex = list.findIndex((s) => s.id === currentSong?.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    playSong(list[prevIndex]);
  };

  // Seek relative (10 seconds rewind or forward)
  const seekRelative = (seconds) => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime || 0;
    const maxDur = duration || audioRef.current.duration || 1000;
    const target = Math.max(0, Math.min(maxDur, current + seconds));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
    showToast(seconds > 0 ? `+${seconds}s Forward` : `${seconds}s Rewind`);
  };

  // Seek scrub slider
  const handleSeek = (event) => {
    const value = Number(event.target.value);
    setCurrentTime(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  // Playback Speed Cycle
  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
    showToast(`Speed: ${nextSpeed}x`);
  };

  // Repeat toggle
  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "off") {
        showToast("Repeat All");
        return "all";
      }
      if (prev === "all") {
        showToast("Repeat One Track");
        return "one";
      }
      showToast("Repeat Disabled");
      return "off";
    });
  };

  // Volume & Mute
  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume || 0.8);
    }
  };

  // Like Song
  const toggleLike = (songId) => {
    setLikedSongIds((prev) => {
      const exists = prev.includes(songId);
      const updated = exists ? prev.filter((id) => id !== songId) : [...prev, songId];
      localStorage.setItem("sangeetify_liked", JSON.stringify(updated));
      showToast(exists ? "Removed from Liked Songs" : "Added to Liked Songs ❤️");
      return updated;
    });
  };

  // Direct MP3 Download
  const downloadCurrentSong = () => {
    if (!currentSong) return;
    const link = document.createElement("a");
    link.href = currentSong.audio;
    link.download = `${currentSong.title} - ${currentSong.artist}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading: ${currentSong.title}`);
  };

  // Fetch Lyrics
  const fetchLyrics = useCallback(async () => {
    if (!currentSong) return;
    const songId = currentSong.jiosaavnId;
    if (!songId) {
      showToast("Lyrics are available for JioSaavn online tracks.");
      return;
    }

    setIsLoadingLyrics(true);
    try {
      const data = await getLyrics(songId);
      if (data && data.lyrics) {
        setCurrentLyrics(data.lyrics);
        setShowLyricsModal(true);
      } else {
        showToast("Lyrics not available for this song.");
        setCurrentLyrics(null);
      }
    } catch (err) {
      console.error("Lyrics error:", err);
      showToast("Could not load lyrics.");
    } finally {
      setIsLoadingLyrics(false);
    }
  }, [currentSong]);

  // Smart search normalization & aliases
  const cleanSearchString = (str) =>
    (str || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const ALIAS_MAP = {
    to: ["toh"],
    toh: ["to"],
    dulhaniya: ["dulhania"],
    dulhania: ["dulhaniya"],
    hain: ["hai"],
    hai: ["hain"],
    ddlj: ["dilwale", "dulhania"],
    banale: ["bana", "le"],
    ganna: ["gaana"],
    gane: ["gaane"],
    remix: [""],
    song: [""],
    songs: [""],
  };

  const matchSongSearch = useCallback((song, query) => {
    if (!query || !query.trim()) return true;
    if (!song) return false;

    const cleanQ = cleanSearchString(query);
    if (!cleanQ) return true;

    const tokens = cleanQ.split(" ").filter(Boolean);
    if (tokens.length === 0) return true;

    const searchable = cleanSearchString(
      [
        song.title,
        song.artist,
        song.album,
        song.language,
        song.category,
        song.mood,
        song.year,
        song.filename,
      ].join(" ")
    );

    return tokens.every((token) => {
      if (!token) return true;
      if (searchable.includes(token)) return true;
      const aliases = ALIAS_MAP[token];
      if (aliases && aliases.some((a) => a && searchable.includes(a))) {
        return true;
      }
      return false;
    });
  }, []);

  // Unified Omni-Search: searches both library & online database
  const executeUnifiedSearch = useCallback(async (queryText) => {
    const q = (queryText !== undefined ? queryText : searchQuery).trim();
    if (!q) {
      setSearchOnlineResults([]);
      setIsSearchSearching(false);
      return;
    }

    setIsSearchSearching(true);
    try {
      const results = await searchSongs(q);
      setSearchOnlineResults((results || []).filter(Boolean));
    } catch (err) {
      console.error("Unified search error:", err);
    } finally {
      setIsSearchSearching(false);
    }
  }, [searchQuery]);

  const debouncedUnifiedSearch = useCallback(
    (queryText) => {
      if (searchOnlineTimerRef.current) clearTimeout(searchOnlineTimerRef.current);
      searchOnlineTimerRef.current = setTimeout(() => {
        executeUnifiedSearch(queryText);
      }, 350);
    },
    [executeUnifiedSearch]
  );

  // Online Search
  const handleOnlineSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setOnlineResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchSongs(query);
      setOnlineResults(results.filter(Boolean));
    } catch (err) {
      console.error("Search error:", err);
      showToast("Search failed. Check backend connection.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedOnlineSearch = useCallback(
    (query) => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        handleOnlineSearch(query);
      }, 450);
    },
    [handleOnlineSearch]
  );

  // Local File Upload
  const handleLocalFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const audioFiles = files.filter((f) => f.type.startsWith("audio/"));
    if (!audioFiles.length) {
      showToast("Please choose valid audio/MP3 files.");
      return;
    }

    const newLocalSongs = audioFiles.map((file, idx) => ({
      id: `local-${Date.now()}-${idx}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Local Audio",
      language: "Local",
      mood: "Your Track",
      category: "Local Songs",
      album: "Local Uploads",
      cover: DEFAULT_FALLBACK_COVER,
      audio: URL.createObjectURL(file),
      localFile: true,
      duration: 0,
      isLocal: true,
      isOnline: false,
    }));

    setSongs((prev) => [...prev, ...newLocalSongs]);
    showToast(`${newLocalSongs.length} local track(s) added!`);
    event.target.value = "";
  };

  // Reactive Selected Playlist derived from customPlaylists and selectedPlaylistId
  const selectedPlaylist = useMemo(() => {
    if (!selectedPlaylistId) return customPlaylists[0] || null;
    return (
      customPlaylists.find((p) => String(p.id) === String(selectedPlaylistId)) ||
      customPlaylists[0] ||
      null
    );
  }, [customPlaylists, selectedPlaylistId]);

  // Robust song lookup helper (matches by number id, string id, filename, jiosaavnId, or title)
  const findSong = useCallback(
    (id) => {
      if (id === undefined || id === null || !songs) return null;
      const strId = String(id).toLowerCase();
      return (
        songs.find(
          (s) =>
            String(s.id).toLowerCase() === strId ||
            (s.filename && s.filename.toLowerCase() === strId) ||
            (s.jiosaavnId && String(s.jiosaavnId).toLowerCase() === strId) ||
            (s.title && s.title.toLowerCase() === strId)
        ) || null
      );
    },
    [songs]
  );

  // Selected Playlist Songs - completely reactive and robust!
  const selectedPlaylistSongs = useMemo(() => {
    if (!selectedPlaylist || !selectedPlaylist.songIds) return [];
    return selectedPlaylist.songIds.map(findSong).filter(Boolean);
  }, [selectedPlaylist, findSong]);

  // Unique Cover Art Mappings for each section to guarantee no duplicate templates
  const trendingCovers = useMemo(
    () => computeGridCovers(syncedSections.trending),
    [syncedSections.trending]
  );
  const bollywoodCovers = useMemo(
    () => computeGridCovers(syncedSections.bollywood90s),
    [syncedSections.bollywood90s]
  );
  const regionalCovers = useMemo(
    () => computeGridCovers(syncedSections.regional),
    [syncedSections.regional]
  );
  const bhaktiCovers = useMemo(
    () => computeGridCovers(syncedSections.bhakti),
    [syncedSections.bhakti]
  );
  const romanticCovers = useMemo(
    () => computeGridCovers(syncedSections.romantic),
    [syncedSections.romantic]
  );
  const allSongsCovers = useMemo(
    () => computeGridCovers(songs),
    [songs]
  );
  const onlineCovers = useMemo(
    () => computeGridCovers(onlineResults),
    [onlineResults]
  );

  // Custom Playlist Functions
  const createCustomPlaylist = (name = null, songToAdd = null) => {
    const finalName = (
      name ||
      newPlaylistName ||
      `My Playlist #${customPlaylists.length + 1}`
    ).trim();
    if (!finalName) return;

    const newPlaylist = {
      id: Date.now(),
      name: finalName,
      songIds: songToAdd ? [songToAdd.id] : [],
    };
    const updated = [...customPlaylists, newPlaylist];
    setCustomPlaylists(updated);
    localStorage.setItem("sangeetify_custom_playlists", JSON.stringify(updated));
    setSelectedPlaylistId(newPlaylist.id);
    setNewPlaylistName("");
    setShowNewPlaylistModal(false);
    showToast(`Playlist "${newPlaylist.name}" created! ✨`);
    return newPlaylist;
  };

  const deletePlaylist = (playlistId) => {
    const updated = customPlaylists.filter(
      (p) => String(p.id) !== String(playlistId)
    );
    setCustomPlaylists(updated);
    localStorage.setItem("sangeetify_custom_playlists", JSON.stringify(updated));
    setSelectedPlaylistId(updated.length > 0 ? updated[0].id : null);
    navigateToTab("library");
    showToast("Playlist deleted.");
  };

  const addSongToPlaylist = (playlistId, songId) => {
    let targetPlaylistName = "";
    const updated = customPlaylists.map((p) => {
      if (String(p.id) !== String(playlistId)) return p;
      targetPlaylistName = p.name;
      const exists = p.songIds.some((id) => String(id) === String(songId));
      if (exists) return p;
      return { ...p, songIds: [...p.songIds, songId] };
    });
    setCustomPlaylists(updated);
    localStorage.setItem("sangeetify_custom_playlists", JSON.stringify(updated));
    showToast(`Added to "${targetPlaylistName}"! 🎵`);
  };

  const removeSongFromPlaylist = (playlistId, songId) => {
    let targetPlaylistName = "";
    const updated = customPlaylists.map((p) => {
      if (String(p.id) !== String(playlistId)) return p;
      targetPlaylistName = p.name;
      return {
        ...p,
        songIds: p.songIds.filter((id) => String(id) !== String(songId)),
      };
    });
    setCustomPlaylists(updated);
    localStorage.setItem("sangeetify_custom_playlists", JSON.stringify(updated));
    showToast(`Removed from "${targetPlaylistName}".`);
  };

  const toggleSongInPlaylist = (playlistId, songId) => {
    const playlist = customPlaylists.find((p) => String(p.id) === String(playlistId));
    if (!playlist) return;
    const isAdded = playlist.songIds.some((id) => String(id) === String(songId));
    if (isAdded) {
      removeSongFromPlaylist(playlistId, songId);
    } else {
      addSongToPlaylist(playlistId, songId);
    }
  };

  const playPlaylist = (pl) => {
    const plSongs = (pl?.songIds || []).map(findSong).filter(Boolean);
    if (plSongs.length === 0) {
      showToast("Playlist is empty! Add songs first.");
      return;
    }
    playSong(plSongs[0]);
    showToast(`Playing playlist "${pl.name}"`);
  };

  // Filter local search songs with smart multi-token matcher
  const filteredLocalSongs = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return songs;
    return songs.filter((s) => matchSongSearch(s, q));
  }, [songs, searchQuery, matchSongSearch]);

  const searchLocalCovers = useMemo(
    () => computeGridCovers(filteredLocalSongs),
    [filteredLocalSongs]
  );

  const searchOnlineCovers = useMemo(
    () => computeGridCovers(searchOnlineResults),
    [searchOnlineResults]
  );

  /* =====================================================
     SONG LIST ITEM COMPONENT
  ===================================================== */
  const SongListItem = ({
    song,
    index,
    showRemove = false,
    onRemove,
    onAddToPlaylist,
  }) => {
    const isCurrent = currentSong?.id === song.id;
    const isLiked = likedSongIds.includes(song.id);
    const coverSrc =
      song.cover ||
      generateUniqueCoverArt(
        song.title,
        song.artist,
        song.category || song.language
      );

    return (
      <div
        className={`song-list-item ${isCurrent ? "song-list-item-active" : ""}`}
        onClick={() => playSong(song)}
      >
        <div className="song-list-left">
          <span className="song-number">{index + 1}</span>
          <img
            src={coverSrc}
            alt={song.title}
            className="song-list-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = generateUniqueCoverArt(
                song.title,
                song.artist,
                song.category || song.language
              );
            }}
          />
          <div className="song-list-details">
            <div className="song-list-title">
              {song.title}
              {song.isOnline && <Globe size={11} className="inline-icon" />}
            </div>
            <div className="song-list-artist">
              {song.artist} • {song.language}
            </div>
          </div>
        </div>

        <div className="song-list-right">
          {showRemove ? (
            <button
              className="playlist-track-remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRemove && onRemove(song.id);
              }}
              title="Remove from Playlist"
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <button
              className="item-add-playlist-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist
                  ? onAddToPlaylist(song)
                  : setPlaylistModalSong(song);
              }}
              title="Add to Playlist (+)"
            >
              <Plus size={16} />
            </button>
          )}

          <button
            className={`list-like-btn ${isLiked ? "liked" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(song.id);
            }}
            title={isLiked ? "Unlike" : "Like"}
          >
            <Heart size={16} fill={isLiked ? "#1ed760" : "none"} />
          </button>
          <span className="song-duration">{formatTime(song.duration)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="sangeetify-app">
      {/* Hidden File Input for Local MP3s */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLocalFiles}
        multiple
        accept="audio/*"
        style={{ display: "none" }}
      />

      <div className="app-workspace">
        {/* =================================================
            SIDEBAR NAVIGATION
        ================================================= */}
        <aside className="sidebar">
          <div className="brand" onClick={() => navigateToTab("home")}>
            <div className="brand-icon">
              <Music size={22} />
            </div>
            <span>Sangeetify</span>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-button ${currentTab === "home" ? "active" : ""}`}
              onClick={() => navigateToTab("home")}
            >
              <Home size={20} />
              <span>Home</span>
            </button>

            <button
              className={`nav-button ${currentTab === "search" ? "active" : ""}`}
              onClick={() => navigateToTab("search")}
            >
              <Search size={20} />
              <span>Search</span>
            </button>

            <button
              className={`nav-button ${currentTab === "library" ? "active" : ""}`}
              onClick={() => navigateToTab("library")}
            >
              <Library size={20} />
              <span>Your Library</span>
            </button>

            <button
              className={`nav-button ${currentTab === "liked" ? "active" : ""}`}
              onClick={() => navigateToTab("liked")}
            >
              <Heart size={20} />
              <span>Liked Songs</span>
              <span className="nav-count">{likedSongIds.length}</span>
            </button>

            <button
              className={`nav-button ${currentTab === "history" ? "active" : ""}`}
              onClick={() => navigateToTab("history")}
            >
              <Clock size={20} />
              <span>History</span>
            </button>
          </nav>

          <div className="sidebar-divider" />

          {/* PLAYLISTS SECTION IN SIDEBAR */}
          <div className="playlist-sidebar-section">
            <div className="playlist-sidebar-header">
              <span>YOUR PLAYLISTS</span>
              <button
                className="icon-button"
                onClick={() => setShowNewPlaylistModal(true)}
                title="Create Playlist"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="playlist-sidebar-list">
              {customPlaylists.map((pl) => (
                <button
                  key={pl.id}
                  className={`sidebar-playlist-item ${
                    currentTab === "playlist-detail" &&
                    String(selectedPlaylistId) === String(pl.id)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedPlaylistId(pl.id);
                    navigateToTab("playlist-detail");
                  }}
                  title={pl.name}
                >
                  <div className="sidebar-playlist-left">
                    <ListMusic size={15} />
                    <span>{pl.name}</span>
                  </div>
                  <span className="sidebar-playlist-count">
                    {pl.songIds ? pl.songIds.length : 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* LOCAL FILE UPLOAD BUTTON */}
          <button
            className="local-music-button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={17} />
            <span>Add Local MP3</span>
          </button>
        </aside>

        {/* =================================================
            MAIN CONTENT AREA
        ================================================= */}
        <main className="main-content">
          {/* TOP BAR */}
          <header className="top-header">
            <div className="header-navigation-buttons">
              <button
                className="history-nav-btn"
                onClick={handleBack}
                disabled={historyIndex <= 0}
                title="Go Back"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="history-nav-btn"
                onClick={handleForward}
                disabled={historyIndex >= historyStack.length - 1}
                title="Go Forward"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="header-actions">
              <button
                className="new-playlist-button"
                onClick={() => setShowNewPlaylistModal(true)}
              >
                <Plus size={16} />
                <span>New Playlist</span>
              </button>
            </div>
          </header>

          <div className="content-area">
            {/* =================================================
                HOME TAB: SYNCED DATABASE SECTIONS
            ================================================= */}
            {currentTab === "home" && (
              <div className="page fade-in">
                {/* HERO BANNER */}
                <section className="hero">
                  <div className="hero-background-icon">
                    <Music size={230} />
                  </div>
                  <div className="hero-content">
                    <span className="hero-tag">
                      🎵 SANGEETIFY — UNLIMITED MUSIC STREAMING & RETRO GOLD
                    </span>
                    <h1>
                      Timeless Melodies.
                      <span> Zero Ads.</span>
                    </h1>
                    <p>
                      Stream legendary 90s Bollywood gold, devotional music,
                      regional beats, and{" "}
                      <strong>millions of high-quality songs on Sangeetify</strong>.
                    </p>
                    <div className="hero-buttons">
                      <button
                        className="primary-button"
                        onClick={() => playSong(initialSong)}
                      >
                        <Play size={18} fill="black" />
                        Listen 90s Gold
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => navigateToTab("search")}
                      >
                        <Search size={16} />
                        Explore & Search
                      </button>
                    </div>
                  </div>
                </section>

                {/* CATEGORY FILTER PILLS */}
                <div className="section-filter-bar">
                  {[
                    { id: "all", label: "✨ All Music" },
                    { id: "trending", label: "🔥 Trending Now" },
                    { id: "bollywood90s", label: "📼 90s Bollywood Gold" },
                    { id: "regional", label: "🌐 Multi-Language & Regional" },
                    { id: "bhakti", label: "🙏 Devotional & Bhakti" },
                    { id: "romantic", label: "💖 Romantic Melodies" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      className={`section-pill ${activeFilter === filter.id ? "section-pill-active" : ""}`}
                      onClick={() => setActiveFilter(filter.id)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* 1. SECTION: TRENDING NOW */}
                {(activeFilter === "all" || activeFilter === "trending") && (
                  <section className="music-section">
                    <div className="section-heading">
                      <h2>🔥 Trending Now</h2>
                      <button
                        onClick={() => {
                          setSearchQuery("Trending");
                          navigateToTab("search");
                        }}
                      >
                        View All ({syncedSections.trending.length})
                      </button>
                    </div>
                    <div className="song-grid">
                      {syncedSections.trending.map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          liked={likedSongIds.includes(song.id)}
                          onPlay={playSong}
                          onToggleLike={toggleLike}
                          onAddToPlaylist={(s) => setPlaylistModalSong(s)}
                          customCover={trendingCovers.get(song.id)}
                          isCurrentSong={currentSong?.id === song.id}
                          isPlaying={isPlaying}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 2. SECTION: 90s BOLLYWOOD GOLD */}
                {(activeFilter === "all" || activeFilter === "bollywood90s") && (
                  <section className="music-section">
                    <div className="section-heading">
                      <h2>📼 90s Bollywood Gold</h2>
                      <button
                        onClick={() => {
                          setSearchQuery("90s");
                          navigateToTab("search");
                        }}
                      >
                        View All ({syncedSections.bollywood90s.length})
                      </button>
                    </div>
                    <div className="song-grid">
                      {syncedSections.bollywood90s.map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          liked={likedSongIds.includes(song.id)}
                          onPlay={playSong}
                          onToggleLike={toggleLike}
                          onAddToPlaylist={(s) => setPlaylistModalSong(s)}
                          customCover={bollywoodCovers.get(song.id)}
                          isCurrentSong={currentSong?.id === song.id}
                          isPlaying={isPlaying}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. SECTION: MULTI-LANGUAGE & REGIONAL */}
                {(activeFilter === "all" || activeFilter === "regional") && (
                  <section className="music-section">
                    <div className="section-heading">
                      <h2>🌐 Multi-Language & Regional Beats</h2>
                      <button
                        onClick={() => {
                          setSearchQuery("Regional");
                          navigateToTab("search");
                        }}
                      >
                        View All ({syncedSections.regional.length})
                      </button>
                    </div>
                    <div className="song-grid">
                      {syncedSections.regional.map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          liked={likedSongIds.includes(song.id)}
                          onPlay={playSong}
                          onToggleLike={toggleLike}
                          onAddToPlaylist={(s) => setPlaylistModalSong(s)}
                          customCover={regionalCovers.get(song.id)}
                          isCurrentSong={currentSong?.id === song.id}
                          isPlaying={isPlaying}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. SECTION: BHAKTI & DEVOTIONAL */}
                {(activeFilter === "all" || activeFilter === "bhakti") && (
                  <section className="music-section">
                    <div className="section-heading">
                      <h2>🙏 Devotional & Spiritual Bhakti</h2>
                      <button
                        onClick={() => {
                          setSearchQuery("Bhakti");
                          navigateToTab("search");
                        }}
                      >
                        View All ({syncedSections.bhakti.length})
                      </button>
                    </div>
                    <div className="song-grid">
                      {syncedSections.bhakti.map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          liked={likedSongIds.includes(song.id)}
                          onPlay={playSong}
                          onToggleLike={toggleLike}
                          onAddToPlaylist={(s) => setPlaylistModalSong(s)}
                          customCover={bhaktiCovers.get(song.id)}
                          isCurrentSong={currentSong?.id === song.id}
                          isPlaying={isPlaying}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 5. SECTION: ROMANTIC MELODIES */}
                {(activeFilter === "all" || activeFilter === "romantic") && (
                  <section className="music-section">
                    <div className="section-heading">
                      <h2>💖 Romantic & Soulful Melodies</h2>
                      <button
                        onClick={() => {
                          setSearchQuery("Romantic");
                          navigateToTab("search");
                        }}
                      >
                        View All ({syncedSections.romantic.length})
                      </button>
                    </div>
                    <div className="song-grid">
                      {syncedSections.romantic.map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          liked={likedSongIds.includes(song.id)}
                          onPlay={playSong}
                          onToggleLike={toggleLike}
                          onAddToPlaylist={(s) => setPlaylistModalSong(s)}
                          customCover={romanticCovers.get(song.id)}
                          isCurrentSong={currentSong?.id === song.id}
                          isPlaying={isPlaying}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* ALL FEATURED TRACKS */}
                {activeFilter === "all" && (
                  <section className="music-section">
                    <div className="section-heading">
                      <h2>All Synced Tracks</h2>
                      <span className="track-count">{songs.length} Songs Loaded</span>
                    </div>
                    <div className="song-grid">
                      {songs.map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          liked={likedSongIds.includes(song.id)}
                          onPlay={playSong}
                          onToggleLike={toggleLike}
                          onAddToPlaylist={(s) => setPlaylistModalSong(s)}
                          customCover={allSongsCovers.get(song.id)}
                          isCurrentSong={currentSong?.id === song.id}
                          isPlaying={isPlaying}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* =================================================
                SEARCH TAB: UNIFIED OMNI-SEARCH (LOCAL + JIOSAAVN)
            ================================================= */}
            {currentTab === "search" && (
              <div className="page fade-in">
                {/* Search Form with Dedicated Search Button */}
                <form
                  className="search-form-wrapper"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchOnlineTimerRef.current) clearTimeout(searchOnlineTimerRef.current);
                    executeUnifiedSearch(searchQuery);
                  }}
                >
                  <div className="search-box-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        debouncedUnifiedSearch(val);
                      }}
                      placeholder="Search all songs — title, artist, album, mood, 90s hits..."
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="search-clear-btn"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchOnlineResults([]);
                        }}
                        title="Clear Search"
                      >
                        <X size={18} />
                      </button>
                    )}
                    {isSearchSearching && <Loader size={18} className="spin-animation" />}
                  </div>

                  <button
                    type="submit"
                    className="search-submit-btn"
                    title="Click to Search Songs"
                  >
                    <Search size={16} />
                    <span>Search</span>
                  </button>
                </form>

                {/* Scope Filter Tabs */}
                {searchQuery.trim() && (
                  <div className="search-scope-tabs">
                    <button
                      type="button"
                      className={`search-scope-pill ${searchScope === "all" ? "active" : ""}`}
                      onClick={() => setSearchScope("all")}
                    >
                      All Results{" "}
                      <span className="search-count-badge">
                        {filteredLocalSongs.length + searchOnlineResults.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`search-scope-pill ${searchScope === "library" ? "active" : ""}`}
                      onClick={() => setSearchScope("library")}
                    >
                      Library & Local{" "}
                      <span className="search-count-badge">{filteredLocalSongs.length}</span>
                    </button>
                    <button
                      type="button"
                      className={`search-scope-pill ${searchScope === "online" ? "active" : ""}`}
                      onClick={() => setSearchScope("online")}
                    >
                      <Sparkles size={13} /> Sangeetify Results{" "}
                      <span className="search-count-badge">{searchOnlineResults.length}</span>
                    </button>
                  </div>
                )}

                {/* Live Searching Indicator */}
                {isSearchSearching && (
                  <div className="search-live-status">
                    <Loader size={15} className="spin-animation" />
                    <span>Searching Sangeetify for "{searchQuery}"...</span>
                  </div>
                )}

                {/* DATABASE SUGGESTIONS PILLS */}
                <div className="online-suggestions" style={{ marginTop: 14 }}>
                  <div className="suggestion-chips">
                    {suggestions.popular_queries.map((q) => (
                      <button
                        key={q}
                        type="button"
                        className="suggestion-chip"
                        onClick={() => {
                          setSearchQuery(q);
                          if (searchOnlineTimerRef.current) clearTimeout(searchOnlineTimerRef.current);
                          executeUnifiedSearch(q);
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. LOCAL & SYNCED SONGS SECTION */}
                {(searchScope === "all" || searchScope === "library") &&
                  filteredLocalSongs.length > 0 && (
                    <section className="music-section">
                      <div className="section-heading">
                        <h2>🎵 Library & Synced Songs ({filteredLocalSongs.length})</h2>
                      </div>
                      <div className="song-grid">
                        {filteredLocalSongs.map((song) => (
                          <SongCard
                            key={song.id}
                            song={song}
                            liked={likedSongIds.includes(song.id)}
                            onPlay={playSong}
                            onToggleLike={toggleLike}
                            onAddToPlaylist={(s) => setPlaylistModalSong(s)}
                            customCover={searchLocalCovers.get(song.id)}
                            isCurrentSong={currentSong?.id === song.id}
                            isPlaying={isPlaying}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                {/* 2. SANGEETIFY RESULTS SECTION */}
                {(searchScope === "all" || searchScope === "online") &&
                  searchOnlineResults.length > 0 && (
                    <section className="music-section">
                      <div className="section-heading">
                        <h2>
                          <Sparkles size={18} className="inline-icon" /> Sangeetify Results ({searchOnlineResults.length})
                        </h2>
                      </div>
                      <div className="song-grid">
                        {searchOnlineResults.map((song) => (
                          <SongCard
                            key={song.id}
                            song={song}
                            liked={likedSongIds.includes(song.id)}
                            onPlay={playSong}
                            onToggleLike={toggleLike}
                            onAddToPlaylist={(s) => setPlaylistModalSong(s)}
                            customCover={searchOnlineCovers.get(song.id)}
                            isCurrentSong={currentSong?.id === song.id}
                            isPlaying={isPlaying}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                {/* EMPTY STATE */}
                {searchQuery.trim() &&
                  !isSearchSearching &&
                  filteredLocalSongs.length === 0 &&
                  searchOnlineResults.length === 0 && (
                    <div className="empty-state">
                      <Search size={44} />
                      <h3>No songs found for "{searchQuery}"</h3>
                      <p>Try searching by song title, singer name, or click one of the suggestion tags above.</p>
                      <button
                        className="primary-small-button"
                        style={{ marginTop: 14 }}
                        onClick={() => executeUnifiedSearch(searchQuery)}
                      >
                        <Search size={15} /> Search Sangeetify Results
                      </button>
                    </div>
                  )}
              </div>
            )}

            {/* =================================================
                LIBRARY TAB
            ================================================= */}
            {currentTab === "library" && (
              <div className="page fade-in">
                <div className="page-title-row">
                  <div>
                    <h1>Your Library & Playlists</h1>
                    <p>Manage liked tracks and customized playlists.</p>
                  </div>
                  <button
                    className="primary-small-button"
                    onClick={() => setShowNewPlaylistModal(true)}
                  >
                    <Plus size={17} /> Create Playlist
                  </button>
                </div>

                <div className="library-grid">
                  <div
                    className="library-card liked-card"
                    onClick={() => navigateToTab("liked")}
                  >
                    <div className="library-card-top">
                      <Heart size={34} fill="currentColor" />
                      <span>{likedSongIds.length} Songs</span>
                    </div>
                    <div>
                      <h3>Liked Songs</h3>
                      <p>Your saved tracks</p>
                    </div>
                  </div>

                  {customPlaylists.map((pl) => (
                    <div
                      key={pl.id}
                      className="library-card playlist-card"
                      onClick={() => {
                        setSelectedPlaylistId(pl.id);
                        navigateToTab("playlist-detail");
                      }}
                    >
                      <div className="library-card-top">
                        <ListMusic size={34} />
                        <span>{pl.songIds ? pl.songIds.length : 0} Songs</span>
                      </div>
                      <div>
                        <h3>{pl.name}</h3>
                        <p>Custom Playlist</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================
                LIKED SONGS TAB
            ================================================= */}
            {currentTab === "liked" && (
              <div className="page fade-in">
                <div className="page-title-row">
                  <div>
                    <h1>❤️ Liked Songs</h1>
                    <p>{likedSongIds.length} favorited tracks</p>
                  </div>
                </div>

                {likedSongIds.length === 0 ? (
                  <div className="empty-state">
                    <Heart size={42} />
                    <h3>No liked songs yet</h3>
                    <p>Click the heart icon on any card to save it here!</p>
                  </div>
                ) : (
                  <div className="song-list">
                    {likedSongIds
                      .map(findSong)
                      .filter(Boolean)
                      .map((song, idx) => (
                        <SongListItem
                          key={song.id}
                          song={song}
                          index={idx}
                          onAddToPlaylist={setPlaylistModalSong}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                HISTORY TAB
            ================================================= */}
            {currentTab === "history" && (
              <div className="page fade-in">
                <div className="page-title-row">
                  <div>
                    <h1>🕒 Listening History</h1>
                    <p>Recently played tracks</p>
                  </div>
                  <button
                    className="danger-text-button"
                    onClick={() => {
                      setPlayedHistory([]);
                      localStorage.removeItem("sangeetify_history");
                      showToast("History cleared.");
                    }}
                  >
                    Clear History
                  </button>
                </div>

                {playedHistory.length === 0 ? (
                  <div className="empty-state">
                    <Clock size={42} />
                    <h3>No history yet</h3>
                    <p>Play some music to see history here!</p>
                  </div>
                ) : (
                  <div className="song-list">
                    {playedHistory
                      .map(findSong)
                      .filter(Boolean)
                      .map((song, idx) => (
                        <SongListItem
                          key={`${song.id}-${idx}`}
                          song={song}
                          index={idx}
                          onAddToPlaylist={setPlaylistModalSong}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                PLAYLIST DETAIL TAB
            ================================================= */}
            {currentTab === "playlist-detail" && selectedPlaylist && (
              <div className="page fade-in">
                {/* Modern Playlist Hero Banner */}
                <div className="playlist-hero-banner">
                  <img
                    src={
                      selectedPlaylistSongs[0]?.cover ||
                      generateUniqueCoverArt(
                        selectedPlaylist.name,
                        "Playlist",
                        "Custom"
                      )
                    }
                    alt={selectedPlaylist.name}
                    className="playlist-hero-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = generateUniqueCoverArt(
                        selectedPlaylist.name,
                        "Playlist",
                        "Custom"
                      );
                    }}
                  />
                  <div className="playlist-hero-info">
                    <span className="playlist-hero-tag">CUSTOM PLAYLIST</span>
                    <h1 className="playlist-hero-title">{selectedPlaylist.name}</h1>
                    <div className="playlist-hero-stats">
                      <span>{selectedPlaylistSongs.length} tracks</span>
                      <span> • </span>
                      <span>
                        {formatTime(
                          selectedPlaylistSongs.reduce(
                            (acc, s) => acc + (s.duration || 0),
                            0
                          )
                        )} total
                      </span>
                    </div>

                    <div className="playlist-hero-actions">
                      <button
                        className="playlist-play-all-btn"
                        onClick={() => playPlaylist(selectedPlaylist)}
                        disabled={selectedPlaylistSongs.length === 0}
                      >
                        <Play size={18} fill="currentColor" /> Play All
                      </button>

                      <button
                        className="playlist-delete-btn"
                        onClick={() => deletePlaylist(selectedPlaylist.id)}
                        title="Delete Playlist"
                      >
                        <Trash2 size={16} /> Delete Playlist
                      </button>
                    </div>
                  </div>
                </div>

                {/* Playlist Tracks List */}
                {selectedPlaylistSongs.length === 0 ? (
                  <div className="empty-state">
                    <ListMusic size={42} />
                    <h3>Playlist is empty</h3>
                    <p>Search or add tracks below to build your playlist!</p>
                  </div>
                ) : (
                  <div className="song-list">
                    {selectedPlaylistSongs.map((song, idx) => (
                      <SongListItem
                        key={song.id}
                        song={song}
                        index={idx}
                        showRemove={true}
                        onRemove={(songId) =>
                          removeSongFromPlaylist(selectedPlaylist.id, songId)
                        }
                        onAddToPlaylist={setPlaylistModalSong}
                      />
                    ))}
                  </div>
                )}

                {/* Add Songs to this Playlist Section */}
                <div className="playlist-add-section">
                  <div className="section-heading">
                    <h3>Add songs to this playlist</h3>
                    <span className="track-count">{songs.length} available songs</span>
                  </div>

                  <div className="search-bar playlist-search-box">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Search songs to add to this playlist..."
                      value={playlistSearchQuery}
                      onChange={(e) => setPlaylistSearchQuery(e.target.value)}
                    />
                    {playlistSearchQuery && (
                      <button
                        className="search-clear-btn"
                        onClick={() => setPlaylistSearchQuery("")}
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <div className="mini-song-grid">
                    {songs
                      .filter((song) => matchSongSearch(song, playlistSearchQuery))
                      .slice(0, 48)
                      .map((song) => {
                        const added = (selectedPlaylist.songIds || []).some(
                          (id) => String(id) === String(song.id)
                        );
                        return (
                          <button
                            key={song.id}
                            className={`mini-song ${added ? "already-added" : ""}`}
                            onClick={() =>
                              toggleSongInPlaylist(selectedPlaylist.id, song.id)
                            }
                            title={added ? "Click to Remove" : "Click to Add"}
                          >
                            <img
                              src={
                                song.cover ||
                                generateUniqueCoverArt(
                                  song.title,
                                  song.artist,
                                  song.category || song.language
                                )
                              }
                              alt={song.title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = generateUniqueCoverArt(
                                  song.title,
                                  song.artist,
                                  song.category || song.language
                                );
                              }}
                            />
                            <span>{song.title}</span>
                            {added ? (
                              <Check size={14} color="#1ed760" />
                            ) : (
                              <Plus size={14} />
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* =================================================
          BOTTOM MUSIC PLAYER INTERFACE
      ================================================= */}
      <footer className="music-player">
        {/* LEFT: CURRENT TRACK & VINYL PEEK */}
        <div className="player-song">
          <div
            className="player-song-click-area"
            onClick={() => setIsExpandedPlayerOpen(true)}
            title="Click to Open Full Studio Player"
          >
            <div className="player-vinyl-wrapper">
              <div
                className={`player-vinyl-disc ${isPlaying ? "spinning" : ""}`}
              >
                <div className="player-vinyl-groove" />
              </div>
              <img
                src={currentSong?.cover || DEFAULT_FALLBACK_COVER}
                alt={currentSong?.title}
                className="player-song-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_FALLBACK_COVER;
                }}
              />
            </div>

            <div className="player-song-info">
              <div className="player-song-title-row">
                <span className="player-song-title">{currentSong?.title}</span>
                <span className="quality-badge">
                  {currentSong?.isLocal ? "MP3 320k" : "HD Audio"}
                </span>
              </div>
              <span className="player-song-artist">
                {currentSong?.artist} • {currentSong?.album || "Sangeetify"}
              </span>
            </div>
          </div>

          <div className="player-actions-left">
            <button
              className={`player-like ${likedSongIds.includes(currentSong?.id) ? "liked-icon" : ""}`}
              onClick={() => toggleLike(currentSong?.id)}
              title={likedSongIds.includes(currentSong?.id) ? "Liked" : "Like Song"}
            >
              <Heart
                size={18}
                fill={likedSongIds.includes(currentSong?.id) ? "currentColor" : "none"}
              />
            </button>

            <button
              className="player-expand-btn"
              onClick={() => setIsExpandedPlayerOpen(true)}
              title="Expand Studio Player"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* CENTER: PLAYBACK CONTROLS & SEEK BAR */}
        <div className="player-controls">
          <div className="control-buttons">
            <button
              className={isShuffle ? "control-active" : ""}
              onClick={() => {
                setIsShuffle((p) => !p);
                showToast(!isShuffle ? "Shuffle On" : "Shuffle Off");
              }}
              title="Shuffle"
            >
              <Shuffle size={17} />
            </button>

            <button onClick={playPreviousSong} title="Previous Song">
              <SkipBack size={19} fill="currentColor" />
            </button>

            {/* 10s Rewind */}
            <button
              className="player-skip-btn"
              onClick={() => seekRelative(-10)}
              title="Rewind 10 Seconds"
            >
              <RotateCcw size={16} />
            </button>

            {/* Main Play/Pause Button */}
            <button
              className="main-play-button"
              onClick={togglePlayPause}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={20} fill="black" color="black" />
              ) : (
                <Play size={20} fill="black" color="black" style={{ marginLeft: 2 }} />
              )}
            </button>

            {/* 10s Forward */}
            <button
              className="player-skip-btn"
              onClick={() => seekRelative(10)}
              title="Forward 10 Seconds"
            >
              <RotateCw size={16} />
            </button>

            <button onClick={playNextSong} title="Next Song">
              <SkipForward size={19} fill="currentColor" />
            </button>

            <button
              className={repeatMode !== "off" ? "control-active" : ""}
              onClick={toggleRepeat}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat size={17} />
              {repeatMode === "one" && <span className="tool-badge">1</span>}
            </button>

            {/* Speed Selector */}
            <button
              className="player-speed-btn"
              onClick={cycleSpeed}
              title="Playback Speed"
            >
              {playbackSpeed}x
            </button>
          </div>

          {/* Seek Progress Bar */}
          <div className="progress-row">
            <span>{formatTime(currentTime)}</span>
            <input
              className="progress-slider"
              type="range"
              min="0"
              max={duration || 0}
              value={Math.min(currentTime, duration || 0)}
              onChange={handleSeek}
              style={{
                background: `linear-gradient(
                  to right,
                  #1ed760 0%,
                  #1ed760 ${duration > 0 ? (currentTime / duration) * 100 : 0}%,
                  #333 ${duration > 0 ? (currentTime / duration) * 100 : 0}%,
                  #333 100%
                )`,
              }}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* RIGHT: VOLUME, LYRICS, QUEUE & DOWNLOAD */}
        <div className="player-volume">
          {/* Lyrics Button */}
          {currentSong?.hasLyrics && (
            <button
              className={`player-tool-btn ${showLyricsModal ? "active" : ""}`}
              onClick={fetchLyrics}
              title="View Lyrics"
            >
              {isLoadingLyrics ? (
                <Loader size={16} className="spin-animation" />
              ) : (
                <BookOpen size={16} />
              )}
            </button>
          )}

          {/* Queue Drawer Toggle */}
          <button
            className={`player-tool-btn ${isQueueOpen ? "active" : ""}`}
            onClick={() => setIsQueueOpen((p) => !p)}
            title="Queue / Up Next"
          >
            <ListOrdered size={16} />
            <span className="tool-badge">{songs.length}</span>
          </button>

          {/* Download MP3 */}
          <button
            className="player-tool-btn"
            onClick={downloadCurrentSong}
            title="Download MP3"
          >
            <Download size={16} />
          </button>

          {/* Volume Mute/Slider */}
          <button
            className="player-tool-btn player-mute-btn"
            onClick={toggleMute}
            title={volume === 0 ? "Unmute" : "Mute"}
          >
            {volume === 0 ? (
              <VolumeX size={18} />
            ) : volume < 0.5 ? (
              <Volume1 size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <input
            className="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{
              background: `linear-gradient(
                to right,
                #1ed760 0%,
                #1ed760 ${volume * 100}%,
                #333 ${volume * 100}%,
                #333 100%
              )`,
            }}
          />
          <span style={{ minWidth: 26, fontSize: 10 }}>{Math.round(volume * 100)}%</span>
        </div>
      </footer>

      {/* =================================================
          EXPANDED STUDIO PLAYER (FULL-SCREEN MODAL)
      ================================================= */}
      {isExpandedPlayerOpen && (
        <div className="expanded-player-overlay">
          <div className="expanded-ambient-glow" />

          {/* Header */}
          <div className="expanded-player-header">
            <button
              className="expanded-collapse-btn"
              onClick={() => setIsExpandedPlayerOpen(false)}
            >
              <ChevronDown size={18} />
              <span>Minimize</span>
            </button>

            <div className="expanded-header-title">
              <span>NOW PLAYING</span>
              <h4>{currentSong?.album || "Sangeetify Audio Studio"}</h4>
            </div>

            <div className="expanded-tabs">
              <button
                className={`expanded-tab-btn ${expandedTab === "player" ? "tab-active" : ""}`}
                onClick={() => setExpandedTab("player")}
              >
                Studio
              </button>
              <button
                className={`expanded-tab-btn ${expandedTab === "lyrics" ? "tab-active" : ""}`}
                onClick={() => {
                  setExpandedTab("lyrics");
                  if (!currentLyrics) fetchLyrics();
                }}
              >
                Lyrics
              </button>
              <button
                className={`expanded-tab-btn ${expandedTab === "queue" ? "tab-active" : ""}`}
                onClick={() => setExpandedTab("queue")}
              >
                Queue ({songs.length})
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="expanded-body">
            {/* 1. STUDIO VIEW */}
            {expandedTab === "player" && (
              <div className="studio-container">
                {/* Rotating Vinyl Record Visualizer */}
                <div className="studio-vinyl-box">
                  <div
                    className={`studio-vinyl-disc ${isPlaying ? "spinning" : ""}`}
                  >
                    <div className="studio-vinyl-rings" />
                    <div className="studio-vinyl-rings-2" />
                    <img
                      src={currentSong?.cover || DEFAULT_FALLBACK_COVER}
                      alt={currentSong?.title}
                      className="studio-vinyl-center-art"
                    />
                    <div className="studio-vinyl-hole" />
                  </div>
                </div>

                {/* Animated Audio Equalizer Spectrum */}
                <div className="audio-spectrum-visualizer">
                  {[...Array(16)].map((_, i) => (
                    <span
                      key={i}
                      className="spectrum-bar"
                      style={{
                        animationDelay: `${(i * 0.08).toFixed(2)}s`,
                        animationDuration: isPlaying ? `${0.8 + (i % 4) * 0.2}s` : "0s",
                        height: isPlaying ? undefined : "4px",
                      }}
                    />
                  ))}
                </div>

                {/* Metadata */}
                <div className="studio-meta">
                  <div className="studio-title-row">
                    <h2 className="studio-title">{currentSong?.title}</h2>
                    <span className="quality-badge">
                      {currentSong?.isLocal ? "Lossless FLAC/MP3" : "JioSaavn HD 320k"}
                    </span>
                  </div>
                  <p className="studio-artist">{currentSong?.artist}</p>
                  <div className="studio-album-info">
                    <span>{currentSong?.album || "Single"}</span>
                    <span>•</span>
                    <span>{currentSong?.year || "2026"}</span>
                    <span>•</span>
                    <span>{currentSong?.language}</span>
                    <span>•</span>
                    <span>{currentSong?.mood || currentSong?.category}</span>
                  </div>
                </div>

                {/* Scrubber */}
                <div className="studio-scrubber">
                  <div className="progress-row">
                    <span>{formatTime(currentTime)}</span>
                    <input
                      className="progress-slider"
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={Math.min(currentTime, duration || 0)}
                      onChange={handleSeek}
                      style={{
                        background: `linear-gradient(
                          to right,
                          #1ed760 0%,
                          #1ed760 ${duration > 0 ? (currentTime / duration) * 100 : 0}%,
                          #333 ${duration > 0 ? (currentTime / duration) * 100 : 0}%,
                          #333 100%
                        )`,
                      }}
                    />
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="studio-controls">
                  <button
                    className={isShuffle ? "control-active" : ""}
                    onClick={() => setIsShuffle((p) => !p)}
                    title="Shuffle"
                  >
                    <Shuffle size={20} />
                  </button>

                  <button onClick={playPreviousSong} title="Previous">
                    <SkipBack size={24} fill="currentColor" />
                  </button>

                  <button
                    onClick={() => seekRelative(-10)}
                    title="Rewind 10 Seconds"
                  >
                    <RotateCcw size={20} />
                  </button>

                  <button
                    className="studio-play-btn"
                    onClick={togglePlayPause}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause size={28} fill="black" color="black" />
                    ) : (
                      <Play size={28} fill="black" color="black" style={{ marginLeft: 3 }} />
                    )}
                  </button>

                  <button
                    onClick={() => seekRelative(10)}
                    title="Forward 10 Seconds"
                  >
                    <RotateCw size={20} />
                  </button>

                  <button onClick={playNextSong} title="Next">
                    <SkipForward size={24} fill="currentColor" />
                  </button>

                  <button
                    className={repeatMode !== "off" ? "control-active" : ""}
                    onClick={toggleRepeat}
                    title={`Repeat: ${repeatMode}`}
                  >
                    <Repeat size={20} />
                  </button>
                </div>

                {/* Sub-actions */}
                <div className="studio-sub-actions">
                  <button
                    className={`player-like ${likedSongIds.includes(currentSong?.id) ? "liked-icon" : ""}`}
                    onClick={() => toggleLike(currentSong?.id)}
                  >
                    <Heart
                      size={22}
                      fill={likedSongIds.includes(currentSong?.id) ? "currentColor" : "none"}
                    />
                  </button>

                  <button className="player-speed-btn" onClick={cycleSpeed}>
                    Speed: {playbackSpeed}x
                  </button>

                  <button
                    className="player-tool-btn"
                    onClick={downloadCurrentSong}
                    title="Download Track"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* 2. LYRICS VIEW */}
            {expandedTab === "lyrics" && (
              <div className="expanded-lyrics-container">
                {isLoadingLyrics ? (
                  <div className="empty-state">
                    <Loader size={40} className="spin-animation" />
                    <h3>Fetching lyrics from JioSaavn...</h3>
                  </div>
                ) : currentLyrics ? (
                  <div
                    className="expanded-lyrics-text"
                    dangerouslySetInnerHTML={{ __html: currentLyrics }}
                  />
                ) : (
                  <div className="empty-state">
                    <BookOpen size={40} />
                    <h3>Lyrics Unavailable</h3>
                    <p>No lyrics found in the JioSaavn database for this track.</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. QUEUE VIEW */}
            {expandedTab === "queue" && (
              <div className="expanded-queue-container">
                {songs.map((song, i) => (
                  <div
                    key={song.id}
                    className={`queue-card-item ${currentSong?.id === song.id ? "queue-card-active" : ""}`}
                    onClick={() => playSong(song)}
                  >
                    <img
                      src={song.cover || DEFAULT_FALLBACK_COVER}
                      alt={song.title}
                      className="queue-card-cover"
                    />
                    <div className="queue-card-info">
                      <div className="queue-card-title">{song.title}</div>
                      <div className="queue-card-artist">
                        {song.artist} • {song.language}
                      </div>
                    </div>
                    {currentSong?.id === song.id && (
                      <span className="card-badge" style={{ position: "static" }}>
                        Now Playing
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================
          QUICK QUEUE DRAWER
      ================================================= */}
      <aside className={`queue-drawer ${isQueueOpen ? "queue-drawer-open" : ""}`}>
        <div className="queue-drawer-header">
          <h3>
            <ListOrdered size={18} /> Playing Next ({songs.length})
          </h3>
          <button
            className="icon-button"
            onClick={() => setIsQueueOpen(false)}
            title="Close Queue"
          >
            <X size={18} />
          </button>
        </div>

        <div className="queue-drawer-body">
          {songs.map((song, idx) => (
            <div
              key={song.id}
              className={`queue-card-item ${currentSong?.id === song.id ? "queue-card-active" : ""}`}
              onClick={() => playSong(song)}
            >
              <img
                src={song.cover || DEFAULT_FALLBACK_COVER}
                alt={song.title}
                className="queue-card-cover"
              />
              <div className="queue-card-info">
                <div className="queue-card-title">{song.title}</div>
                <div className="queue-card-artist">{song.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* =================================================
          CREATE PLAYLIST MODAL
      ================================================= */}
      {showNewPlaylistModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowNewPlaylistModal(false)}
        >
          <div
            className="playlist-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Create Custom Playlist</h3>
                <p>Create a personal playlist for your favorite tracks.</p>
              </div>
              <button onClick={() => setShowNewPlaylistModal(false)}>
                <X size={19} />
              </button>
            </div>

            <input
              autoFocus
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createCustomPlaylist();
              }}
              placeholder="e.g. 90s Hits, Late Night Vibes..."
            />

            <div className="modal-buttons">
              <button
                className="modal-cancel"
                onClick={() => setShowNewPlaylistModal(false)}
              >
                Cancel
              </button>
              <button className="modal-create" onClick={createCustomPlaylist}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          ADD TO PLAYLIST MODAL (Triggered by any '+' button)
      ================================================= */}
      {playlistModalSong && (
        <div
          className="modal-overlay"
          onClick={() => setPlaylistModalSong(null)}
        >
          <div
            className="add-playlist-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Add to Playlist</h3>
                <p>Choose playlists for this song</p>
              </div>
              <button onClick={() => setPlaylistModalSong(null)}>
                <X size={19} />
              </button>
            </div>

            {/* Target Song Info */}
            <div className="add-playlist-target-song">
              <img
                src={
                  playlistModalSong.cover ||
                  generateUniqueCoverArt(
                    playlistModalSong.title,
                    playlistModalSong.artist,
                    playlistModalSong.category || playlistModalSong.language
                  )
                }
                alt={playlistModalSong.title}
                className="add-playlist-target-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = generateUniqueCoverArt(
                    playlistModalSong.title,
                    playlistModalSong.artist,
                    playlistModalSong.category || playlistModalSong.language
                  );
                }}
              />
              <div className="add-playlist-target-info">
                <div className="add-playlist-target-title">
                  {playlistModalSong.title}
                </div>
                <div className="add-playlist-target-artist">
                  {playlistModalSong.artist} • {playlistModalSong.language}
                </div>
              </div>
            </div>

            <div className="add-playlist-list-label">YOUR PLAYLISTS</div>

            {/* Playlists Options List */}
            <div className="add-playlist-options-list">
              {customPlaylists.map((pl) => {
                const isAdded = (pl.songIds || []).some(
                  (id) => String(id) === String(playlistModalSong.id)
                );
                return (
                  <button
                    key={pl.id}
                    className={`add-playlist-option ${isAdded ? "in-playlist" : ""}`}
                    onClick={() =>
                      toggleSongInPlaylist(pl.id, playlistModalSong.id)
                    }
                  >
                    <div className="add-playlist-option-left">
                      <ListMusic size={16} />
                      <span>{pl.name}</span>
                    </div>
                    <span
                      className={`add-playlist-status-badge ${
                        isAdded ? "added" : "add"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={13} /> Added
                        </>
                      ) : (
                        <>
                          <Plus size={13} /> Add
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick New Playlist creator */}
            <form
              className="add-playlist-new-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const input = form.elements.playlistName;
                if (input && input.value.trim()) {
                  createCustomPlaylist(input.value.trim(), playlistModalSong);
                  input.value = "";
                }
              }}
            >
              <input
                name="playlistName"
                type="text"
                placeholder="New playlist name..."
              />
              <button type="submit">Create & Add</button>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          QUICK LYRICS MODAL
      ================================================= */}
      {showLyricsModal && currentLyrics && (
        <div
          className="modal-overlay lyrics-modal-overlay"
          onClick={() => setShowLyricsModal(false)}
        >
          <div
            className="lyrics-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lyrics-header">
              <div>
                <h3>{currentSong?.title}</h3>
                <p>{currentSong?.artist}</p>
              </div>
              <button onClick={() => setShowLyricsModal(false)}>
                <X size={19} />
              </button>
            </div>
            <div
              className="lyrics-content"
              dangerouslySetInnerHTML={{ __html: currentLyrics }}
            />
          </div>
        </div>
      )}

      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="toast">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}