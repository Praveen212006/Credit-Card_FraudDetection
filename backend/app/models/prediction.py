"""
CreditGuard AI - Prediction Database Model
SQLAlchemy ORM model for storing prediction records.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_reference = Column(String(64), nullable=False, index=True)
    prediction = Column(String(32), nullable=False)       # "legitimate" | "fraud"
    fraud_score = Column(Float, nullable=False)
    decision_threshold = Column(Float, nullable=False)
    model_version = Column(String(32), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "transaction_reference": self.transaction_reference,
            "prediction": self.prediction,
            "fraud_score": round(self.fraud_score, 6),
            "decision_threshold": self.decision_threshold,
            "model_version": self.model_version,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
