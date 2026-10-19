import { useEffect, useRef, useState } from "react";
import "./App.css";

const rawSongTitles = [
  "Kesariya",
  "Tum Hi Ho",
  "Raabta",
  "Channa Mereya",
  "Kal Ho Naa Ho",
  "Kabira",
  "Agar Tum Saath Ho",
  "Pee Loon",
  "Kun Faya Kun",
  "Ilahi",
  "Bol Do Na Zara",
  "Sanam Re",
  "Kaise Hua",
  "Bekhayali",
  "Tera Ban Jaunga",
  "Pal",
  "Hawayein",
  "Enna Sona",
  "Gerua",
  "Dil Diyan Gallan",
  "Soch Na Sake",
  "Khairiyat",
  "Shayad",
  "Mast Magan",
  "Banjaara",
  "Galliyan",
  "Sun Raha Hai",
  "Tum Mile",
  "Tu Hi Meri Shab Hai",
  "Pehli Nazar Mein",
  "Jeene Laga Hoon",
  "Be Intehaan",
  "Piya O Re Piya",
  "Jumme Ki Raat",
  "Hangover",
  "Tu Hi Hai",
  "Milne Hai Mujhse Aayi",
  "Chahun Main Ya Naa",
  "Hum Mar Jayenge",
  "Lamborghini",
  "High Rated Gabru",
  "La La La",
  "Proper Patola",
  "Na Ja",
  "Ishq Tera",
  "Slowly Slowly",
  "Brown Munde",
  "Excuses",
  "Insane",
  "Saami Saami",
  "Arabic Kuthu",
  "Butta Bomma",
  "Rowdy Baby",
  "Vaathi Coming",
  "Kaavaalaa",
  "Apna Time Aayega",
  "Ranjha",
  "Raataan Lambiyan",
  "Namo Namo",
  "Qaafirana",
  "Sweetheart",
  "Tera Fitoor",
  "Zinda",
  "Sultan",
  "Bulleya",
  "Samjhawan",
  "Dilbar",
  "Saki Saki",
  "Garmi",
  "Lahore",
  "Patola",
  "Suit Suit",
  "Buzz",
  "Paani Paani",
  "Genda Phool",
];

const artists = [
  "Arijit Singh",
  "Diljit Dosanjh",
  "A.R. Rahman",
  "Shreya Ghoshal",
  "Badshah",
  "Anirudh Ravichander",
  "Neha Kakkar",
  "Jubin Nautiyal",
  "Atif Aslam",
  "Guru Randhawa",
];

const playlists = [
  "Bollywood Hits",
  "Punjabi Grooves",
  "Indie & Acoustic",
  "South Indian Magic",
];

const covers = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTjhUzcPgjABBPieOS4d6X_xQsz7US9PNvnxV6JWPIFA&s=10",
  "https://c.saavncdn.com/430/Aashiqui-2-Hindi-2013-500x500.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR_nJI0BXU0Chp56SsIhxYSXTg_XczCccLNFqRbA-pYg&s",
  "https://c.saavncdn.com/103/Channa-Mereya-From-Ae-Dil-Hai-Mushkil-Hindi-2016-500x500.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCGs5Tus2_nIs6KSsW9Ec2ozDNhEw2ksOnUT2nFraqUg&s",
  "https://i.scdn.co/image/ab67616d0000b273b0e498453d639aa49322c24a",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUDW8L_yF67ixb6ZI55N_0Trc77JnzSvBpsa-eKdgJMg&s=10",
  "https://c.saavncdn.com/512/Once-Upon-A-Time-In-Mumbaai-Hindi-2010-20241223141749-500x500.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlXwwX9cjqwqhZGk13h_TNi9jU-2NhgVxtdpfAffOkFg&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvuYDAQz9FY57PsNFyobm_hKcYd102Bf7sAzvwb4CPjg&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdjrWpjHDMJSfmcbNxG5PB5SPM67i1GZ2ECy97Sx1u4A&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShbCN9frl8g_ja3G5ATQF4TbNxuuWCiKm5HfnIIko_OQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNw8QEGCIREJFSJrqde89k85mjSbp7MN442bFMcdo7dw&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCVbizbx5dBvULyUzgAV8d50Bqq8jdEMYbFKaSFvOTvA&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgnSNy6CECcwYs8D0sYXt3l-v5xAaSqbHrFXS8nqxxbA&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7iIFwGdkLvcTmysAZJHjunLR3bsgm9RbYZGO81jBB6w&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTdtMcn7VdQQ_YAr9-XszUxpMu486a_pQt6eetDXgjOw&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS12ToMJt3jDvIrmJcpkutf1Sti-KiXI1q45HId9D-UcQ&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpOnU2BlbzF7MesvpOFsFTj-MTgwz00qYcMSm5wffApQ&s=10",

];

