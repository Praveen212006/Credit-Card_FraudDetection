"""
CreditGuard AI - Prediction Router
Single and batch prediction endpoints, history, and CSV export.
"""

import io
import csv
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

import pandas as pd

from app.database import get_db
from app.schemas.transaction import TransactionInput
from app.services.prediction_service import prediction_service
from app.services.model_service import model_service
from app.config import FEATURE_COLUMNS, MAX_UPLOAD_SIZE_MB, MAX_BATCH_ROWS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Predictions"])

ALLOWED_MIME = {"text/csv", "application/csv", "application/vnd.ms-excel",
                "text/plain", "application/octet-stream"}


@router.post("/predict")
async def predict_single(
    transaction: TransactionInput,
    db: Session = Depends(get_db)
):
    """
    Predict a single transaction.
    Validates all 30 input features, applies the trained model,
    and returns classification + fraud score.
    """
    if not model_service.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded. Run training pipeline first.")

    try:
        result = prediction_service.create_single_prediction(
            feature_dict=transaction.to_feature_dict(),
            db=db
        )
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Single prediction error: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed. Please check your inputs.")


@router.post("/predict/batch")
async def predict_batch(
    file: UploadFile = File(..., description="CSV file with transaction features"),
):
    """
    Batch prediction from uploaded CSV file.
    Required columns: Time, V1-V28, Amount.
    Class column is optional (ignored if present).
    """
    if not model_service.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    # Validate file type
    if not (file.filename.lower().endswith(".csv")):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are accepted."
        )

    # Read file content
    content = await file.read()

    # Check file size
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed: {MAX_UPLOAD_SIZE_MB}MB"
        )

    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if len(df) == 0:
        raise HTTPException(status_code=400, detail="Uploaded CSV is empty.")

    if len(df) > MAX_BATCH_ROWS:
        raise HTTPException(
            status_code=400,
            detail=f"Too many rows. Maximum: {MAX_BATCH_ROWS:,}"
        )

    # Validate required columns
    missing_cols = set(FEATURE_COLUMNS) - set(df.columns)
    if missing_cols:
        raise HTTPException(
            status_code=422,
            detail=f"Missing required columns: {sorted(missing_cols)}"
        )

    # Check for non-numeric values
    try:
        df[FEATURE_COLUMNS] = df[FEATURE_COLUMNS].apply(pd.to_numeric, errors='coerce')
        if df[FEATURE_COLUMNS].isnull().any().any():
            raise HTTPException(
                status_code=422,
                detail="CSV contains non-numeric or null values in feature columns."
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Data validation error: {str(e)}")

    try:
        result = prediction_service.create_batch_predictions(df)
        return result
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail="Batch prediction failed.")


@router.get("/predictions/history")
async def get_prediction_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=5, le=100),
    search: Optional[str] = Query(None, max_length=50),
    prediction_filter: Optional[str] = Query(None, pattern="^(fraud|legitimate)$"),
    db: Session = Depends(get_db),
):
    """Paginated prediction history with optional search and filters."""
    return prediction_service.get_history(
        db=db, page=page, page_size=page_size,
        search=search, prediction_filter=prediction_filter
    )


@router.get("/predictions/{prediction_id}")
async def get_prediction_by_id(
    prediction_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve a single prediction record by ID."""
    result = prediction_service.get_by_id(prediction_id, db)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Prediction {prediction_id} not found.")
    return result


@router.get("/export/predictions")
async def export_predictions(db: Session = Depends(get_db)):
    """Export all prediction history as a downloadable CSV."""
    records = prediction_service.export_all(db)

    if not records:
        raise HTTPException(status_code=404, detail="No predictions to export.")

    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=["id", "transaction_reference", "prediction",
                     "fraud_score", "decision_threshold", "model_version", "created_at"]
    )
    writer.writeheader()
    writer.writerows(records)

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=creditguard_predictions.csv"}
    )
