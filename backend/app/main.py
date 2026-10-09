import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import FRONTEND_ORIGIN, is_gemini_configured
from .database.db import init_db
from .database.repositories import seed_default_demo_data
from .schemas.api import HealthResponse
from .api import dashboard, analyze, planner, actions, solar, context, history

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ecotwin")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing EcoTwin SQLite database...")
    init_db()
    seed_default_demo_data()
    logger.info("EcoTwin database ready. Gemini live status: %s", is_gemini_configured())
    yield

app = FastAPI(
    title="EcoTwin — AI Planet Budget API",
    description="Multimodal planetary budget autopilot engine powered by Gemini AI and deterministic impact models.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", FRONTEND_ORIGIN, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        gemini_configured=is_gemini_configured(),
        version="1.0.0",
        database="SQLite (Initialized)"
    )

# Mount API Routers
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["Analyze"])
app.include_router(planner.router, prefix="/api/planner", tags=["Planner"])
app.include_router(actions.router, prefix="/api/actions", tags=["Actions"])
app.include_router(solar.router, prefix="/api/solar", tags=["Solar"])
app.include_router(context.router, prefix="/api/context", tags=["Context & Forecast"])
app.include_router(history.router, prefix="/api/history", tags=["History"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