const demoAudio =["https://koshalworld.com/files/download/id/16913",
  "https://koshalworld.com/files/download/id/11074",
  "https://koshalworld.com/files/download/id/53059",
  "https://koshalworld.com/files/download/id/79826",
  "https://koshalworld.com/files/download/id/10384",
  "https://koshalworld.com/files/download/id/74115",
  "https://koshalworld.com/files/download/id/12375",
  "https://koshalworld.com/files/download/id/10211",
  "https://koshalworld.com/files/download/id/8636",
  "https://koshalworld.com/files/download/id/74114",
  "https://koshalworld.com/files/download/id/27056",
  "https://koshalworld.com/files/download/id/79833",
  "https://koshalworld.com/files/download/id/24857",
  "https://koshalworld.com/files/download/id/36261",
  "https://koshalworld.com/files/download/id/13750",
  "https://koshalworld.com/files/download/id/53764",
  "https://koshalworld.com/files/download/id/9289",
  "https://koshalworld.com/files/download/id/20001",
  "https://pagalnew.com/128-downloads/4882",

]


 
const songs = Array.from({ length: 105 }, (_, i) => ({
  id: i + 1,
  title:
    rawSongTitles[i % rawSongTitles.length] +
    (i >= rawSongTitles.length ? ` (${i + 1})` : ""),
  artist: artists[i % artists.length],
  playlist: playlists[i % playlists.length],
  cover: covers[i % covers.length],
  audio: demoAudio[i % demoAudio.length],
}));

function First() {
  const audioRef = useRef(null);

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [search, setSearch] = useState("");
  const [likedSongs, setLikedSongs] = useState(() => {
    return JSON.parse(localStorage.getItem("desi_stream_liked") || "[]");
  });

  // ---------------- PLAY SONG ----------------

  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // ---------------- AUDIO EFFECT ----------------

  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    const audio = audioRef.current;

    audio.src = currentSong.audio;
    audio.volume = volume;

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [currentSong]);

  // ---------------- PLAY / PAUSE ----------------

  const togglePlayPause = () => {
    if (!currentSong) {
      playSong(songs[0]);
      return;
    }

    const audio = audioRef.current;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  // ---------------- NEXT ----------------

  const nextSong = () => {
    if (!currentSong) {
      playSong(songs[0]);
      return;
    }

    let nextIndex;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      const currentIndex = songs.findIndex(
        (song) => song.id === currentSong.id
      );

      nextIndex = (currentIndex + 1) % songs.length;
    }

    playSong(songs[nextIndex]);
  };

  // ---------------- PREVIOUS ----------------

  const previousSong = () => {
    if (!currentSong) {
      playSong(songs[0]);
      return;
    }

    const currentIndex = songs.findIndex(
      (song) => song.id === currentSong.id
    );

    const previousIndex =
      (currentIndex - 1 + songs.length) % songs.length;

    playSong(songs[previousIndex]);
  };

  // ---------------- AUDIO EVENTS ----------------

  const updateProgress = () => {
    const audio = audioRef.current;

    if (!audio) return;

    setCurrentTime(audio.currentTime);

    if (audio.duration) {
      setDuration(audio.duration);
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSongEnded = () => {
    if (isRepeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      nextSong();
    }
  };

  // ---------------- SEEK ----------------

  const seekAudio = (e) => {
    const value = Number(e.target.value);

    if (!audioRef.current || !duration) return;

    audioRef.current.currentTime = (value / 100) * duration;
    setProgress(value);
  };

  // ---------------- VOLUME ----------------

  const changeVolume = (e) => {
    const value = Number(e.target.value);

    setVolume(value);

    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  // ---------------- LIKE ----------------

  const toggleLike = (songId) => {
    setLikedSongs((previous) => {
      const updated = previous.includes(songId)
        ? previous.filter((id) => id !== songId)
        : [...previous, songId];

      localStorage.setItem(
        "desi_stream_liked",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  // ---------------- SEARCH ----------------

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.artist.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------- TIME FORMAT ----------------

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="app">

      {/* AUDIO */}

      <audio
        ref={audioRef}
        onTimeUpdate={updateProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnded}
      />

      {/* HEADER */}

      <header className="header">

        <h1>🎵 Desi Stream</h1>

        <input
          type="text"
          placeholder="Search songs or artists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </header>

      {/* MAIN */}

      <main>

        <h2>
          {search ? "Search Results" : "Popular Songs"}
        </h2>

        <p>{filteredSongs.length} songs</p>

        <div className="song-grid">

          {filteredSongs.map((song) => (

            <div
              className="song-card"
              key={song.id}
              onClick={() => playSong(song)}
            >

              <img
                src={song.cover}
                alt={song.title}
              />

              <h3>{song.title}</h3>

              <p>{song.artist}</p>

              <div className="card-buttons">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playSong(song);
                  }}
                >
                  ▶
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(song.id);
                  }}
                >
                  {likedSongs.includes(song.id) ? "❤️" : "♡"}
                </button>

              </div>

            </div>

          ))}

        </div>

      </main>

      {/* MUSIC PLAYER */}

      {currentSong && (

        <div className="music-player">

          <div className="current-song">

            <img
              src={currentSong.cover}
              alt={currentSong.title}
            />

            <div>

              <strong>{currentSong.title}</strong>

              <p>{currentSong.artist}</p>

            </div>

          </div>

          <div className="player-controls">

            <div className="buttons">

              <button
                onClick={() => setIsShuffle(!isShuffle)}
              >
                🔀
              </button>

              <button onClick={previousSong}>
                ⏮
              </button>

              <button
                className="play-button"
                onClick={togglePlayPause}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              <button onClick={nextSong}>
                ⏭
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
              >
                🔁
              </button>

            </div>

            <div className="progress-container">

              <span>{formatTime(currentTime)}</span>

              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={seekAudio}
              />

              <span>{formatTime(duration)}</span>

            </div>

          </div>

          <div className="volume">

            🔊

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={changeVolume}
            />

          </div>

        </div>

      )}

    </div>
  );
}


export default First;