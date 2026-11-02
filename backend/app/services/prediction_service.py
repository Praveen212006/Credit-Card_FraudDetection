"""
CreditGuard AI - Prediction Service
Business logic for creating and retrieving predictions.
"""

import uuid
import logging
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from typing import Optional

from app.models.prediction import Prediction
from app.services.model_service import model_service
from app.config import FEATURE_COLUMNS

logger = logging.getLogger(__name__)


class PredictionService:

    def create_single_prediction(self, feature_dict: dict, db: Session) -> dict:
        """
        Run a single prediction, persist it, and return the full result.
        """
        if not model_service.is_loaded:
            raise RuntimeError("Model is not loaded. Please run the training pipeline first.")

        label, fraud_score = model_service.predict_single(feature_dict)
        threshold = model_service.threshold
        version = model_service.model_version
        transaction_ref = f"TXN-{uuid.uuid4().hex[:12].upper()}"

        # Persist to DB
        record = Prediction(
            transaction_reference=transaction_ref,
            prediction=label,
            fraud_score=float(fraud_score),
            decision_threshold=float(threshold),
            model_version=version,
            created_at=datetime.now(timezone.utc),
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        # Get feature contributions (global importance as approximation)
        feature_importance = model_service.get_feature_importance()

        return {
            "prediction_id": record.id,
            "transaction_reference": transaction_ref,
            "prediction": label,
            "fraud_score": round(fraud_score, 6),
            "decision_threshold": threshold,
            "model_version": version,
            "feature_contributions": feature_importance[:10] if feature_importance else None,
            "created_at": record.created_at.isoformat(),
        }

    def create_batch_predictions(self, df: pd.DataFrame) -> dict:
        """
        Run batch predictions on a DataFrame. Does NOT persist to DB.
        """
        if not model_service.is_loaded:
            raise RuntimeError("Model is not loaded.")

        # Ensure correct column order
        X = df[FEATURE_COLUMNS].copy()
        labels, scores = model_service.predict_batch(X)
        threshold = model_service.threshold
        version = model_service.model_version

        predictions = []
        for i, (label, score) in enumerate(zip(labels, scores)):
            ref = f"BATCH-{uuid.uuid4().hex[:8].upper()}"
            predictions.append({
                "row_index": i,
                "transaction_reference": ref,
                "prediction": str(label),
                "fraud_score": round(float(score), 6),
                "decision_threshold": threshold,
            })

        fraud_count = int(np.sum(labels == "fraud"))
        legit_count = int(np.sum(labels == "legitimate"))
        total = len(predictions)

        return {
            "total_records": total,
            "fraud_count": fraud_count,
            "legitimate_count": legit_count,
            "fraud_rate": round(fraud_count / total * 100, 4) if total > 0 else 0.0,
            "predictions": predictions,
            "model_version": version,
        }

    def get_history(self, db: Session, page: int = 1, page_size: int = 20,
                    search: Optional[str] = None,
                    prediction_filter: Optional[str] = None) -> dict:
        """Paginated prediction history with optional filters."""
        query = db.query(Prediction).order_by(Prediction.created_at.desc())

        if search:
            query = query.filter(
                Prediction.transaction_reference.contains(search.upper())
            )
        if prediction_filter in ["fraud", "legitimate"]:
            query = query.filter(Prediction.prediction == prediction_filter)

        total = query.count()
        records = query.offset((page - 1) * page_size).limit(page_size).all()

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "predictions": [r.to_dict() for r in records],
        }

    def get_by_id(self, prediction_id: int, db: Session) -> Optional[dict]:
        """Get a single prediction by ID."""
        record = db.query(Prediction).filter(Prediction.id == prediction_id).first()
        if record is None:
            return None
        return record.to_dict()

    def export_all(self, db: Session) -> list:
        """Export all predictions for CSV download."""
        records = db.query(Prediction).order_by(Prediction.created_at.desc()).all()
        return [r.to_dict() for r in records]


prediction_service = PredictionService()
