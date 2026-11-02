"""
CreditGuard AI - FastAPI Application Entry Point
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import (
    APP_TITLE, APP_DESCRIPTION, APP_VERSION, CORS_ORIGINS
)
from app.database import init_db
from app.services.model_service import model_service
from app.services.dataset_service import dataset_service
from app.routers import dashboard, dataset, prediction, model

# ─────────────────────────────────────────────
#  Logging
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
#  Lifespan (startup / shutdown)
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("="*50)
    logger.info("  CreditGuard AI — Starting Up")
    logger.info("="*50)

    # Initialize database
    init_db()
    logger.info("✓ Database initialized")

    # Load model
    model_loaded = model_service.load()
    if model_loaded:
        logger.info(f"✓ Model loaded: {model_service.model_name} v{model_service.model_version}")
    else:
        logger.warning("✗ Model not loaded — run ml/train.py first")

    # Load dataset
    dataset_loaded = dataset_service.load()
    if dataset_loaded:
        logger.info(f"✓ Dataset loaded: {dataset_service.df.shape[0]:,} records")
    else:
        logger.warning("✗ Dataset not loaded")

    logger.info("  API ready at http://localhost:8000")
    logger.info("  Docs at     http://localhost:8000/docs")
    logger.info("="*50)

    yield  # Application runs here

    logger.info("CreditGuard AI shutting down...")


# ─────────────────────────────────────────────
#  App Creation
# ─────────────────────────────────────────────
app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────────
#  CORS
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
#  Include Routers
# ─────────────────────────────────────────────
app.include_router(dashboard.router)
app.include_router(dataset.router)
app.include_router(prediction.router)
app.include_router(model.router)


# ─────────────────────────────────────────────
#  Health Check
# ─────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
async def health_check():
    """API health check — returns model and dataset status."""
    return {
        "status": "ok",
        "model_loaded": model_service.is_loaded,
        "dataset_loaded": dataset_service.is_loaded,
        "model_name": model_service.model_name,
        "model_version": model_service.model_version,
        "version": APP_VERSION,
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": "CreditGuard AI",
        "description": "Intelligent Credit Card Fraud Detection Platform",
        "version": APP_VERSION,
        "docs": "/docs",
    }
