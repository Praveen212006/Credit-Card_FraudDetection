"""
CreditGuard AI - Pydantic Schemas
Input validation and response models.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─────────────────────────────────────────────
#  Request Schemas
# ─────────────────────────────────────────────

class TransactionInput(BaseModel):
    """Single transaction prediction request."""
    Time: float = Field(..., description="Seconds elapsed since first transaction")
    V1: float; V2: float; V3: float; V4: float; V5: float
    V6: float; V7: float; V8: float; V9: float; V10: float
    V11: float; V12: float; V13: float; V14: float; V15: float
    V16: float; V17: float; V18: float; V19: float; V20: float
    V21: float; V22: float; V23: float; V24: float; V25: float
    V26: float; V27: float; V28: float
    Amount: float = Field(..., ge=0.0, description="Transaction amount (>= 0)")

    @field_validator("Amount")
    @classmethod
    def amount_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Amount must be non-negative")
        return v

    @field_validator("Time")
    @classmethod
    def time_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Time must be non-negative")
        return v

    def to_feature_dict(self) -> dict:
        return self.model_dump()


# ─────────────────────────────────────────────
#  Response Schemas
# ─────────────────────────────────────────────

class FeatureContribution(BaseModel):
    feature: str
    importance: Optional[float] = None
    shap_value: Optional[float] = None
    abs_value: Optional[float] = None


class PredictionResponse(BaseModel):
    prediction_id: int
    transaction_reference: str
    prediction: str                  # "legitimate" | "fraud"
    fraud_score: float
    decision_threshold: float
    model_version: str
    feature_contributions: Optional[List[Dict[str, Any]]] = None
    created_at: str


class BatchPredictionItem(BaseModel):
    row_index: int
    transaction_reference: str
    prediction: str
    fraud_score: float
    decision_threshold: float


class BatchPredictionResponse(BaseModel):
    total_records: int
    fraud_count: int
    legitimate_count: int
    fraud_rate: float
    predictions: List[BatchPredictionItem]
    model_version: str


class PredictionHistoryItem(BaseModel):
    id: int
    transaction_reference: str
    prediction: str
    fraud_score: float
    decision_threshold: float
    model_version: str
    created_at: str


class PredictionHistoryResponse(BaseModel):
    total: int
    page: int
    page_size: int
    predictions: List[PredictionHistoryItem]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    dataset_loaded: bool
    version: str
