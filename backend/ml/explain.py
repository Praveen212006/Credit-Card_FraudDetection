"""
CreditGuard AI - Model Explainability
Feature importance extraction and SHAP-based explanation support.
"""

import numpy as np
import pandas as pd
from typing import Optional


def get_feature_importance_rf(model, feature_names: list) -> list:
    """
    Extract feature importances from a tree-based model (RandomForest, GBM).

    Returns:
        List of dicts sorted by importance descending.
    """
    importances = model.feature_importances_
    result = sorted(
        [{"feature": f, "importance": float(i)}
         for f, i in zip(feature_names, importances)],
        key=lambda x: x["importance"],
        reverse=True
    )
    return result


def get_feature_importance_lr(model, feature_names: list) -> list:
    """
    Extract feature importances from Logistic Regression (absolute coefficients).
    """
    coefficients = model.coef_[0]
    abs_coef = np.abs(coefficients)
    result = sorted(
        [{"feature": f, "importance": float(i)}
         for f, i in zip(feature_names, abs_coef)],
        key=lambda x: x["importance"],
        reverse=True
    )
    return result


def get_shap_values_for_instance(model, preprocessor, X_instance: pd.DataFrame,
                                  feature_names: list,
                                  model_type: str = "tree") -> Optional[list]:
    """
    Compute SHAP values for a single transaction instance.

    Args:
        model: Trained sklearn model.
        preprocessor: Fitted ColumnTransformer.
        X_instance: Single-row DataFrame with raw features.
        feature_names: Names of features after transformation.
        model_type: "tree" for tree-based, "linear" for linear models.

    Returns:
        List of dicts with feature name and SHAP value, or None if SHAP fails.
    """
    try:
        import shap

        X_transformed = preprocessor.transform(X_instance)

        if model_type == "tree":
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(X_transformed)
            # For binary classification, take values for class 1
            if isinstance(shap_values, list):
                values = shap_values[1][0]
            else:
                values = shap_values[0]
        else:
            # Linear explainer for LR
            explainer = shap.LinearExplainer(model, X_transformed)
            shap_values = explainer.shap_values(X_transformed)
            values = shap_values[0]

        result = sorted(
            [{"feature": f, "shap_value": float(v), "abs_value": abs(float(v))}
             for f, v in zip(feature_names, values)],
            key=lambda x: x["abs_value"],
            reverse=True
        )
        return result[:15]  # Return top 15 contributing features

    except Exception as e:
        print(f"SHAP computation failed: {e}")
        return None


def get_top_contributing_features(shap_results: Optional[list],
                                   importance_results: list,
                                   n: int = 10) -> list:
    """
    Return top N feature contributions. Uses SHAP if available,
    falls back to global feature importance.
    """
    if shap_results:
        return shap_results[:n]
    return importance_results[:n]
