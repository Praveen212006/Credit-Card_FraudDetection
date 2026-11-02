"""
CreditGuard AI - Backend Tests
Tests for API endpoints, model loading, and prediction logic.
"""

import pytest
import pandas as pd
import numpy as np
import os
import sys

# Ensure the backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from app.services.model_service import model_service
from app.services.dataset_service import dataset_service

# Ensure DB and services are loaded for test client
init_db()
model_service.load()
dataset_service.load()

client = TestClient(app)

SAMPLE_TRANSACTION = {
    "Time": 406.0, "Amount": 149.62,
    "V1": -1.3598071336738, "V2": -0.0727811733098497, "V3": 2.53634673796914,
    "V4": 1.37815522427443, "V5": -0.338320769942518, "V6": 0.462387777762292,
    "V7": 0.239598554061257, "V8": 0.0986979012610507, "V9": 0.363786969611213,
    "V10": 0.0907941719789316, "V11": -0.551599533260813, "V12": -0.617800855762348,
    "V13": -0.991389847235408, "V14": -0.311169353699879, "V15": 1.46817697209427,
    "V16": -0.470400525259478, "V17": 0.207971241929242, "V18": 0.0257905801985591,
    "V19": 0.403992960255733, "V20": 0.251412098239705, "V21": -0.018306777944153,
    "V22": 0.277837575558899, "V23": -0.110473910188767, "V24": 0.0669280749146731,
    "V25": 0.128539358273528, "V26": -0.189114843888824, "V27": 0.133558376740387,
    "V28": -0.0210530534538215,
}


class TestHealth:
    def test_health_endpoint(self):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "ok"
        assert "model_loaded" in data
        assert "dataset_loaded" in data


class TestDashboard:
    def test_dashboard_overview(self):
        response = client.get("/api/dashboard/overview")
        assert response.status_code == 200
        data = response.json()
        assert "dataset" in data
        assert "model" in data

    def test_dashboard_has_dataset_counts(self):
        response = client.get("/api/dashboard/overview")
        data = response.json()
        dataset = data["dataset"]
        assert "total_records" in dataset
        assert "fraud_count" in dataset
        assert "legitimate_count" in dataset


class TestDataset:
    def test_dataset_overview(self):
        response = client.get("/api/dataset/overview")
        assert response.status_code in [200, 503]
        if response.status_code == 200:
            data = response.json()
            assert "total_records" in data

    def test_dataset_records_pagination(self):
        response = client.get("/api/dataset/records?page=1&page_size=10")
        assert response.status_code in [200, 503]
        if response.status_code == 200:
            data = response.json()
            assert "records" in data
            assert len(data["records"]) <= 10

    def test_dataset_distribution(self):
        response = client.get("/api/dataset/distribution")
        assert response.status_code in [200, 503]


class TestModel:
    def test_model_info(self):
        response = client.get("/api/model/info")
        assert response.status_code in [200, 503]

    def test_model_metrics(self):
        response = client.get("/api/model/metrics")
        assert response.status_code in [200, 503]
        if response.status_code == 200:
            data = response.json()
            assert "recall" in data
            assert "pr_auc" in data

    def test_feature_importance(self):
        response = client.get("/api/model/features")
        assert response.status_code in [200, 503]


class TestPrediction:
    def test_single_prediction_valid(self):
        response = client.post("/api/predict", json=SAMPLE_TRANSACTION)
        assert response.status_code in [200, 503]
        if response.status_code == 200:
            data = response.json()
            assert "prediction" in data
            assert data["prediction"] in ["legitimate", "fraud"]
            assert "fraud_score" in data
            assert 0.0 <= data["fraud_score"] <= 1.0
            assert "decision_threshold" in data
            assert "transaction_reference" in data

    def test_single_prediction_invalid_amount(self):
        invalid_txn = SAMPLE_TRANSACTION.copy()
        invalid_txn["Amount"] = -50.0  # Negative amount
        response = client.post("/api/predict", json=invalid_txn)
        assert response.status_code == 422

    def test_single_prediction_missing_field(self):
        incomplete = {k: v for k, v in SAMPLE_TRANSACTION.items() if k != "V1"}
        response = client.post("/api/predict", json=incomplete)
        assert response.status_code == 422

    def test_batch_prediction_valid_csv(self):
        csv_content = "Time,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27,V28,Amount\n"
        vals = [str(SAMPLE_TRANSACTION.get(f"V{i}", 0.0)) for i in range(1, 29)]
        csv_content += f"406.0,{','.join(vals)},149.62\n"

        response = client.post(
            "/api/predict/batch",
            files={"file": ("test.csv", csv_content.encode(), "text/csv")},
        )
        assert response.status_code in [200, 503]
        if response.status_code == 200:
            data = response.json()
            assert "total_records" in data
            assert "fraud_count" in data
            assert "predictions" in data

    def test_batch_prediction_wrong_extension(self):
        response = client.post(
            "/api/predict/batch",
            files={"file": ("test.xlsx", b"data", "application/octet-stream")},
        )
        assert response.status_code == 400

    def test_batch_prediction_missing_columns(self):
        csv_content = "Time,Amount\n406.0,149.62\n"
        response = client.post(
            "/api/predict/batch",
            files={"file": ("test.csv", csv_content.encode(), "text/csv")},
        )
        assert response.status_code == 422


class TestHistory:
    def test_prediction_history(self):
        response = client.get("/api/predictions/history")
        assert response.status_code == 200
        data = response.json()
        assert "predictions" in data
        assert "total" in data
        assert "page" in data

    def test_history_pagination(self):
        response = client.get("/api/predictions/history?page=1&page_size=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["predictions"]) <= 5

    def test_prediction_not_found(self):
        response = client.get("/api/predictions/999999")
        assert response.status_code == 404
