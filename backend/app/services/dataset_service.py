"""
CreditGuard AI - Dataset Service
Lazy-loads the dataset and provides analytical queries.
"""

import os
import logging
import numpy as np
import pandas as pd
from typing import Optional
from app.config import DATASET_PATH, FEATURE_COLUMNS, DATASET_PREVIEW_ROWS

logger = logging.getLogger(__name__)


class DatasetService:
    """Singleton service for dataset analytics."""

    _instance = None
    _df: Optional[pd.DataFrame] = None
    _is_loaded = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def load(self) -> bool:
        """Load the dataset from disk."""
        try:
            if not os.path.exists(DATASET_PATH):
                logger.error(f"Dataset not found at: {DATASET_PATH}")
                return False

            logger.info("Loading creditcard.csv dataset...")
            self._df = pd.read_csv(DATASET_PATH)
            self._is_loaded = True
            logger.info(f"Dataset loaded: {len(self._df):,} records")
            return True

        except Exception as e:
            logger.error(f"Failed to load dataset: {e}")
            return False

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    @property
    def df(self) -> Optional[pd.DataFrame]:
        return self._df

    def get_overview(self) -> dict:
        """High-level dataset statistics."""
        if not self._is_loaded:
            return {}

        df = self._df
        fraud_count = int((df["Class"] == 1).sum())
        legit_count = int((df["Class"] == 0).sum())
        total = len(df)
        dup_count = int(df.duplicated().sum())

        return {
            "total_records": total,
            "legitimate_count": legit_count,
            "fraud_count": fraud_count,
            "fraud_percentage": round(fraud_count / total * 100, 4),
            "legitimate_percentage": round(legit_count / total * 100, 4),
            "duplicate_count": dup_count,
            "missing_values": int(df.isnull().sum().sum()),
            "n_features": len(FEATURE_COLUMNS),
            "feature_columns": FEATURE_COLUMNS,
            "amount_stats": {
                "mean": round(float(df["Amount"].mean()), 4),
                "std": round(float(df["Amount"].std()), 4),
                "min": float(df["Amount"].min()),
                "max": float(df["Amount"].max()),
                "median": float(df["Amount"].median()),
                "q25": float(df["Amount"].quantile(0.25)),
                "q75": float(df["Amount"].quantile(0.75)),
            },
            "fraud_amount_stats": {
                "mean": round(float(df[df["Class"]==1]["Amount"].mean()), 4),
                "std": round(float(df[df["Class"]==1]["Amount"].std()), 4),
                "min": float(df[df["Class"]==1]["Amount"].min()),
                "max": float(df[df["Class"]==1]["Amount"].max()),
                "median": float(df[df["Class"]==1]["Amount"].median()),
            },
            "time_stats": {
                "max_seconds": float(df["Time"].max()),
                "max_hours": round(float(df["Time"].max()) / 3600, 2),
            }
        }

    def get_distribution_data(self) -> dict:
        """Data for distribution charts."""
        if not self._is_loaded:
            return {}

        df = self._df

        # Class distribution
        class_dist = [
            {"name": "Legitimate", "value": int((df["Class"]==0).sum()), "class": 0},
            {"name": "Fraudulent", "value": int((df["Class"]==1).sum()), "class": 1},
        ]

        # Amount distribution (histogram bins)
        legit_amounts = df[df["Class"]==0]["Amount"]
        fraud_amounts = df[df["Class"]==1]["Amount"]

        # Use log-scale bins for better visualization
        amount_caps = [0, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, float('inf')]
        amount_labels = ["0-10", "10-25", "25-50", "50-100", "100-250",
                         "250-500", "500-1K", "1K-2.5K", "2.5K-5K", "5K+"]

        amount_hist = []
        for i, label in enumerate(amount_labels):
            lo, hi = amount_caps[i], amount_caps[i+1]
            legit_n = int(((legit_amounts >= lo) & (legit_amounts < hi)).sum())
            fraud_n = int(((fraud_amounts >= lo) & (fraud_amounts < hi)).sum())
            amount_hist.append({"range": label, "legitimate": legit_n, "fraud": fraud_n})

        # Time distribution (hourly bins over 48h period)
        time_bins = np.linspace(0, df["Time"].max(), 49)
        time_hist = []
        for i in range(len(time_bins)-1):
            lo, hi = time_bins[i], time_bins[i+1]
            mask = (df["Time"] >= lo) & (df["Time"] < hi)
            hour = round(lo / 3600, 1)
            time_hist.append({
                "hour": hour,
                "total": int(mask.sum()),
                "fraud": int((mask & (df["Class"]==1)).sum()),
            })

        # Feature statistics per class
        vfeatures = [f"V{i}" for i in range(1, 29)]
        feature_stats = []
        for feat in vfeatures + ["Amount", "Time"]:
            feature_stats.append({
                "feature": feat,
                "legit_mean": round(float(df[df["Class"]==0][feat].mean()), 4),
                "fraud_mean": round(float(df[df["Class"]==1][feat].mean()), 4),
                "legit_std": round(float(df[df["Class"]==0][feat].std()), 4),
                "fraud_std": round(float(df[df["Class"]==1][feat].std()), 4),
            })

        return {
            "class_distribution": class_dist,
            "amount_histogram": amount_hist,
            "time_distribution": time_hist,
            "feature_statistics": feature_stats,
        }

    def get_records(self, page: int = 1, page_size: int = 50,
                    search: str = None, class_filter: int = None) -> dict:
        """Paginated dataset records."""
        if not self._is_loaded:
            return {"total": 0, "page": page, "page_size": page_size, "records": []}

        df = self._df.copy()

        # Apply filters
        if class_filter is not None and class_filter in [0, 1]:
            df = df[df["Class"] == class_filter]

        total = len(df)

        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        page_df = df.iloc[start:end]

        records = page_df.round(6).to_dict(orient="records")

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "records": records,
        }

    def get_correlation_matrix(self) -> dict:
        """Correlation matrix for numeric features (sampled for performance)."""
        if not self._is_loaded:
            return {}

        # Sample for performance
        df = self._df.sample(n=min(10000, len(self._df)), random_state=42)
        features = ["Time", "Amount"] + [f"V{i}" for i in range(1, 15)]  # Top 16 features
        corr = df[features].corr().round(4)

        return {
            "features": features,
            "matrix": corr.values.tolist(),
        }


# Global singleton
dataset_service = DatasetService()
