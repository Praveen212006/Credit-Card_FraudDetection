"""
Save-only script: re-runs ONLY the save phase using the best model.
Random Forest had best PR-AUC (0.8442) on validation set.
Run: python ml/save_best_model.py
"""
import os, sys, json, time, warnings
import numpy as np, pandas as pd, joblib

warnings.filterwarnings("ignore")
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.preprocess import load_and_prepare_data, build_preprocessor, get_transformed_feature_names, FEATURE_COLUMNS
from ml.evaluate import evaluate_model, find_optimal_threshold, print_metrics_report
from ml.explain import get_feature_importance_rf

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "creditcard.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
RANDOM_STATE = 42
os.makedirs(MODEL_DIR, exist_ok=True)

print("Loading data...")
X, y, df_raw = load_and_prepare_data(DATA_PATH)

X_trainval, X_test, y_trainval, y_test = train_test_split(
    X, y, test_size=0.15, random_state=RANDOM_STATE, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_trainval, y_trainval, test_size=0.15/0.85, random_state=RANDOM_STATE, stratify=y_trainval
)

print(f"Train: {len(X_train):,}  Val: {len(X_val):,}  Test: {len(X_test):,}")
print("Training Random Forest (best model by val PR-AUC)...")

t0 = time.time()
preprocessor = build_preprocessor()
best_pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(
        n_estimators=100, class_weight="balanced",
        max_depth=12, min_samples_leaf=2,
        random_state=RANDOM_STATE, n_jobs=-1
    ))
])
best_pipeline.fit(X_train, y_train)
train_time = time.time() - t0
print(f"Training done in {train_time:.1f}s")

y_val_score = best_pipeline.predict_proba(X_val)[:, 1]
opt_threshold = find_optimal_threshold(y_val, y_val_score, beta=2.0)
print(f"Optimal threshold: {opt_threshold:.4f}")

y_test_score = best_pipeline.predict_proba(X_test)[:, 1]
test_metrics = evaluate_model(y_test, y_test_score, threshold=opt_threshold)
print_metrics_report(test_metrics, "Random Forest [TEST]")

# Feature importance
classifier = best_pipeline.named_steps["classifier"]
transformed_features = get_transformed_feature_names()
feature_importance = get_feature_importance_rf(classifier, transformed_features)

# Model comparison (from earlier training run)
all_model_comparison = {
    "Logistic Regression": {"pr_auc": 0.7246, "roc_auc": 0.9765, "recall": 0.8169, "precision": 0.7532, "f1_score": 0.7838, "threshold": 0.9999, "train_time_seconds": 1.4},
    "Random Forest":        {"pr_auc": 0.8442, "roc_auc": 0.9775, "recall": 0.8451, "precision": 0.8451, "f1_score": 0.8451, "threshold": opt_threshold, "train_time_seconds": train_time},
    "Balanced Random Forest":{"pr_auc": 0.7219, "roc_auc": 0.9792, "recall": 0.8310, "precision": 0.7973, "f1_score": 0.8138, "threshold": 0.9300, "train_time_seconds": 4.6},
    "Gradient Boosting":    {"pr_auc": 0.5741, "roc_auc": 0.7941, "recall": 0.6479, "precision": 0.8070, "f1_score": 0.7188, "threshold": 0.0393, "train_time_seconds": 518.6},
}

# Save pipeline
pipeline_path = os.path.join(MODEL_DIR, "creditguard_pipeline.joblib")
joblib.dump(best_pipeline, pipeline_path)
print(f"[SAVED] Pipeline -> {pipeline_path}")

feature_names_path = os.path.join(MODEL_DIR, "feature_names.joblib")
joblib.dump(FEATURE_COLUMNS, feature_names_path)
print(f"[SAVED] Feature names -> {feature_names_path}")

# Truncate curves
def trunc(lst, n=200):
    if len(lst) <= n: return lst
    step = max(1, len(lst)//n)
    return lst[::step]

pr = test_metrics.get("precision_recall_curve", {})
roc = test_metrics.get("roc_curve", {})
test_metrics["precision_recall_curve"] = {
    "precision": trunc(pr.get("precision",[])),
    "recall": trunc(pr.get("recall",[])),
    "thresholds": trunc(pr.get("thresholds",[])),
}
test_metrics["roc_curve"] = {
    "fpr": trunc(roc.get("fpr",[])),
    "tpr": trunc(roc.get("tpr",[])),
    "thresholds": trunc(roc.get("thresholds",[])),
}

metadata = {
    "model_name": "Random Forest",
    "model_version": "1.0.0",
    "algorithm": "Random Forest",
    "decision_threshold": float(opt_threshold),
    "feature_columns": FEATURE_COLUMNS,
    "transformed_feature_names": transformed_features,
    "importance_type": "tree_based",
    "feature_importance": feature_importance,
    "test_metrics": test_metrics,
    "all_model_comparison": all_model_comparison,
    "training_info": {
        "total_samples": int(len(X)),
        "train_samples": int(len(X_train)),
        "val_samples": int(len(X_val)),
        "test_samples": int(len(X_test)),
        "legitimate_count": int((y==0).sum()),
        "fraud_count": int((y==1).sum()),
        "fraud_rate": float(y.mean()),
        "random_state": RANDOM_STATE,
        "training_time_seconds": float(train_time),
        "total_pipeline_time_seconds": float(time.time() - t0),
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
with open(metadata_path, "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2, default=str)
print(f"[SAVED] Metadata -> {metadata_path}")

print("\n=== TRAINING COMPLETE ===")
print(f"  Model:    Random Forest")
print(f"  Threshold:{opt_threshold:.4f}")
print(f"  PR-AUC:   {test_metrics['pr_auc']:.4f}")
print(f"  Recall:   {test_metrics['recall']:.4f}")
print(f"  ROC-AUC:  {test_metrics['roc_auc']:.4f}")
