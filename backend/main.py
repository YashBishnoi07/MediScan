"""
FastAPI Main Application
Automated Disease Diagnosis System
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.diagnose import router as diagnose_router
from routes.models import router as models_router
from services.cnn_service import CNNService
from services.ml_service import MLService

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger(__name__)

# Shared model registry — populated at startup
model_registry: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all ML models into memory at startup."""
    logger.info("Loading ML models...")
    try:
        # These are handled by the services themselves now or can be pre-cached
        CNNService.get_model("pneumonia")
        CNNService.get_model("tumor")
        logger.info("✅ Core models initialized")
    except Exception as e:
        logger.warning(f"⚠️  Initialization warning: {e}")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="Automated Disease Diagnosis API",
    description="AI-powered medical image analysis for pneumonia and brain tumor detection",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(diagnose_router, prefix="/api/diagnose", tags=["Diagnosis"])
app.include_router(models_router, prefix="/api/models", tags=["Models"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    cnn_p = os.path.exists("models/cnn_pneumonia_v2.h5")
    cnn_t = os.path.exists("models/cnn_tumor_v2.h5")
    return {
        "status": "ok",
        "models_found": {
            "cnn_pneumonia": cnn_p,
            "cnn_tumor": cnn_t,
        },
        "ready": cnn_p and cnn_t,
    }

@app.get("/api/stats")
async def get_stats():
    """Get scan statistics."""
    from services.stats_service import StatsService
    return StatsService.get_stats()
