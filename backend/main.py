"""
FastAPI Main Application
Automated Disease Diagnosis System
"""
import os
os.environ["TF_USE_LEGACY_KERAS"] = "1"

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.diagnose import router as diagnose_router
from routes.models import router as models_router
from services.model_loader import load_all_models

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all ML models into memory at startup."""
    logger.info("Starting up and loading models...")
    try:
        load_all_models()
        logger.info("✅ All models loaded and services ready")
    except Exception as e:
        logger.error(f"❌ Critical initialization failure: {e}")
        # In production, you might want to exit here
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="Automated Disease Diagnosis API",
    description="AI-powered medical image analysis for pneumonia and brain tumor detection",
    version="2.0.0",
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

# Import and include test router if it exists
try:
    from routes.test import router as test_router
    app.include_router(test_router, prefix="/api/test", tags=["Testing"])
except ImportError:
    pass


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    from services.model_loader import _models
    return {
        "status": "ok",
        "version": "2.0.0",
        "models_loaded": list(_models.keys()),
        "ready": len(_models) > 0
    }

@app.get("/api/stats")
async def get_stats():
    """Get scan statistics."""
    try:
        from services.stats_service import StatsService
        return StatsService.get_stats()
    except:
        return {"error": "Stats service not available"}
