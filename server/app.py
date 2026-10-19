"""
Sangeetify Backend — JioSaavn API integration server.
Provides search, song details, album details, playlist details,
lyrics, media URLs, streaming, and downloading endpoints.
"""

from typing import Optional
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from file_downloader import TaskManager
from saavn_nn import (
    get_album_details,
    get_album_details_from_url,
    get_lyrics,
    get_playlist_details,
    get_playlist_details_from_url,
    get_song_details,
    get_song_details_from_url,
    check_media_url,
    search_query,
)
from sections_service import get_synced_sections, fetch_jiosaavn_songs, load_local_songs


app = FastAPI(
    title="Sangeetify API",
    description="Backend API for Sangeetify Music App — powered by JioSaavn",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

task_manager = TaskManager()


@app.get("/", response_class=HTMLResponse)
def home():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return RedirectResponse(url="/docs")


@app.get("/api/health")
@app.get("/health")
def health():
    return {"status": "ok", "message": "Sangeetify API is running", "port": int(os.environ.get("PORT", 5005))}


@app.get("/api/sections")
def get_sections():
    """Get all home page sections synced with JioSaavn database and local songs."""
    return get_synced_sections()


@app.get("/api/suggestions")
def get_suggestions():
    """Get trending search suggestions, top tags, and artists."""
    return {
        "popular_queries": [
            "Arijit Singh", "Barsaat", "Dil Ne Yeh Kaha Hai Dil Se", "Kesariya",
            "Anuv Jain", "Karan Aujla", "Lata Mangeshkar", "Kalyani Remix",
            "Shree Hanuman Chalisa", "Naatu Naatu", "Arabic Kuthu", "Shreya Ghoshal",
            "Atif Aslam", "Pritam", "Sidhu Moose Wala", "Diljit Dosanjh"
        ],
        "moods": ["90s Nostalgia", "Romantic", "Party", "Devotional", "Soulful", "Indie Pop", "Acoustic"],
        "languages": ["Hindi", "Punjabi", "Tamil", "Telugu", "Gujarati", "Bhojpuri", "Marathi", "Sanskrit"]
    }


@app.get("/api/recommendations")
def get_recommendations(query: str = "Bollywood Love Songs", limit: int = 10):
    """Get database recommendation songs based on query or title."""
    return fetch_jiosaavn_songs(query, limit=limit)



@app.get("/api/search")
@app.get("/search")
def search_jiosaavn(query: str, lyrics: Optional[bool] = False):
    """
    Search for songs, albums, or playlists.
    Accepts a text query or a JioSaavn URL.
    """
    if "saavn" in query:
        token = query.rstrip("/").split("/")[-1]
        if "/song" in query:
            res = get_song_details_from_url(token)
            return {"type": "song", "result": res}
        elif "/album" in query:
            res = get_album_details_from_url(token)
            return {"type": "album", "result": res}
        elif "/playlist" in query or "/featured" in query:
            res = get_playlist_details_from_url(token, 1)
            return {"type": "playlist", "result": res}
        else:
            return JSONResponse(
                status_code=404,
                content={
                    "error": "Unknown URL",
                    "message": "Please send links from https://www.jiosaavn.com only",
                },
            )
    return {"type": "query", "result": search_query(query)}


@app.get("/api/song/{song_id}")
@app.get("/song/{song_id}")
def song_details(song_id: str):
    """Get song details using song id."""
    res = get_song_details(song_id)
    if res is None:
        return JSONResponse(
            status_code=404, content={"error": "Song not found", "song_id": song_id}
        )
    return res


@app.get("/api/lyrics/{song_id}")
@app.get("/lyrics/{song_id}")
def get_song_lyrics(song_id: str):
    """Get song lyrics."""
    res = get_lyrics(song_id)
    if res is None:
        return JSONResponse(
            status_code=404, content={"error": "Lyrics not found", "song_id": song_id}
        )
    return res


@app.get("/api/album/{album_id}")
@app.get("/album/{album_id}")
def album_details(album_id: str):
    """Get album details including all songs."""
    res = get_album_details(album_id)
    if res is None:
        return JSONResponse(
            status_code=404,
            content={"error": "Album not found", "album_id": album_id},
        )
    return res


@app.get("/api/playlist/{playlist_id}")
@app.get("/playlist/{playlist_id}")
def playlist_details(playlist_id: str, page_no: Optional[int] = 1):
    """Get playlist details with songs."""
    res = get_playlist_details(playlist_id, page_no)
    if res is None:
        return JSONResponse(
            status_code=404,
            content={"error": "Playlist not found", "playlist_id": playlist_id},
        )
    return res


@app.get("/api/media_url/{song_id}")
@app.get("/media_url/{song_id}")
def download_link(song_id: str):
    """Get verified streaming/download URL for a song."""
    details = get_song_details(song_id)
    if not details or not details.media_url:
        return JSONResponse(
            status_code=404,
            content={"error": "Media URL not found", "song_id": song_id},
        )
    return {"media_url": check_media_url(details.media_url)}


@app.get("/api/stream/{song_id}")
@app.get("/stream/{song_id}")
def stream_song(song_id: str):
    """Redirect to direct audio stream for a song."""
    details = get_song_details(song_id)
    if not details or not details.media_url:
        return JSONResponse(
            status_code=404, content={"error": "Song not found", "song_id": song_id}
        )
    url = check_media_url(details.media_url)
    return RedirectResponse(url=url)


@app.get("/api/download_song/{song_id}")
@app.get("/download_song/{song_id}")
def download_song(song_id: str):
    """Initiate a background song download task."""
    details = get_song_details(song_id)
    if not details or not details.media_url:
        return JSONResponse(
            status_code=404, content={"error": "Song not found", "song_id": song_id}
        )
    media_url = details.media_url
    return {"task_id": task_manager.add_task(media_url)}


@app.get("/api/get_task_status/{task_id}")
@app.get("/get_task_status/{task_id}")
def get_task_status(task_id: int):
    return {"task_finished": task_manager.get_task_status(task_id)}


@app.get("/api/del_task/{task_id}")
@app.get("/del_task/{task_id}")
def del_task(task_id: int):
    task_manager.del_task(task_id)
    return {"task_finished": True}


if __name__ == "__main__":
    from uvicorn import run

    port = int(os.environ.get("PORT", 5005))
    run("app:app", host="0.0.0.0", port=port, reload=True)
