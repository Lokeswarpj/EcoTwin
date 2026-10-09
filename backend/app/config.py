import os
from pathlib import Path
from dotenv import load_dotenv

# Base Directory paths
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR.parent
ENV_PATH = BACKEND_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
DEFAULT_CITY = os.getenv("DEFAULT_CITY", "Bengaluru")
DB_PATH = BACKEND_DIR / "ecotwin.db"
DATA_DIR = BASE_DIR / "data"

def is_gemini_configured() -> bool:
    return bool(GEMINI_API_KEY and not GEMINI_API_KEY.startswith("your_"))
