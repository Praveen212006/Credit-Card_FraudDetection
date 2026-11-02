"""
CreditGuard AI - Dashboard Router
GET /api/dashboard/overview
"""

from fastapi import APIRouter
from app.services.model_service import model_service
from app.services.dataset_service import dataset_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview")
async def get_dashboard_overview():
    """
    Aggregated overview for the main analytics dashboard.
    Combines dataset stats, model status, and recent metrics.
    """
    dataset_overview = dataset_service.get_overview() if dataset_service.is_loaded else {}
    model_metrics = model_service.get_metrics() if model_service.is_loaded else {}
    training_info = model_service.get_training_info() if model_service.is_loaded else {}

    return {
        "dataset": {
            "total_records": dataset_overview.get("total_records", 0),
            "legitimate_count": dataset_overview.get("legitimate_count", 0),
            "fraud_count": dataset_overview.get("fraud_count", 0),
            "fraud_percentage": dataset_overview.get("fraud_percentage", 0),
            "amount_stats": dataset_overview.get("amount_stats", {}),
            "fraud_amount_stats": dataset_overview.get("fraud_amount_stats", {}),
        },
        "model": {
            "name": model_service.model_name,
            "version": model_service.model_version,
            "is_loaded": model_service.is_loaded,
            "decision_threshold": model_service.threshold,
            "pr_auc": model_metrics.get("pr_auc", 0),
            "roc_auc": model_metrics.get("roc_auc", 0),
            "recall": model_metrics.get("recall", 0),
            "precision": model_metrics.get("precision", 0),
            "f1_score": model_metrics.get("f1_score", 0),
            "confusion_matrix": model_metrics.get("confusion_matrix", {}),
        },
        "training": {
            "train_samples": training_info.get("train_samples", 0),
            "test_samples": training_info.get("test_samples", 0),
            "fraud_rate": training_info.get("fraud_rate", 0),
        }
    }
