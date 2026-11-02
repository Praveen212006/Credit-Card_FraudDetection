"""
CreditGuard AI - Model Service
Singleton that loads and caches the trained pipeline and metadata.
"""

import os
import json
import logging
import numpy as np
import pandas as pd
import joblib
from typing import Optional, Tuple
from app.config import PIPELINE_PATH, FEATURE_NAMES_PATH, METADATA_PATH, FEATURE_COLUMNS

logger = logging.getLogger(__name__)


class ModelService:
    """Singleton service for fraud detection inference."""

    _instance = None
    _pipeline = None
    _metadata = None
    _feature_names = None
    _is_loaded = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def load(self) -> bool:
        """Load model pipeline and metadata from disk. Returns True if successful."""
        try:
            if not os.path.exists(PIPELINE_PATH):
                logger.error(f"Model pipeline not found at: {PIPELINE_PATH}")
                return False

            logger.info("Loading CreditGuard AI model pipeline...")
            self._pipeline = joblib.load(PIPELINE_PATH)

            if os.path.exists(FEATURE_NAMES_PATH):
                self._feature_names = joblib.load(FEATURE_NAMES_PATH)
            else:
                self._feature_names = FEATURE_COLUMNS

            if os.path.exists(METADATA_PATH):
                with open(METADATA_PATH, "r") as f:
                    self._metadata = json.load(f)
            else:
                logger.warning("Model metadata file not found.")
                self._metadata = {}

            self._is_loaded = True
            logger.info(f"Model loaded: {self._metadata.get('model_name', 'Unknown')}")
            return True

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self._is_loaded = False
            return False

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    @property
    def threshold(self) -> float:
        if self._metadata:
            return self._metadata.get("decision_threshold", 0.5)
        return 0.5

    @property
    def model_version(self) -> str:
        if self._metadata:
            return self._metadata.get("model_version", "1.0.0")
        return "1.0.0"

    @property
    def model_name(self) -> str:
        if self._metadata:
            return self._metadata.get("model_name", "Unknown")
        return "Unknown"

    @property
    def metadata(self) -> dict:
        return self._metadata or {}

    def predict_single(self, feature_dict: dict) -> Tuple[str, float]:
        """
        Predict a single transaction.

        Returns:
            Tuple of (classification_label, fraud_score)
        """
        if not self._is_loaded:
            raise RuntimeError("Model is not loaded. Run training pipeline first.")

        # Build DataFrame in correct feature order
        X = pd.DataFrame([{col: feature_dict.get(col, 0.0) for col in FEATURE_COLUMNS}],
                         columns=FEATURE_COLUMNS)

        # Get probability score for fraud class (index 1)
        fraud_score = float(self._pipeline.predict_proba(X)[0, 1])

        # Apply threshold
        label = "fraud" if fraud_score >= self.threshold else "legitimate"
        return label, fraud_score

    def predict_batch(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict a batch DataFrame.

        Returns:
            Tuple of (labels_array, scores_array)
        """
        if not self._is_loaded:
            raise RuntimeError("Model is not loaded.")

        # Ensure correct column order
        X = df[FEATURE_COLUMNS].copy()
        scores = self._pipeline.predict_proba(X)[:, 1]
        labels = np.where(scores >= self.threshold, "fraud", "legitimate")
        return labels, scores

    def get_feature_importance(self) -> list:
        """Return global feature importance from metadata."""
        if self._metadata:
            return self._metadata.get("feature_importance", [])
        return []

    def get_metrics(self) -> dict:
        """Return test set evaluation metrics."""
        if self._metadata:
            return self._metadata.get("test_metrics", {})
        return {}

    def get_model_comparison(self) -> dict:
        """Return comparison metrics across all trained models."""
        if self._metadata:
            return self._metadata.get("all_model_comparison", {})
        return {}

    def get_training_info(self) -> dict:
        """Return training dataset information."""
        if self._metadata:
            return self._metadata.get("training_info", {})
        return {}


# Global singleton
model_service = ModelService()
