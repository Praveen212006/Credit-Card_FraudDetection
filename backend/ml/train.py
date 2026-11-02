"""
CreditGuard AI - Complete ML Training Pipeline
Trains, evaluates, and saves the best fraud detection model.

Run from backend/ directory:
    python ml/train.py
"""

import os
import sys
import json
import time
import warnings
import numpy as np
import pandas as pd
import joblib

warnings.filterwarnings("ignore")

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.preprocess import (
    load_and_prepare_data, build_preprocessor,
    get_transformed_feature_names, FEATURE_COLUMNS
)
from ml.evaluate import evaluate_model, find_optimal_threshold, print_metrics_report
from ml.explain import get_feature_importance_rf, get_feature_importance_lr

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from imblearn.ensemble import BalancedRandomForestClassifier

# ─────────────────────────────────────────────
#  Configuration
# ─────────────────────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "creditcard.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
RANDOM_STATE = 42

os.makedirs(MODEL_DIR, exist_ok=True)


def main():
    start_time = time.time()
    print("\n" + "="*60)
    print("  CreditGuard AI - ML Training Pipeline")
    print("="*60)

    # ─────────────────────────────────────────────
    #  PHASE 1: Load & Split Data
    # ─────────────────────────────────────────────
    print("\n[Phase 1] Loading and splitting dataset...")
    X, y, df_raw = load_and_prepare_data(DATA_PATH)

    print(f"  Total samples:      {len(X):,}")
    print(f"  Legitimate (0):     {(y==0).sum():,} ({(y==0).mean()*100:.3f}%)")
    print(f"  Fraudulent (1):     {(y==1).sum():,} ({(y==1).mean()*100:.3f}%)")

    # Stratified 70/15/15 split
    X_trainval, X_test, y_trainval, y_test = train_test_split(
        X, y, test_size=0.15, random_state=RANDOM_STATE, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_trainval, y_trainval, test_size=0.15/0.85,
        random_state=RANDOM_STATE, stratify=y_trainval
    )

    print(f"\n  Train set:          {len(X_train):,} ({y_train.mean()*100:.3f}% fraud)")
    print(f"  Validation set:     {len(X_val):,} ({y_val.mean()*100:.3f}% fraud)")
    print(f"  Test set:           {len(X_test):,} ({y_test.mean()*100:.3f}% fraud)")

    # ─────────────────────────────────────────────
    #  PHASE 2: Build Preprocessing + Models
    # ─────────────────────────────────────────────
    print("\n[Phase 2] Defining models...")

    preprocessor = build_preprocessor()

    models = {
        "Logistic Regression": Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", LogisticRegression(
                class_weight="balanced",
                max_iter=1000,
                solver="lbfgs",
                C=0.1,
                random_state=RANDOM_STATE
            ))
        ]),
        "Random Forest": Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", RandomForestClassifier(
                n_estimators=100,
                class_weight="balanced",
                max_depth=12,
                min_samples_leaf=2,
                random_state=RANDOM_STATE,
                n_jobs=-1
            ))
        ]),
        "Balanced Random Forest": Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", BalancedRandomForestClassifier(
                n_estimators=100,
                max_depth=12,
                min_samples_leaf=2,
                random_state=RANDOM_STATE,
                n_jobs=-1,
                replacement=True,
                sampling_strategy="auto"
            ))
        ]),
        "Gradient Boosting": Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", GradientBoostingClassifier(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                subsample=0.8,
                random_state=RANDOM_STATE
            ))
        ]),
    }

    # ─────────────────────────────────────────────
    #  PHASE 3: Train & Validate All Models
    # ─────────────────────────────────────────────
    print("\n[Phase 3] Training and evaluating models on validation set...")

    val_results = {}

    for name, pipeline in models.items():
        print(f"\n  Training: {name}...")
        t0 = time.time()
        pipeline.fit(X_train, y_train)
        elapsed = time.time() - t0
        print(f"    Training time: {elapsed:.1f}s")

        # Get probability scores
        y_val_score = pipeline.predict_proba(X_val)[:, 1]

        # Find optimal threshold on validation data
        opt_threshold = find_optimal_threshold(y_val, y_val_score, beta=2.0)
        print(f"    Optimal threshold: {opt_threshold:.4f}")

        # Evaluate with optimized threshold
        val_metrics = evaluate_model(y_val, y_val_score, threshold=opt_threshold)
        val_results[name] = {
            "pipeline": pipeline,
            "threshold": opt_threshold,
            "metrics": val_metrics,
            "train_time": elapsed,
        }
        print_metrics_report(val_metrics, model_name=f"{name} [VAL]")

    # ─────────────────────────────────────────────
    #  PHASE 4: Select Best Model (by PR-AUC on val)
    # ─────────────────────────────────────────────
    print("\n[Phase 4] Selecting best model by Validation PR-AUC...")

    best_name = max(val_results.keys(),
                    key=lambda n: val_results[n]["metrics"]["pr_auc"])
    best_result = val_results[best_name]
    best_pipeline = best_result["pipeline"]
    best_threshold = best_result["threshold"]

    print(f"\n  [BEST] Model: {best_name}")
    print(f"    Validation PR-AUC: {best_result['metrics']['pr_auc']:.4f}")
    print(f"    Validation Recall: {best_result['metrics']['recall']:.4f}")

    # ─────────────────────────────────────────────
    #  PHASE 5: Final Evaluation on Held-out Test Set
    # ─────────────────────────────────────────────
    print("\n[Phase 5] Final evaluation on held-out test set...")

    y_test_score = best_pipeline.predict_proba(X_test)[:, 1]
    test_metrics = evaluate_model(y_test, y_test_score, threshold=best_threshold)
    print_metrics_report(test_metrics, model_name=f"{best_name} [TEST]")

    # ─────────────────────────────────────────────
    #  PHASE 6: Collect All Model Comparison Metrics
    # ─────────────────────────────────────────────
    print("\n[Phase 6] Computing comparison metrics for all models on test set...")

    all_model_metrics = {}
    for name, result in val_results.items():
        pipeline = result["pipeline"]
        threshold = result["threshold"]
        y_score = pipeline.predict_proba(X_test)[:, 1]
        metrics = evaluate_model(y_test, y_score, threshold=threshold)
        all_model_metrics[name] = {
            "pr_auc": metrics["pr_auc"],
            "roc_auc": metrics["roc_auc"],
            "recall": metrics["recall"],
            "precision": metrics["precision"],
            "f1_score": metrics["f1_score"],
            "threshold": threshold,
            "train_time_seconds": result["train_time"],
        }

    # ─────────────────────────────────────────────
    #  PHASE 7: Feature Importance
    # ─────────────────────────────────────────────
    print("\n[Phase 7] Computing feature importance...")

    classifier = best_pipeline.named_steps["classifier"]
    transformed_features = get_transformed_feature_names()

    # Handle BalancedRandomForest which may wrap estimators differently
    actual_clf = classifier
    if hasattr(classifier, "estimators_"):
        # It's a forest-type model
        feature_importance = get_feature_importance_rf(classifier, transformed_features)
        importance_type = "tree_based"
    elif hasattr(classifier, "coef_"):
        feature_importance = get_feature_importance_lr(classifier, transformed_features)
        importance_type = "linear_coefficient"
    else:
        feature_importance = []
        importance_type = "unknown"

    print(f"    Top 5 features:")
    for fi in feature_importance[:5]:
        print(f"      {fi['feature']}: {fi['importance']:.6f}")

    # ─────────────────────────────────────────────
    #  PHASE 8: Save Everything
    # ─────────────────────────────────────────────
    print("\n[Phase 8] Saving model artifacts...")

    # 1. Save the full pipeline (preprocessor + model)
    pipeline_path = os.path.join(MODEL_DIR, "creditguard_pipeline.joblib")
    joblib.dump(best_pipeline, pipeline_path)
    print(f"  [SAVED] Pipeline: {pipeline_path}")

    # 2. Save feature names
    feature_names_path = os.path.join(MODEL_DIR, "feature_names.joblib")
    joblib.dump(FEATURE_COLUMNS, feature_names_path)
    print(f"  [SAVED] Feature names: {feature_names_path}")

    # 3. Save complete model metadata
    metadata = {
        "model_name": best_name,
        "model_version": "1.0.0",
        "algorithm": best_name,
        "decision_threshold": best_threshold,
        "feature_columns": FEATURE_COLUMNS,
        "transformed_feature_names": transformed_features,
        "importance_type": importance_type,
        "feature_importance": feature_importance,
        "test_metrics": test_metrics,
        "validation_metrics": {
            name: r["metrics"] for name, r in val_results.items()
        },
        "all_model_comparison": all_model_metrics,
        "training_info": {
            "total_samples": int(len(X)),
            "train_samples": int(len(X_train)),
            "val_samples": int(len(X_val)),
            "test_samples": int(len(X_test)),
            "legitimate_count": int((y==0).sum()),
            "fraud_count": int((y==1).sum()),
            "fraud_rate": float(y.mean()),
            "random_state": RANDOM_STATE,
            "training_time_seconds": float(val_results[best_name]["train_time"]),
            "total_pipeline_time_seconds": float(time.time() - start_time),
        },
        "dataset_info": {
            "filename": "creditcard.csv",
            "total_records_raw": 284807,
            "total_records_after_dedup": int(len(X)),
            "duplicates_removed": int(284807 - len(X)),
            "n_features": len(FEATURE_COLUMNS),
            "amount_mean": float(df_raw["Amount"].mean()),
            "amount_std": float(df_raw["Amount"].std()),
            "amount_max": float(df_raw["Amount"].max()),
            "time_max": float(df_raw["Time"].max()),
        }
    }

    metadata_path = os.path.join(MODEL_DIR, "model_metadata.json")
    with open(metadata_path, "w") as f:
        # Need to handle numpy types and curve data (too large for JSON display)
        meta_save = {k: v for k, v in metadata.items()}
        # Truncate curve data to save space (keep 200 points)
        if "test_metrics" in meta_save:
            for curve_key in ["precision_recall_curve", "roc_curve"]:
                if curve_key in meta_save["test_metrics"]:
                    curve = meta_save["test_metrics"][curve_key]
                    n = len(curve.get("precision", curve.get("fpr", [])))
                    if n > 200:
                        indices = np.linspace(0, n-1, 200, dtype=int).tolist()
                        if curve_key == "precision_recall_curve":
                            meta_save["test_metrics"][curve_key] = {
                                "precision": [curve["precision"][i] for i in indices],
                                "recall": [curve["recall"][i] for i in indices],
                                "thresholds": [curve["thresholds"][min(i, len(curve["thresholds"])-1)] for i in indices],
                            }
                        else:
                            meta_save["test_metrics"][curve_key] = {
                                "fpr": [curve["fpr"][i] for i in indices],
                                "tpr": [curve["tpr"][i] for i in indices],
                                "thresholds": [curve["thresholds"][min(i, len(curve["thresholds"])-1)] for i in indices],
                            }
        json.dump(meta_save, f, indent=2, default=str)

    print(f"  [SAVED] Metadata: {metadata_path}")

    total_time = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"  Training pipeline complete in {total_time:.1f}s")
    print(f"  Best Model:   {best_name}")
    print(f"  Test PR-AUC:  {test_metrics['pr_auc']:.4f}")
    print(f"  Test Recall:  {test_metrics['recall']:.4f}")
    print(f"  Test ROC-AUC: {test_metrics['roc_auc']:.4f}")
    print(f"{'='*60}\n")

    return metadata


if __name__ == "__main__":
    main()
