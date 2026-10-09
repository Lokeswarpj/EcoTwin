import json
import time
import requests
from pathlib import Path
from typing import Dict, Any
from ..config import DATA_DIR

FALLBACK_FILE = DATA_DIR / "fallback_weather_aqi.json"
CACHE: Dict[str, Any] = {}
CACHE_TTL_SECONDS = 600  # 10 minutes

CITY_COORDS = {
    "Bengaluru": {"lat": 12.9716, "lon": 77.5946},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777},
    "Delhi": {"lat": 28.6139, "lon": 77.2090},
    "Hyderabad": {"lat": 17.3850, "lon": 78.4867},
    "Chennai": {"lat": 13.0827, "lon": 80.2707},
    "Kochi": {"lat": 9.9312, "lon": 76.2673}
}

def get_city_context(city: str = "Bengaluru") -> Dict[str, Any]:
    now = time.time()
    cache_key = f"context_{city}"
    if cache_key in CACHE and (now - CACHE[cache_key]["timestamp"]) < CACHE_TTL_SECONDS:
        return CACHE[cache_key]["data"]

    coords = CITY_COORDS.get(city, CITY_COORDS["Bengaluru"])

    # Try live Open-Meteo API
    try:
        # Weather
        w_url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto"
        w_res = requests.get(w_url, timeout=2.5)
        
        # Air Quality
        aqi_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={coords['lat']}&longitude={coords['lon']}&current=pm2_5,pm10,us_aqi&timezone=auto"
        aqi_res = requests.get(aqi_url, timeout=2.5)

        if w_res.status_code == 200 and aqi_res.status_code == 200:
            w_data = w_res.json().get("current", {})
            aqi_data = aqi_res.json().get("current", {})

            temp = w_data.get("temperature_2m", 24.0)
            aqi_val = int(aqi_data.get("us_aqi", 72))

            if aqi_val <= 50:
                cat = "Good"
            elif aqi_val <= 100:
                cat = "Moderate"
            elif aqi_val <= 150:
                cat = "Unhealthy for Sensitive Groups"
            else:
                cat = "Poor"

            result = {
                "city": city,
                "temperature_c": temp,
                "condition": f"Live Sensor Reading ({temp}°C)",
                "humidity_pct": w_data.get("relative_humidity_2m", 60),
                "wind_speed_kmh": w_data.get("wind_speed_10m", 10.0),
                "aqi": aqi_val,
                "aqi_category": cat,
                "dominant_pollutant": "PM2.5",
                "recommendation": f"Current AQI is {aqi_val} ({cat}). Weather suitable for sustainable urban transit.",
                "source": "Open-Meteo Live API",
                "is_live": True,
                "last_updated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))
            }
            CACHE[cache_key] = {"timestamp": now, "data": result}
            return result
    except Exception:
        pass

    # Use verified fallback
    with open(FALLBACK_FILE, "r", encoding="utf-8") as f:
        fallback_all = json.load(f)
    fb = fallback_all.get(city, fallback_all["Bengaluru"])
    fb["is_live"] = False
    return fb
