"""
CreditGuard AI - Model Router
Model information, metrics, and feature importance endpoints.
"""

from fastapi import APIRouter, HTTPException
from app.services.model_service import model_service

router = APIRouter(prefix="/api/model", tags=["Model"])


@router.get("/info")
async def get_model_info():
    """Model metadata and configuration."""
    if not model_service.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    meta = model_service.metadata
    training = meta.get("training_info", {})
    dataset = meta.get("dataset_info", {})

    return {
        "model_name": model_service.model_name,
        "model_version": model_service.model_version,
        "algorithm": meta.get("algorithm", "Unknown"),
        "decision_threshold": model_service.threshold,
        "feature_columns": meta.get("feature_columns", []),
        "is_loaded": True,
        "training_info": {
            "total_samples": training.get("total_samples", 0),
            "train_samples": training.get("train_samples", 0),
            "val_samples": training.get("val_samples", 0),
            "test_samples": training.get("test_samples", 0),
            "legitimate_count": training.get("legitimate_count", 0),
            "fraud_count": training.get("fraud_count", 0),
            "fraud_rate": training.get("fraud_rate", 0),
            "random_state": training.get("random_state", 42),
            "training_time_seconds": training.get("training_time_seconds", 0),
        },
        "dataset_info": dataset,
    }


@router.get("/metrics")
async def get_model_metrics():
    """Full evaluation metrics from the held-out test set."""
    if not model_service.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    metrics = model_service.get_metrics()
    comparison = model_service.get_model_comparison()

    # Limit curve data points for API response
    def truncate_curve(curve_data: dict, key1: str, key2: str, max_pts: int = 100) -> dict:
        if not curve_data:
            return {}
        arr1 = curve_data.get(key1, [])
        arr2 = curve_data.get(key2, [])
        n = len(arr1)
        if n > max_pts:
            step = max(1, n // max_pts)
            arr1 = arr1[::step]
            arr2 = arr2[::step]
        return {key1: arr1, key2: arr2}

    pr_curve = metrics.get("precision_recall_curve", {})
    roc_curve = metrics.get("roc_curve", {})

    return {
        "accuracy": metrics.get("accuracy", 0),
        "precision": metrics.get("precision", 0),
        "recall": metrics.get("recall", 0),
        "f1_score": metrics.get("f1_score", 0),
        "roc_auc": metrics.get("roc_auc", 0),
        "pr_auc": metrics.get("pr_auc", 0),
        "false_positive_rate": metrics.get("false_positive_rate", 0),
        "threshold": metrics.get("threshold", 0.5),
        "confusion_matrix": metrics.get("confusion_matrix", {}),
        "precision_recall_curve": truncate_curve(pr_curve, "precision", "recall"),
        "roc_curve": truncate_curve(roc_curve, "fpr", "tpr"),
        "model_comparison": comparison,
    }


@router.get("/features")
async def get_feature_importance():
    """Global feature importance rankings."""
    if not model_service.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    importance = model_service.get_feature_importance()
    importance_type = model_service.metadata.get("importance_type", "unknown")

    return {
        "importance_type": importance_type,
        "features": importance,
        "description": (
            "V1-V28 are anonymized PCA-derived features. "
            "Their original feature names are confidential. "
            "Feature importance reflects the model's learned decision weight, "
            "not a causal explanation of fraud."
        )
    }
