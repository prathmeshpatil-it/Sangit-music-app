import json

meta_file = r"d:\guddi app\Sangit music app-20261019T024645Z-1-001\Sangit music app\Prajakta Sangit song app\gaana\server\local_song_meta.json"
out_file = r"d:\guddi app\Sangit music app-20261019T024645Z-1-001\Sangit music app\Prajakta Sangit song app\gaana\src\localSongsData.js"

with open(meta_file, "r", encoding="utf-8") as f:
    meta = json.load(f)

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

items = []
idx = 1
for fname, data in meta.items():
    cat = categories.get(fname, {"category": "Featured", "language": "Hindi", "mood": "Popular"})
    clean_artist = data.get("artist", "").split(" - ")[0].replace("&quot;", '"').strip()
    clean_title = data.get("title", fname.replace(".mp3", "")).replace("&quot;", '"').strip()
    clean_album = data.get("album", "").replace("&quot;", '"').strip() or "Single"
    
    items.append({
        "id": idx,
        "title": clean_title,
        "artist": clean_artist or "Various Artists",
        "language": cat["language"],
        "mood": cat["mood"],
        "category": cat["category"],
        "album": clean_album,
        "year": str(data.get("year", "2024")),
        "cover": data.get("image", ""),
        "audio": f"/music/{fname}",
        "duration": data.get("duration", 0),
        "jiosaavnId": data.get("jiosaavnId", ""),
        "hasLyrics": data.get("hasLyrics", False),
        "isLocal": True,
        "isOnline": False
    })
    idx += 1

js_code = "export const LOCAL_SONGS = " + json.dumps(items, indent=2, ensure_ascii=False) + ";\n"
with open(out_file, "w", encoding="utf-8") as out:
    out.write(js_code)

print(f"Successfully wrote {len(items)} songs to {out_file}")
