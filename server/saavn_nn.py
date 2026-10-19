import base64
import json
from traceback import print_exc
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Union

import requests
from pyDes import ECB
from pyDes import PAD_PKCS5
from pyDes import des
from pydantic import BaseModel

try:
    from pydantic import field_validator

    def pydantic_validator(*fields, mode = "before"):
        def decorator(fn):
            return field_validator(*fields, mode = mode)(classmethod(fn))
        return decorator
except ImportError:
    from pydantic import validator

    def pydantic_validator(*fields, mode = "before"):
        def decorator(fn):
            return validator(*fields, pre = (mode == "before"), allow_reuse = True)(fn)
        return decorator

base_url = "https://www.jiosaavn.com/api.php"

des_cipher = des(b"38346591", ECB, b"\0\0\0\0\0\0\0\0", pad = None,
                 padmode = PAD_PKCS5)


################################################################################
# pydantic models
################################################################################
class Artist(BaseModel):
    id: Union[int, str]
    name: str
    role: Optional[str] = ""
    image: Optional[str] = ""
    type: Optional[str] = ""
    perma_url: Optional[str] = ""

    @pydantic_validator('image')
    def fix_artist_image(cls, v):
        return fix_image_url(v)


class ArtistsMap(BaseModel):
    primary_artists: List[Artist] = []
    featured_artists: List[Artist] = []
    artists: List[Artist] = []


