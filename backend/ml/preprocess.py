"""
CreditGuard AI - Data Preprocessing Pipeline
Handles feature scaling, pipeline construction, and consistent feature ordering.
"""

import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
import joblib
import os

FEATURE_COLUMNS = [
    'Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9',
    'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18',
    'V19', 'V20', 'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27',
    'V28', 'Amount'
]

TARGET_COLUMN = 'Class'

# Only Time and Amount need scaling; V1-V28 are already PCA-transformed
SCALE_COLUMNS = ['Time', 'Amount']
PASSTHROUGH_COLUMNS = [f'V{i}' for i in range(1, 29)]


def build_preprocessor() -> ColumnTransformer:
    """
    Build a ColumnTransformer that scales Time and Amount,
    and passes V1-V28 through unchanged (already PCA-transformed).
    """
    preprocessor = ColumnTransformer(
        transformers=[
            ('scale', StandardScaler(), SCALE_COLUMNS),
            ('passthrough', 'passthrough', PASSTHROUGH_COLUMNS),
        ],
        remainder='drop'
    )
    return preprocessor


def get_transformed_feature_names() -> list:
    """
    Returns feature names in the order produced by the ColumnTransformer.
    Scaled columns come first, then passthrough columns.
    """
    return SCALE_COLUMNS + PASSTHROUGH_COLUMNS


def load_and_prepare_data(csv_path: str):
    """
    Load the creditcard.csv, remove duplicates, separate features and target.

    Returns:
        X (pd.DataFrame): Feature matrix with columns in FEATURE_COLUMNS order.
        y (pd.Series): Binary target (0=legitimate, 1=fraud).
        df (pd.DataFrame): Full raw dataframe.
    """
    print(f"Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)

    print(f"Raw shape: {df.shape}")
    print(f"Duplicates found: {df.duplicated().sum()}")

    # Drop duplicates (keep first occurrence)
    df = df.drop_duplicates()
    print(f"Shape after deduplication: {df.shape}")

    # Ensure all expected columns are present
    missing_cols = set(FEATURE_COLUMNS + [TARGET_COLUMN]) - set(df.columns)
    if missing_cols:
        raise ValueError(f"Dataset missing expected columns: {missing_cols}")

    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].copy()

    return X, y, df


def validate_prediction_input(data: dict) -> pd.DataFrame:
    """
    Validate and convert a single transaction dict into a DataFrame
    with the correct feature order.
    """
    missing = set(FEATURE_COLUMNS) - set(data.keys())
    if missing:
        raise ValueError(f"Missing features: {missing}")

    row = {col: float(data[col]) for col in FEATURE_COLUMNS}
    return pd.DataFrame([row], columns=FEATURE_COLUMNS)


def validate_batch_input(df: pd.DataFrame) -> pd.DataFrame:
    """
    Validate a batch DataFrame has required columns and return
    only the feature columns in correct order.
    """
    missing = set(FEATURE_COLUMNS) - set(df.columns)
    if missing:
        raise ValueError(f"Batch CSV missing required columns: {missing}")
    return df[FEATURE_COLUMNS].copy()
