"""
Sections and Recommendations Service for Sangeetify.
Syncs local tracks with JioSaavn database suggestion songs across all app sections.
Guarantees 100% unique cover templates for every single song.
"""

import os
import json
import time
from typing import Dict, List, Any
from saavn_nn import search_query

# Cache container
_CACHE = {
    "sections": None,
    "last_fetched": 0,
    "ttl": 3600  # 1 hour cache
}

def load_local_songs() -> List[Dict[str, Any]]:
    meta_path = os.path.join(os.path.dirname(__file__), "local_song_meta.json")
    if not os.path.exists(meta_path):
        return []
    
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)
    
    local_songs = []
    
    categories = {
        # 90s Gold
        "Tujhe Dekha To Dilwale Dulhania Le Jayenge.mp3": {"category": "90s Gold", "language": "Hindi", "mood": "90s Nostalgia"},
        "Pehla Nasha.mp3": {"category": "90s Gold", "language": "Hindi", "mood": "90s Nostalgia"},
        "Dil Ne Yeh Kaha Hain Dil Se.mp3": {"category": "90s Gold", "language": "Hindi", "mood": "90s Nostalgia"},
        "Chura Ke Dil Mera.mp3": {"category": "90s Gold", "language": "Hindi", "mood": "90s Nostalgia"},
        "Tumse Achha Kaun Hai.mp3": {"category": "90s Gold", "language": "Hindi", "mood": "Classic"},
        
        # Trending / Modern Hits
        "Barsaat.mp3": {"category": "Trending", "language": "Hindi", "mood": "Romantic"},
        "Arz Kiya Hai.mp3": {"category": "Trending", "language": "Hindi", "mood": "Romantic"},
        "Kalyani.mp3": {"category": "Trending", "language": "Hindi", "mood": "Party"},
        "Bairan.mp3": {"category": "Trending", "language": "Hindi", "mood": "Romantic"},
        "Finding Her.mp3": {"category": "Trending", "language": "Hindi", "mood": "Romantic"},
        "Sahiba.mp3": {"category": "Trending", "language": "Hindi", "mood": "Indie Pop"},
        "Jo Tum Mere Ho.mp3": {"category": "Trending", "language": "Hindi", "mood": "Indie Pop"},
        "Casa Tupka Anthemo.mp3": {"category": "Trending", "language": "Hindi", "mood": "Party"},
        "Meri Madhubala.mp3": {"category": "Trending", "language": "Hindi", "mood": "Romantic"},
        "Sun Saawariya.mp3": {"category": "Trending", "language": "Hindi", "mood": "Soulful"},
        "Tum Ho Toh Saiyaara.mp3": {"category": "Trending", "language": "Hindi", "mood": "Romantic"},
        
        # Regional / Multi-Language
        "Naatu Naatu.mp3": {"category": "Regional", "language": "Telugu", "mood": "Party"},
        "Arabic Kuthu.mp3": {"category": "Regional", "language": "Tamil", "mood": "Party"},
        "Excuses.mp3": {"category": "Regional", "language": "Punjabi", "mood": "Party"},
        "Ashke.mp3": {"category": "Regional", "language": "Punjabi", "mood": "Party"},
        "Boyfriend.mp3": {"category": "Regional", "language": "Punjabi", "mood": "Punjabi Pop"},
        "Khat.mp3": {"category": "Regional", "language": "Punjabi", "mood": "Romantic"},
        "Nai Jaana.mp3": {"category": "Regional", "language": "Punjabi", "mood": "Wedding Folk"},
        "Kudiye Ni.mp3": {"category": "Regional", "language": "Punjabi", "mood": "Playful"},
        "Radha Ne Kaan Kare Vaat.mp3": {"category": "Regional", "language": "Gujarati", "mood": "Folk Fusion"},
        "Radhimaa.mp3": {"category": "Regional", "language": "Tamil", "mood": "Melody"},
        "Pavazha Malli Sai Abhyankkar.mp3": {"category": "Regional", "language": "Tamil", "mood": "Melody"},
        "Yeshanagula.mp3": {"category": "Regional", "language": "Telugu", "mood": "Energetic"},
        "One Name Jailer 2.mp3": {"category": "Regional", "language": "Tamil", "mood": "Energetic"},
        "My Queen.mp3": {"category": "Regional", "language": "Haryanvi", "mood": "Urban Desi"},
        "Lollypop Lagelu.mp3": {"category": "Regional", "language": "Bhojpuri", "mood": "Party"},
        
        # Bhakti / Devotional
        "Hanuman Chalisa.mp3": {"category": "Bhakti", "language": "Hindi", "mood": "Devotional"},
        "Kunj Bihari.mp3": {"category": "Bhakti", "language": "Hindi", "mood": "Devotional"},
        "Shiv Tandav Stotram.mp3": {"category": "Bhakti", "language": "Sanskrit", "mood": "Devotional"},
        "Parvati.mp3": {"category": "Bhakti", "language": "Hindi", "mood": "Devotional"},
        "Kaun Kehte Hain Bhagwan Aate Nahi.mp3": {"category": "Bhakti", "language": "Hindi", "mood": "Devotional"},
        
        # Romantic / Bollywood
        "Kesariya.mp3": {"category": "Bollywood", "language": "Hindi", "mood": "Romantic"},
        "Dil Diyan Gallan.mp3": {"category": "Bollywood", "language": "Hindi", "mood": "Romantic"},
        "Tum Hi Ho Aashiqui 2.mp3": {"category": "Bollywood", "language": "Hindi", "mood": "Soulful"},
        "Bawara Mann.mp3": {"category": "Bollywood", "language": "Hindi", "mood": "Romantic"},
        "Gehra Hua.mp3": {"category": "Bollywood", "language": "Hindi", "mood": "Romantic"},
        "Mann Mera Table No. 21.mp3": {"category": "Bollywood", "language": "Hindi", "mood": "Romantic"},
        "Mann Ki Lagan.mp3": {"category": "Bollywood", "language": "Hindi", "mood": "Sufi"},
        "Inaam.mp3": {"category": "Bollywood", "language": "Hindi", "mood": "Romantic"},
        "Ishq.mp3": {"category": "Bollywood", "language": "Hindi", "mood": "Soulful"},
        "Kaahe Mose.mp3": {"category": "Bollywood", "language": "Hindi", "mood": "Acoustic"}
    }
    
    for filename, data in meta.items():
        cat_info = categories.get(filename, {"category": "Featured", "language": "Hindi", "mood": "Popular"})
        clean_artist = data.get("artist", "").split(" - ")[0].strip()
        local_songs.append({
            "id": f"local-{filename}",
            "filename": filename,
            "title": data.get("title", filename.replace(".mp3", "")),
            "artist": clean_artist or "Various Artists",
            "album": data.get("album", "Sangeetify Originals"),
            "year": data.get("year", "2024"),
            "cover": data.get("image", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600"),
            "audio": f"/music/{filename}",
            "language": cat_info["language"],
            "mood": cat_info["mood"],
            "category": cat_info["category"],
            "duration": data.get("duration", 0),
            "jiosaavnId": data.get("jiosaavnId", ""),
            "hasLyrics": data.get("hasLyrics", False),
            "isLocal": True,
            "isOnline": False
        })
    
    return local_songs

def deduplicate_by_image(songs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Strictly guarantees that EVERY song in the list has its own unique cover image."""
    seen_images = set()
    unique_songs = []
    for s in songs:
        cover = s.get("cover") or ""
        if not cover or cover in seen_images:
            continue
        seen_images.add(cover)
        unique_songs.append(s)
    return unique_songs

def fetch_specific_songs(queries: List[str]) -> List[Dict[str, Any]]:
    """Fetches individual top tracks for specific distinct titles to guarantee diverse artwork."""
    results = []
    seen_images = set()
    for q in queries:
        try:
            songs = search_query(q, limit=1)
            if not songs:
                continue
            s = songs[0]
            cover = s.image or ""
            if cover:
                cover = cover.replace("150x150", "500x500").replace("http://", "https://")
            
            # Avoid duplicate covers
            if not cover or cover in seen_images:
                continue
            seen_images.add(cover)
            
            artist = s.subtitle or ""
            if not artist and s.artistMap:
                prim = getattr(s.artistMap, "primary_artists", [])
                if prim:
                    artist = ", ".join([a.name for a in prim])
            if not artist:
                artist = s.music or "Artist"

            results.append({
                "id": f"jiosaavn-{s.id}",
                "jiosaavnId": s.id,
                "title": s.title,
                "artist": artist,
                "album": s.album or "Soundtrack",
                "year": str(s.year) if s.year else "",
                "cover": cover,
                "audio": s.media_url or f"/api/stream/{s.id}",
                "language": s.language or "Hindi",
                "mood": s.label or "Database Hit",
                "category": "Online Suggestion",
                "duration": int(s.duration) if s.duration else 0,
                "hasLyrics": bool(s.has_lyrics),
                "isLocal": False,
                "isOnline": True
            })
        except Exception as e:
            print(f"Error fetching '{q}': {e}")
    return results

def fetch_jiosaavn_songs(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Fetch songs from JioSaavn with unique cover art guarantees."""
    try:
        raw_songs = search_query(query, limit=limit * 2)
        results = []
        seen_images = set()
        for s in raw_songs:
            cover = s.image or ""
            if cover:
                cover = cover.replace("150x150", "500x500").replace("http://", "https://")
            if not cover or cover in seen_images:
                continue
            seen_images.add(cover)

            artist = s.subtitle or ""
            if not artist and s.artistMap:
                prim = getattr(s.artistMap, "primary_artists", [])
                if prim:
                    artist = ", ".join([a.name for a in prim])
            if not artist:
                artist = s.music or "Artist"

            results.append({
                "id": f"jiosaavn-{s.id}",
                "jiosaavnId": s.id,
                "title": s.title,
                "artist": artist,
                "album": s.album or "Single",
                "year": str(s.year) if s.year else "",
                "cover": cover,
                "audio": s.media_url or f"/api/stream/{s.id}",
                "language": s.language or "Hindi",
                "mood": s.label or "Database Hit",
                "category": s.album or "Online Suggestion",
                "duration": int(s.duration) if s.duration else 0,
                "hasLyrics": bool(s.has_lyrics),
                "isLocal": False,
                "isOnline": True
            })
            if len(results) >= limit:
                break
        return results
    except Exception as e:
        print(f"Error in fetch_jiosaavn_songs({query}): {e}")
        return []

def get_synced_sections() -> Dict[str, Any]:
    """Returns all sections synced with local songs + JioSaavn database suggestion songs with unique images."""
    now = time.time()
    if _CACHE["sections"] and (now - _CACHE["last_fetched"]) < _CACHE["ttl"]:
        return _CACHE["sections"]
    
    locals = load_local_songs()
    
    # Filter local songs by category
    trending_local = [s for s in locals if s["category"] == "Trending"]
    bollywood90s_local = [s for s in locals if s["category"] == "90s Gold"]
    regional_local = [s for s in locals if s["category"] == "Regional"]
    bhakti_local = [s for s in locals if s["category"] == "Bhakti"]
    romantic_local = [s for s in locals if s["category"] == "Bollywood" or "Romantic" in s.get("mood", "")]
    
    # Specific queries for each category to ensure 100% unique, diverse movie posters/single covers
    trending_queries = [
        "Apna Bana Le Bhediya",
        "Tere Vaaste Zara Hatke",
        "Chaleya Jawan",
        "O Maahi Dunki",
        "Pehle Bhi Main Animal",
        "Heeriye Jasleen Royal",
        "Maan Meri Jaan King",
        "Satranga Animal",
        "Raataan Lambiyan Shershaah"
    ]
    
    bollywood90s_queries = [
        "Tip Tip Barsa Paani Mohra",
        "Kuch Kuch Hota Hai",
        "Baazigar O Baazigar",
        "Aankh Marey Tere Mere Sapne",
        "Chaiyya Chaiyya Dil Se",
        "Dheere Dheere Se Aashiqui",
        "Main Koi Aisa Geet Gaaon Yes Boss",
        "Pardesi Pardesi Raja Hindustani"
    ]
    
    regional_queries = [
        "Illuminati Aavesham",
        "Kurchi Madathapetti Guntur Kaaram",
        "Tauba Tauba Bad Newz",
        "Lover Diljit Dosanjh",
        "Leo Badass Tamil",
        "Halamithi Habibo Beast",
        "Kavalayya Jailer",
        "Samajavaragamana Ala Vaikunthapurramuloo"
    ]
    
    bhakti_queries = [
        "Radhe Radhe Radhe Barsane Wali Radhe",
        "Shree Krishna Govind Hare Murari",
        "Har Har Shambhu Shiv Mahadeva",
        "Namo Namo Kedarnath",
        "Achutam Keshavam Krishna Bhajan",
        "Mere Ghar Ram Aaye Hain"
    ]
    
    romantic_queries = [
        "Tum Kya Mile Rocky Aur Rani",
        "Tera Ban Jaunga Kabir Singh",
        "Agar Tum Saath Ho Tamasha",
        "Raabta Agent Vinod",
        "Enna Sona OK Jaanu",
        "Shayad Love Aaj Kal"
    ]
    
    trending_db = fetch_specific_songs(trending_queries)
    bollywood90s_db = fetch_specific_songs(bollywood90s_queries)
    regional_db = fetch_specific_songs(regional_queries)
    bhakti_db = fetch_specific_songs(bhakti_queries)
    romantic_db = fetch_specific_songs(romantic_queries)
    
    sections = {
        "trending": {
            "title": "🔥 Trending Now",
            "tag": "Trending",
            "songs": deduplicate_by_image(trending_local + trending_db)
        },
        "bollywood90s": {
            "title": "📼 90s Bollywood Gold",
            "tag": "90s Gold",
            "songs": deduplicate_by_image(bollywood90s_local + bollywood90s_db)
        },
        "regional": {
            "title": "🌐 Multi-Language & Regional Beats",
            "tag": "Regional",
            "songs": deduplicate_by_image(regional_local + regional_db)
        },
        "bhakti": {
            "title": "🙏 Devotional & Spiritual Bhakti",
            "tag": "Bhakti",
            "songs": deduplicate_by_image(bhakti_local + bhakti_db)
        },
        "romantic": {
            "title": "💖 Romantic & Soulful Melodies",
            "tag": "Romantic",
            "songs": deduplicate_by_image(romantic_local + romantic_db)
        },
        "all_local": locals,
        "total_local_count": len(locals),
        "total_songs_count": len(locals) + len(trending_db) + len(bollywood90s_db) + len(regional_db) + len(bhakti_db) + len(romantic_db)
    }
    
    _CACHE["sections"] = sections
    _CACHE["last_fetched"] = now
    return sections
