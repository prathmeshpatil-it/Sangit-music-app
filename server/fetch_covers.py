import os
import requests
import json
import time

music_dir = r"d:\guddi app\Sangit music app-20261019T024645Z-1-001\Sangit music app\Prajakta Sangit song app\gaana\public\music"
files = [f for f in os.listdir(music_dir) if f.endswith(".mp3")]
print(f"Total mp3 files: {len(files)}")

# Custom specific queries for highest accuracy
custom_queries = {
    "Arabic Kuthu.mp3": "Arabic Kuthu Beast",
    "Arz Kiya Hai.mp3": "Arz Kiya Hai Anuv Jain",
    "Ashke.mp3": "Ashke Karan Aujla",
    "Bairan.mp3": "Bairan Banjaare",
    "Barsaat.mp3": "Barsaat Banjaare",
    "Bawara Mann.mp3": "Bawara Mann Jolly LLB 2",
    "Boyfriend.mp3": "Boyfriend Karan Aujla",
    "Casa Tupka Anthemo.mp3": "Casa Tupka",
    "Chura Ke Dil Mera.mp3": "Chura Ke Dil Mera Main Khiladi Tu Anari",
    "Dil Diyan Gallan.mp3": "Dil Diyan Gallan Tiger Zinda Hai",
    "Dil Ne Yeh Kaha Hain Dil Se.mp3": "Dil Ne Yeh Kaha Hai Dil Se Dhadkan",
    "Excuses.mp3": "Excuses AP Dhillon",
    "Finding Her.mp3": "Finding Her Kushagra",
    "Gehra Hua.mp3": "Gehra Hua Arijit Singh",
    "Hanuman Chalisa.mp3": "Shree Hanuman Chalisa Hariharan",
    "Inaam.mp3": "Inaam Jasleen Royal",
    "Ishq.mp3": "Ishq Faheem Abdullah",
    "Jo Tum Mere Ho.mp3": "Jo Tum Mere Ho Anuv Jain",
    "Kaahe Mose.mp3": "Kaahe Mose Garvit",
    "Kalyani.mp3": "Kalyani Remix ARJN",
    "Kaun Kehte Hain Bhagwan Aate Nahi.mp3": "Kaun Kehte Hain Bhagwan Aate Nahi",
    "Kesariya.mp3": "Kesariya Brahmastra",
    "Khat.mp3": "Khat Navjot Ahuja",
    "Kudiye Ni.mp3": "Kudiye Ni Aparshakti",
    "Kunj Bihari.mp3": "Aarti Kunj Bihari Ki",
    "Lollypop Lagelu.mp3": "Lollypop Lagelu Pawan Singh",
    "Mann Ki Lagan.mp3": "Mann Ki Lagan Paap",
    "Mann Mera Table No. 21.mp3": "Mann Mera Table No 21",
    "Meri Madhubala.mp3": "Meri Madhubala",
    "My Queen.mp3": "My Queen KD Desirock",
    "Naatu Naatu.mp3": "Naatu Naatu RRR",
    "Nai Jaana.mp3": "Nai Jaana Neha Bhasin",
    "One Name Jailer 2.mp3": "One Name Jailer",
    "Parvati.mp3": "Parvati Sadhu Tiwari",
    "Pavazha Malli Sai Abhyankkar.mp3": "Pavazha Malli Sai Abhyankkar",
    "Pehla Nasha.mp3": "Pehla Nasha Jo Jeeta Wohi Sikandar",
    "Radha Ne Kaan Kare Vaat.mp3": "Radha Ne Kaan Kare Vaat Aditya Gadhvi",
    "Radhimaa.mp3": "Radhimaa Sai Abhyankkar",
    "Sahiba.mp3": "Sahiba Aditya Rikhari",
    "Shiv Tandav Stotram.mp3": "Shiv Tandav Stotram Shankar Mahadevan",
    "Sun Saawariya.mp3": "Sun Saawariya Accha Insaan",
    "Tujhe Dekha To Dilwale Dulhania Le Jayenge.mp3": "Tujhe Dekha To Dilwale Dulhania",
    "Tum Hi Ho Aashiqui 2.mp3": "Tum Hi Ho Aashiqui 2",
    "Tum Ho Toh Saiyaara.mp3": "Tum Ho Toh Vishal Mishra",
    "Tumse Achha Kaun Hai.mp3": "Tumse Achha Kaun Hai Mohammed Rafi",
    "Yeshanagula.mp3": "Yeshanagula Anirudh",
}

results = {}
for idx, f in enumerate(files):
    query = custom_queries.get(f, f.replace(".mp3", ""))
    try:
        url = f"https://www.jiosaavn.com/api.php?api_version=4&_format=json&_marker=0&ctx=web6dot0&q={requests.utils.quote(query)}&p=1&n=1&__call=search.getResults"
        r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=6)
        d = r.json()
        songs = d.get("results", [])
        if songs:
            s = songs[0]
            img = s.get("image", "").replace("150x150", "500x500")
            results[f] = {
                "title": s.get("title", ""),
                "artist": s.get("subtitle", "") or s.get("more_info", {}).get("singers", ""),
                "album": s.get("album", "") or s.get("more_info", {}).get("album", ""),
                "year": s.get("year", ""),
                "image": img,
                "jiosaavnId": s.get("id", ""),
                "hasLyrics": s.get("more_info", {}).get("has_lyrics") == "true",
                "duration": int(s.get("more_info", {}).get("duration", 0) or 0)
            }
            print(f"[{idx+1}/{len(files)}] {f} -> {s.get('title')} | {img}")
        else:
            print(f"[{idx+1}/{len(files)}] {f} -> NOT FOUND")
    except Exception as e:
        print(f"[{idx+1}/{len(files)}] {f} -> ERROR: {e}")
    time.sleep(0.1)

output_file = r"d:\guddi app\Sangit music app-20261019T024645Z-1-001\Sangit music app\Prajakta Sangit song app\gaana\server\local_song_meta.json"
with open(output_file, "w", encoding="utf-8") as out:
    json.dump(results, out, indent=2, ensure_ascii=False)

print(f"Successfully saved {len(results)} song metadata entries to {output_file}")