class SongDetails(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = ""
    type: Optional[str] = "song"
    perma_url: Optional[str] = ""
    image: Optional[str] = ""
    language: Optional[str] = ""
    play_count: Optional[Union[int, str]] = None
    explicit_content: Optional[Union[bool, str]] = None
    list_count: Optional[Union[int, str]] = None
    list_type: Optional[str] = None
    list: Optional[Any] = None
    music: Optional[str] = ""
    album: Optional[str] = ""
    album_id: Optional[Union[int, str]] = ""
    album_url: Optional[str] = ""
    label: Optional[str] = ""
    origin: Optional[str] = ""
    is_320kbps: Optional[Union[bool, str]] = False
    encrypted_media_url: Optional[str] = ""
    media_url: Optional[str] = ""
    media_url_default: Optional[str] = ""
    duration: Optional[Union[int, str]] = 0
    has_lyrics: Optional[Union[bool, str]] = False
    lyrics_snippet: Optional[str] = ""
    lyrics_id: Optional[str] = None
    starred: Optional[Union[bool, str]] = False
    copyright_text: Optional[str] = ""
    artistMap: Optional[Any] = None
    release_date: Optional[str] = ""
    year: Optional[Union[int, str]] = 0
    vlink: Optional[str] = None

    @pydantic_validator('title', 'subtitle', 'album')
    def fix_title_(cls, v):
        return fix_title(v)

    @pydantic_validator('image')
    def fix_image(cls, v):
        return fix_image_url(v)


class AlbumDetails(BaseModel):
    id: Union[int, str]
    title: str
    subtitle: Optional[str] = ""
    type: Optional[str] = ""
    perma_url: Optional[str] = ""
    image: Optional[str] = ""
    language: Optional[str] = ""
    year: Optional[Union[int, str]] = 0
    play_count: Optional[Union[int, str]] = ""
    explicit_content: Optional[Union[bool, str]] = False
    list_count: Optional[Union[int, str]] = 0
    list_type: Optional[str] = ""
    songs: List[SongDetails] = []

    @pydantic_validator('image')
    def fix_image(cls, v):
        return fix_image_url(v)


class PlaylistDetails(AlbumDetails):
    uid: Optional[str] = ""
    last_updated: Optional[str] = ""
    username: Optional[str] = ""
    firstname: Optional[str] = ""
    lastname: Optional[str] = ""
    follower_count: Optional[Union[int, str]] = 0
    fan_count: Optional[Union[int, str]] = 0


################################################################################
# jiosaavn_api functions
################################################################################
def jiosaavn_request(search_params, headers = None, resp_only = False) -> Union[
    requests.Response, Dict, None]:
    if headers is None:
        headers = {}
    search_params = {'api_version': 4, '_format': 'json', '_marker': 0,
                     **search_params}
    headers = {
        "Referer": "https://www.jiosaavn.com",
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/120.0.0.0 Safari/537.36",
        **headers
    }
    try:
        resp = requests.get(base_url, params = search_params, headers = headers, timeout = 15)
    except Exception as e:
        print(f"JioSaavn request error: {e}")
        return None

    if resp_only:
        return resp
    try:
        return resp.json()
    except Exception:
        try:
            return json.loads(resp.text.strip())
        except Exception:
            print_exc()
            return None


def search_query(query: str, limit: int = 20) -> List[SongDetails]:
    # First attempt: search.getResults for full rich list of 15-20 tracks
    try:
        search_results = jiosaavn_request({
            '__call': "search.getResults",
            'api_version': "4",
            '_format': "json",
            '_marker': "0",
            'ctx': "web6dot0",
            'q': query,
            'p': 1,
            'n': limit,
        })
        if search_results and isinstance(search_results, dict) and "results" in search_results:
            results_list = search_results["results"]
            if isinstance(results_list, list) and len(results_list) > 0:
                songs = []
                for s in results_list:
                    fixed = fix_song_details(s)
                    if fixed:
                        songs.append(fixed)
                if songs:
                    return songs
    except Exception as e:
        print(f"search.getResults error: {e}")

    # Fallback attempt: autocomplete.get
    query_results = jiosaavn_request({
        '__call': "autocomplete.get",
        'ctx': "wap6dot0",
        'query': query
    })
    if not query_results or "songs" not in query_results or "data" not in query_results["songs"]:
        return []
    songs = []
    for song in query_results["songs"]["data"]:
        song_id = song.get("id")
        if song_id:
            detail = get_song_details(song_id)
            if detail:
                songs.append(detail)
    return songs


def get_song_details(song_id: str) -> Optional[SongDetails]:
    resp = jiosaavn_request({
        '__call': "song.getDetails",
        'pids': song_id,
    })
    if not resp or not isinstance(resp, dict) or song_id not in resp:
        return None
    return fix_song_details(resp[song_id])


def get_song_details_from_url(song_url: str) -> Optional[SongDetails]:
    resp = jiosaavn_request({
        "__call": "webapi.get",
        "token": song_url,
        "type": "song"
    })
    if not resp or not isinstance(resp, dict):
        return None
    if len(resp) == 1:
        return fix_song_details(list(resp.values())[0])
    return None


def fix_song_details(song_details: Dict[str, Any]) -> Optional[SongDetails]:
    if not song_details or not isinstance(song_details, dict):
        return None
    song_more_details = song_details.get("more_info", {})
    if not isinstance(song_more_details, dict):
        song_more_details = {}
    encrypted_url = song_more_details.get("encrypted_media_url", "")
    if encrypted_url:
        default_media_url, media_url = decrypt_url(encrypted_url)
    else:
        default_media_url, media_url = "", ""
    song_details["media_url"] = media_url
    song_details["media_url_default"] = default_media_url
    is_320 = song_more_details.get("320kbps", False)

    combined = {**song_details, **song_more_details, "is_320kbps": is_320}
    try:
        return SongDetails(**combined)
    except Exception as e:
        print(f"Error validating SongDetails: {e}")
        try:
            return SongDetails.construct(**combined)
        except Exception:
            return None


def get_album_details(album_id: str) -> Optional[AlbumDetails]:
    album_results = jiosaavn_request({
        "__call": "content.getAlbumDetails",
        "albumid": album_id
    })
    if not album_results or not isinstance(album_results, dict):
        return None
    songs_raw = album_results.get("list", [])
    parsed_songs = []
    if isinstance(songs_raw, list):
        for s in songs_raw:
            fixed = fix_song_details(s)
            if fixed:
                parsed_songs.append(fixed)
    album_results["songs"] = parsed_songs
    try:
        return AlbumDetails(**album_results)
    except Exception as e:
        print(f"Error parsing AlbumDetails: {e}")
        return None


def get_album_details_from_url(album_url: str) -> Optional[AlbumDetails]:
    album_results = jiosaavn_request({
        "__call": "webapi.get",
        "token": album_url,
        "type": "album"
    })
    if not album_results or not isinstance(album_results, dict):
        return None
    songs_raw = album_results.get("list", [])
    parsed_songs = []
    if isinstance(songs_raw, list):
        for s in songs_raw:
            fixed = fix_song_details(s)
            if fixed:
                parsed_songs.append(fixed)
    album_results["songs"] = parsed_songs
    try:
        return AlbumDetails(**album_results)
    except Exception as e:
        print(f"Error parsing AlbumDetails from url: {e}")
        return None


def get_playlist_details(playlist_id: str, page_no: int = 1) -> Optional[PlaylistDetails]:
    playlist_details = jiosaavn_request({
        "__call": "playlist.getDetails",
        "listid": playlist_id,
        "p": page_no
    })
    if not playlist_details or not isinstance(playlist_details, dict):
        return None
    more_info = playlist_details.get("more_info", {})
    if not isinstance(more_info, dict):
        more_info = {}
    songs_raw = playlist_details.get("list", [])
    parsed_songs = []
    if isinstance(songs_raw, list):
        for s in songs_raw:
            fixed = fix_song_details(s)
            if fixed:
                parsed_songs.append(fixed)
    combined = {**playlist_details, **more_info, "songs": parsed_songs}
    try:
        return PlaylistDetails(**combined)
    except Exception as e:
        print(f"Error parsing PlaylistDetails: {e}")
        return None


def get_playlist_details_from_url(
        playlist_url: str, page_no: int = 1) -> Optional[PlaylistDetails]:
    playlist_details = jiosaavn_request({
        "__call": "webapi.get",
        "token": playlist_url,
        "type": "playlist",
        "p": page_no
    })
    if not playlist_details or not isinstance(playlist_details, dict):
        return None
    more_info = playlist_details.get("more_info", {})
    if not isinstance(more_info, dict):
        more_info = {}
    songs_raw = playlist_details.get("list", [])
    parsed_songs = []
    if isinstance(songs_raw, list):
        for s in songs_raw:
            fixed = fix_song_details(s)
            if fixed:
                parsed_songs.append(fixed)
    combined = {**playlist_details, **more_info, "songs": parsed_songs}
    try:
        return PlaylistDetails(**combined)
    except Exception as e:
        print(f"Error parsing PlaylistDetails from url: {e}")
        return None


def get_lyrics(song_id: str):
    lyrics_json = jiosaavn_request({
        "__call": "lyrics.getLyrics",
        "lyrics_id": song_id,
        "ctx": "wap6dot0"
    })
    return lyrics_json


################################################################################
# utility functions
################################################################################
def decrypt_url(url: str):
    if not url:
        return "", ""
    try:
        enc_url = base64.b64decode(url.strip())
        default_dec_url = des_cipher.decrypt(enc_url, padmode = PAD_PKCS5).decode('utf-8')
        # JioSaavn CDN serves audio in MP4/AAC (.mp4), NOT .mp3
        dec_url = default_dec_url.replace("_96.mp4", "_320.mp4")
        return default_dec_url, dec_url
    except Exception as e:
        print(f"Decrypt URL Error: {e}")
        return "", ""


def fix_image_url(url):
    if not url:
        return ""
    url = str(url)
    if 'http://' in url:
        url = url.replace("http://", "https://")
    url = url.replace('150x150', '500x500')
    return url


def fix_title(title):
    if not title:
        return ""
    return str(title).replace('&quot;', '')


def expand_url(url: str) -> str:
    if not url:
        return ""
    try:
        session = requests.Session()
        resp = session.head(url, allow_redirects = True, timeout = 10)
        return resp.url
    except Exception as e:
        print("URL Redirect Error: ", e)
        return url


def check_media_url(dec_url: str) -> str:
    if not dec_url:
        return ""
    # JioSaavn CDN audio stream extension is .mp4 (AAC), not .mp3
    dec_url = dec_url.replace(".mp3", ".mp4")
    ex_dec_url = expand_url(dec_url)
    try:
        r = requests.head(ex_dec_url, timeout = 5)
        if r.status_code == 200:
            return ex_dec_url
        fallback_160 = ex_dec_url.replace("_320.mp4", "_160.mp4")
        r160 = requests.head(fallback_160, timeout = 5)
        if r160.status_code == 200:
            return fallback_160
        return ex_dec_url.replace("_320.mp4", "_96.mp4")
    except Exception as e:
        print(f"Check media URL error: {e}")
        return ex_dec_url

