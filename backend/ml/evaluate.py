"""
CreditGuard AI - Model Evaluation
Computes classification metrics prioritized for imbalanced fraud detection.
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    precision_recall_curve,
    roc_curve,
)


def evaluate_model(y_true, y_score, threshold: float = 0.5) -> dict:
    """
    Compute full evaluation metrics for a binary classifier.

    Args:
        y_true: Ground truth labels (0/1).
        y_score: Model probability scores for the positive class.
        threshold: Decision threshold to convert scores to labels.

    Returns:
        dict of all metrics.
    """
    y_pred = (y_score >= threshold).astype(int)

    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()

    precision, recall, pr_thresholds = precision_recall_curve(y_true, y_score)
    fpr, tpr, roc_thresholds = roc_curve(y_true, y_score)

    metrics = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1_score": float(f1_score(y_true, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, y_score)),
        "pr_auc": float(average_precision_score(y_true, y_score)),
        "confusion_matrix": {
            "tn": int(tn), "fp": int(fp),
            "fn": int(fn), "tp": int(tp)
        },
        "false_positive_rate": float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0,
        "threshold": float(threshold),
        "precision_recall_curve": {
            "precision": precision.tolist(),
            "recall": recall.tolist(),
            "thresholds": pr_thresholds.tolist(),
        },
        "roc_curve": {
            "fpr": fpr.tolist(),
            "tpr": tpr.tolist(),
            "thresholds": roc_thresholds.tolist(),
        }
    }
    return metrics


def find_optimal_threshold(y_true, y_score, beta: float = 2.0) -> float:
    """
    Find threshold that maximizes F-beta score on validation data.
    beta=2 weights recall twice as much as precision (important for fraud detection).

    Args:
        y_true: Ground truth labels.
        y_score: Model probability scores.
        beta: Beta parameter for F-beta score.

    Returns:
        Optimal threshold value.
    """
    precision, recall, thresholds = precision_recall_curve(y_true, y_score)

    # Avoid division by zero
    denom = (beta**2 * precision + recall)
    denom = np.where(denom == 0, 1e-10, denom)
    fbeta = (1 + beta**2) * precision * recall / denom

    # Exclude last element (which has no corresponding threshold)
    if len(thresholds) > 0:
        best_idx = np.argmax(fbeta[:-1])
        best_threshold = float(thresholds[best_idx])
    else:
        best_threshold = 0.5

    return best_threshold


def print_metrics_report(metrics: dict, model_name: str = "Model"):
    """Pretty-print evaluation metrics."""
    cm = metrics["confusion_matrix"]
    print(f"\n{'='*50}")
    print(f"  {model_name} Evaluation Report")
    print(f"{'='*50}")
    print(f"  Threshold:   {metrics['threshold']:.4f}")
    print(f"  Accuracy:    {metrics['accuracy']:.4f}")
    print(f"  Precision:   {metrics['precision']:.4f}")
    print(f"  Recall:      {metrics['recall']:.4f}")
    print(f"  F1 Score:    {metrics['f1_score']:.4f}")
    print(f"  ROC-AUC:     {metrics['roc_auc']:.4f}")
    print(f"  PR-AUC:      {metrics['pr_auc']:.4f}")
    print(f"  False Pos Rate: {metrics['false_positive_rate']:.4f}")
    print(f"\n  Confusion Matrix:")
    print(f"    TN={cm['tn']:6d}  FP={cm['fp']:6d}")
    print(f"    FN={cm['fn']:6d}  TP={cm['tp']:6d}")
    print(f"{'='*50}\n")
