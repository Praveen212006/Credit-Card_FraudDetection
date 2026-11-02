# CreditGuard AI

> **Intelligent Financial Fraud Detection & Analytics Platform**  
> *A production-grade machine learning system built with FastAPI, Scikit-learn, React 19, and the Premium Organic SaaS design system.*

---

## 📌 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Machine Learning Model & Empirical Benchmarks](#-machine-learning-model--empirical-benchmarks)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
  - [1. Backend Setup (FastAPI & ML)](#1-backend-setup-fastapi--ml)
  - [2. Frontend Setup (React & Vite)](#2-frontend-setup-react--vite)
- [Running the Application](#-running-the-application)
- [Model Training & Evaluation Pipeline](#-model-training--evaluation-pipeline)
- [API Reference](#-api-reference)
- [Running Automated Tests](#-running-automated-tests)
- [Platform Features & Pages](#-platform-features--pages)
- [Design System](#-design-system)

---

## 🛡️ Overview

**CreditGuard AI** is an end-to-end financial intelligence platform that detects and analyzes fraudulent credit card transactions in real time. It addresses the challenge of **extreme class imbalance** (0.173% fraud rate) using cost-sensitive ensemble machine learning, robust evaluation metrics (PR-AUC, Recall), and an asynchronous REST API paired with a high-performance React dashboard.

Key capabilities:
- **Real-Time Risk Scoring**: Sub-second fraud probability calculation with calibrated decision thresholds.
- **Batch CSV Analysis**: Drag-and-drop processing for up to 10,000 transactions per run with downloadable summaries.
- **Dataset Intelligence**: Paginated explorer over 284,807 transactions with cohort amount statistics and feature correlation heatmaps.
- **Model Explainability**: Global Gini feature importance rankings and confusion matrix visualization.
- **Audit Logging**: SQLite-backed prediction history with search, status filtering, and CSV export.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CREDITGUARD AI PLATFORM                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │               Frontend: React 19 + Vite 8               │
       │   Premium Organic SaaS Design System (Vanilla CSS)      │
       │   Recharts Visualizations · Lucide Icons · Axios Client │
       └─────────────────────────────────────────────────────────┘
                                    │
                         HTTP REST  │  JSON / Multipart
                        (Port 5173) │  (Port 8000)
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │             Backend: FastAPI Microservice               │
       │  Uvicorn ASGI · Pydantic v2 Schemas · SQLAlchemy ORM    │
       └─────────────────────────────────────────────────────────┘
                    │                               │
                    ▼                               ▼
       ┌─────────────────────────┐     ┌─────────────────────────┐
       │    Inference Engine     │     │   Persistence Layer     │
       │  Random Forest Pipeline │     │  SQLite Audit Database  │
       │   (Scikit-learn/Joblib) │     │ (Predictions & Metadata)│
       └─────────────────────────┘     └─────────────────────────┘
                    │
                    ▼
       ┌─────────────────────────┐
       │   ULB Credit Card Data  │
       │  284,807 Transactions   │
       │ (30 Features, Imbalanced│
       └─────────────────────────┘
```

---

## 🔬 Machine Learning Model & Empirical Benchmarks

### Dataset Overview
- **Source**: European cardholders credit card dataset (`creditcard.csv`).
- **Total Transactions**: `284,807`
- **Legitimate Transactions**: `284,315` (99.827%)
- **Fraudulent Transactions**: `492` (0.173%)
- **Feature Set**: `Time`, `Amount`, and 28 confidential PCA components (`V1` to `V28`).

### Model Selection
Evaluated using **5-Fold Stratified Cross-Validation** with primary optimization on **PR-AUC (Precision-Recall Area Under Curve)**:

| Algorithm | Validation PR-AUC | Validation ROC-AUC | Recall | Precision | F1-Score | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Random Forest** | **0.8442** | **0.9754** | **79.3%** | **83.5%** | **0.8136** | **Selected Best Model** |
| XGBoost | 0.8315 | 0.9712 | 78.1% | 81.4% | 0.7973 | Evaluated |
| Logistic Regression | 0.7240 | 0.9521 | 62.5% | 85.2% | 0.7210 | Evaluated |
| Decision Tree | 0.6812 | 0.8750 | 76.0% | 71.0% | 0.7342 | Evaluated |

### Test Partition Metrics (42,722 Unseen Transactions)
- **PR-AUC**: `0.8020`
- **ROC-AUC**: `0.9722`
- **Recall (Sensitivity)**: `78.87%` (captured 56 of 71 fraud attacks)
- **Precision**: `82.35%` (only 12 false alarms out of 42,651 legitimate transactions)
- **F1-Score**: `0.8058`
- **Accuracy**: `99.94%`

#### Test Set Confusion Matrix
| Metric | Predicted Legitimate | Predicted Fraud | Total Actual |
| :--- | :---: | :---: | :---: |
| **Actual Legitimate** | **42,639** (True Negative) | **12** (False Positive) | 42,651 |
| **Actual Fraud** | **15** (False Negative) | **56** (True Positive) | 71 |

### Top Predictive Features (Gini Impurity Weight)
1. **`V14`**: 21.03%
2. **`V12`**: 15.00%
3. **`V4`**: 9.37%
4. **`V10`**: 9.23%
5. **`V17`**: 8.37%
6. **`V11`**: 6.60%
7. **`V3`**: 4.71%

---

## 📁 Project Directory Structure

```
CreditGuard-AI/
├── .gitignore                          # Root Git ignore configuration
├── README.md                           # Master project documentation
│
├── backend/                            # FastAPI Application & ML Core
│   ├── requirements.txt                # Python backend dependencies
│   ├── creditguard.db                  # Local SQLite database (auto-generated)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                   # Paths, threshold settings, feature definitions
│   │   ├── database.py                 # SQLAlchemy engine and session factory
│   │   ├── main.py                     # FastAPI app with lifespan loader & CORS
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── prediction.py           # Prediction audit ORM model
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── dashboard.py            # /api/dashboard/overview
│   │   │   ├── dataset.py              # /api/dataset/*
│   │   │   ├── model.py                # /api/model/*
│   │   │   └── prediction.py           # /api/predict, /api/predict/batch, /api/predictions/*
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── dataset.py              # Pydantic schemas for dataset endpoints
│   │   │   ├── model.py                # Pydantic schemas for model metadata
│   │   │   └── transaction.py          # Transaction input & prediction response schemas
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── dataset_service.py      # In-memory dataframe caching & distribution math
│   │       ├── model_service.py        # Model loading, single & batch inference
│   │       └── prediction_service.py   # Prediction persistence & history queries
│   ├── data/
│   │   └── creditcard.csv              # Benchmark dataset (150.8 MB)
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── evaluate.py                 # Metrics computation (PR-AUC, ROC, confusion matrix)
│   │   ├── explain.py                  # Feature importance extraction
│   │   ├── preprocess.py               # Feature schemas, validation & scaling pipelines
│   │   ├── save_best_model.py          # Retrains winning Random Forest & saves artifacts
│   │   └── train.py                    # Multi-model benchmarking script (5-fold CV)
│   ├── models/
│   │   ├── creditguard_pipeline.joblib # Serialized scikit-learn model pipeline
│   │   ├── feature_names.joblib        # Feature column ordering artifact
│   │   └── model_metadata.json         # Complete benchmark metrics and curve data
│   └── tests/
│       ├── __init__.py
│       └── test_api.py                 # 18 comprehensive pytest test cases
│
└── frontend/                           # React 19 + Vite 8 Web Client
    ├── package.json                    # Frontend package dependencies
    ├── vite.config.js                  # Vite configuration
    ├── index.html                      # HTML entrypoint
    ├── src/
    │   ├── main.jsx                    # Application bootstrapping
    │   ├── App.jsx                     # Route definitions & DashboardLayout binding
    │   ├── index.css                   # Premium Organic SaaS CSS tokens & styling
    │   ├── components/
    │   │   ├── Sidebar.jsx             # Navigation sidebar with active indicators
    │   │   └── UI.jsx                  # Reusable KpiCard, ScoreBar, Badge, ChartCard, Pagination
    │   ├── hooks/
    │   │   └── useApi.js               # State hooks for asynchronous requests
    │   ├── layouts/
    │   │   └── DashboardLayout.jsx     # Master layout with sidebar and content wrapper
    │   ├── pages/
    │   │   ├── LandingPage.jsx         # Marketing landing page with hero & platform launch
    │   │   ├── DashboardPage.jsx       # Overview KPIs, Donut chart, Amount chart, Recent audits
    │   │   ├── FraudDetectionPage.jsx  # Single inference with presets & Batch CSV upload
    │   │   ├── DatasetExplorerPage.jsx # Paginated transaction records & correlation heatmap
    │   │   ├── ModelPerformancePage.jsx# Confusion Matrix, PR curve, ROC curve, Feature ranking
    │   │   ├── HistoryPage.jsx         # Audit log table, search, CSV export, detail modal
    │   │   └── AboutPage.jsx           # Architectural overview & technical methodology
    │   ├── services/
    │   │   └── api.js                  # Axios HTTP client with response normalizer
    │   └── utils/
    │       └── helpers.js              # Formatting, risk classifier, and preset samples
```

---

## ⚙️ Prerequisites

- **Python**: Version `3.11+` (tested on Python 3.14)
- **Node.js**: Version `18.0.0+` or `20.0.0+`
- **npm**: Version `9.0.0+`
- **OS**: Windows, macOS, or Linux (Windows PowerShell commands documented below)

---

## 🚀 Installation & Setup

### 1. Backend Setup (FastAPI & ML)

Open a terminal or Windows PowerShell in the project root:

```powershell
# Navigate into the backend directory
cd backend

# Create a virtual environment (optional but recommended)
python -m venv .venv

# Activate the virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
# source .venv/bin/activate

# Install all required Python packages
pip install -r requirements.txt
```

Verify that the dataset is present:
```powershell
# Ensure creditcard.csv exists in backend/data/
Test-Path data/creditcard.csv
```
*(If missing, place `creditcard.csv` in `backend/data/`)*.

---

### 2. Frontend Setup (React & Vite)

Open a separate terminal window:

```powershell
# Navigate into the frontend directory
cd frontend

# Install node dependencies
npm install
```

---

## 🏃 Running the Application

### Start the FastAPI Backend
From `backend/`:

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend URL**: `http://127.0.0.1:8000`
- **Swagger Interactive API Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

### Start the Vite Frontend Development Server
From `frontend/`:

```powershell
npm run dev
```
- **Frontend Web Application**: `http://localhost:5173/`

Open `http://localhost:5173/` in your browser to explore the platform.

---

## 🧠 Model Training & Evaluation Pipeline

The pre-trained winning model artifacts are already included in `backend/models/`. If you want to re-train the models from scratch:

```powershell
cd backend

# Option A: Run multi-model benchmark evaluation across all 4 algorithms:
python ml/train.py

# Option B: Train only the winning Random Forest model and update artifacts:
python ml/save_best_model.py
```

This will automatically:
1. Load `backend/data/creditcard.csv`.
2. Split into 70% Train, 15% Validation, and 15% Stratified Test sets.
3. Fit the Random Forest pipeline with calibrated decision thresholding.
4. Export updated `creditguard_pipeline.joblib`, `feature_names.joblib`, and `model_metadata.json`.

---

## 📡 API Reference

All backend endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, checks whether model and dataset are loaded. |
| `GET` | `/api/dashboard/overview` | Aggregated telemetry, class counts, amount statistics, model status. |
| `GET` | `/api/dataset/overview` | Complete summary metrics of `creditcard.csv`. |
| `GET` | `/api/dataset/records` | Paginated dataset records (`?page=1&page_size=50&class_filter=1`). |
| `GET` | `/api/dataset/distribution` | Histogram & distribution data for amount and time features. |
| `GET` | `/api/dataset/correlation` | Feature correlation matrix relative to fraud class. |
| `GET` | `/api/model/info` | Active model algorithm, version, parameters, and threshold. |
| `GET` | `/api/model/metrics` | Evaluation metrics, confusion matrix, PR curve, and ROC curve points. |
| `GET` | `/api/model/features` | Global Gini feature importance rankings. |
| `POST` | `/api/predict` | Single transaction inference (validates all 30 features). |
| `POST` | `/api/predict/batch` | Multipart CSV upload for batch inference (returns per-row predictions). |
| `GET` | `/api/predictions/history` | Paginated audit trail (`?page=1&page_size=20&search=...&prediction_filter=fraud`). |
| `GET` | `/api/predictions/{id}` | Detailed inspection of a specific past prediction by ID. |
| `GET` | `/api/export/predictions` | Streamed CSV download of all logged predictions. |

---

## 🧪 Running Automated Tests

A comprehensive test suite with 18 automated integration tests verifies the entire backend:

```powershell
cd backend
python -m pytest tests/ -v
```

Expected output:
```
============================= test session starts =============================
tests/test_api.py::TestHealth::test_health_endpoint PASSED               [  5%]
tests/test_api.py::TestDashboard::test_dashboard_overview PASSED         [ 11%]
tests/test_api.py::TestDashboard::test_dashboard_has_dataset_counts PASSED [ 16%]
tests/test_api.py::TestDataset::test_dataset_overview PASSED             [ 22%]
tests/test_api.py::TestDataset::test_dataset_records_pagination PASSED   [ 27%]
tests/test_api.py::TestDataset::test_dataset_distribution PASSED         [ 33%]
tests/test_api.py::TestModel::test_model_info PASSED                     [ 38%]
tests/test_api.py::TestModel::test_model_metrics PASSED                  [ 44%]
tests/test_api.py::TestModel::test_feature_importance PASSED             [ 50%]
tests/test_api.py::TestPrediction::test_single_prediction_valid PASSED   [ 55%]
tests/test_api.py::TestPrediction::test_single_prediction_invalid_amount PASSED [ 61%]
tests/test_api.py::TestPrediction::test_single_prediction_missing_field PASSED [ 66%]
tests/test_api.py::TestPrediction::test_batch_prediction_valid_csv PASSED [ 72%]
tests/test_api.py::TestPrediction::test_batch_prediction_wrong_extension PASSED [ 77%]
tests/test_api.py::TestPrediction::test_batch_prediction_missing_columns PASSED [ 83%]
tests/test_api.py::TestHistory::test_prediction_history PASSED           [ 88%]
tests/test_api.py::TestHistory::test_history_pagination PASSED           [ 94%]
tests/test_api.py::TestHistory::test_prediction_not_found PASSED         [100%]

====================== 18 passed in 12.70s ======================
```

To test the frontend production bundle:
```powershell
cd frontend
npm run build
```

---

## 💻 Platform Features & Pages

| Route | Page | Key Functionality |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Platform overview, verified dataset stats, architecture pillars, and Launch CTA. |
| `/dashboard` | **Analytics Dashboard** | Live telemetry KPIs, Class Imbalance Donut Chart with `minAngle` emphasis, Transaction Amount comparison, and Recent Predictions table. |
| `/detection` | **Fraud Detection** | **Single Prediction**: Form with one-click presets (*Legitimate*, *Fraud*, *Borderline*), real-time risk gauges, and decision thresholds.<br>**Batch CSV**: Drag-and-drop CSV processing, sample CSV template download, and downloadable batch results. |
| `/dataset` | **Dataset Explorer** | Paginated table of all 284,807 transactions with class filtering (`All`, `Legit`, `Fraud`), amount distribution cohorts, and feature correlations. |
| `/model` | **Model Performance** | Empirical metrics (PR-AUC, ROC-AUC, Recall), interactive Confusion Matrix, Precision-Recall curve, ROC curve, and Top 10 feature importances. |
| `/history` | **Prediction History** | Searchable audit trail of evaluated transactions, status filters, full detail inspection modal, and CSV export. |
| `/about` | **About Platform** | Technical disclosures, extreme class imbalance methodology, PCA privacy preservation details, and real-time backend health monitor. |

---

## 🎨 Design System

CreditGuard AI is styled with a **Premium Organic SaaS** aesthetic:
- **Background**: Soft warm cream (`#FDFBF7`) paired with clean white cards (`#FFFFFF`).
- **Forest Green Primary**: `#2D5A43` / `#397B5D` for positive states, primary actions, and legitimate transactions.
- **Coral Terracotta**: `#CC5B54` for fraud indicators, alert badges, and high-risk gauges.
- **Typography**: Playfair Display (headings), Outfit (body text), and JetBrains Mono (numerical telemetry and transaction IDs).
- **Interactions**: Subtle elevation shadows, smooth state transitions, and responsive mobile-first layouts.

---

## 📄 License & Attribution

- **Dataset**: Machine Learning Group - ULB (*Université Libre de Bruxelles*), Andrea Dal Pozzolo, Olivier Caelen, Reid A. Johnson, and Gianluca Bontempi.
- **Platform Architecture**: CreditGuard AI.
#   C r e d i t - C a r d _ F r a u d D e t e c t i o n  
 