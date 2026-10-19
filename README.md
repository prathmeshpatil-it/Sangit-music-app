# 🎵 Sangit Music App (Sangeetify)

A modern, full-featured music streaming web application built with React, Vite, and FastAPI. Features seamless online search and streaming via the JioSaavn API, local music playback, synchronized lyrics, audio controls, and curated playlists.

---

## ✨ Features

- **🎧 Seamless Streaming & Offline Playback**: Stream thousands of tracks online or play bundled local audio files.
- **🔍 Powerful Music Search**: Search for songs, artists, albums, and playlists in real time.
- **📜 Synced Lyrics**: Real-time lyrics display for supported tracks.
- **🎛️ Audio Controls**: Responsive audio player with progress seeking, volume adjustment, shuffle, and repeat modes.
- **⚡ Modern Responsive UI**: Sleek, glassmorphic dark theme styled with responsive layouts and Lucide icons.
- **🚀 Dual Architecture**: Lightweight React + Vite frontend backed by an asynchronous Python FastAPI service.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide React, Modern CSS
- **Backend**: Python 3, FastAPI, Uvicorn, Requests
- **APIs**: JioSaavn Music API integration
- **Linting & Tooling**: Oxlint

---

## 📁 Project Structure

```text
Sangit-music-app/
├── public/                 # Static assets & local MP3 tracks
│   └── music/              # Curated local audio tracks
├── server/                 # FastAPI backend server
│   ├── app.py              # Main FastAPI application & API routes
│   ├── saavn_nn.py         # JioSaavn API service & decoders
│   ├── sections_service.py # Section synchronization & song loader
│   ├── file_downloader.py  # Background download manager
│   └── requirements.txt    # Python dependencies
├── src/                    # React frontend application
│   ├── Sangeetify.jsx      # Core music player application component
│   ├── Sangeetify.css      # Custom styling & player themes
│   ├── api.js              # Frontend API client
│   └── localSongsData.js   # Local metadata mapping
├── index.html              # Vite entry point
├── package.json            # Node.js dependencies & scripts
├── start.bat               # One-click startup script for Windows
└── vite.config.js          # Vite configuration
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.10+ recommended)

### 2. Installation

#### Backend Setup
```bash
cd server
pip install -r requirements.txt
```

#### Frontend Setup
```bash
npm install
```

### 3. Running the Application

#### Option A: One-Click Launch (Windows)
Double-click `start.bat` or run:
```cmd
start.bat
```
This automatically starts the Python backend on port 5005, the Vite frontend on port 5173, and launches your default browser.

#### Option B: Manual Launch
1. **Start the backend server:**
   ```bash
   python server/app.py
   ```
   Backend runs at `http://localhost:5005`.

2. **Start the frontend:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
