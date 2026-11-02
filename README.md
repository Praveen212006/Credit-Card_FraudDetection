# 🛡️ CreditGuard AI
### Intelligent Financial Fraud Detection & Analytics Platform

> **Detect the Unusual. Protect Every Transaction.**
>
> A machine learning-powered credit card fraud detection platform built using FastAPI, Scikit-learn, React 19, and the Premium Organic SaaS design system.

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [System Architecture](#-system-architecture)
4. [Dataset Information](#-dataset-information)
5. [Machine Learning Model & Benchmarks](#-machine-learning-model--benchmarks)
6. [Project Directory Structure](#-project-directory-structure)
7. [Technology Stack](#-technology-stack)
8. [Prerequisites](#-prerequisites)
9. [Installation & Setup](#-installation--setup)
10. [Running the Application](#-running-the-application)
11. [Model Training & Evaluation](#-model-training--evaluation)
12. [API Reference](#-api-reference)
13. [Application Pages](#-application-pages)
14. [Testing](#-testing)
15. [Design System](#-design-system)
16. [Security & Privacy](#-security--privacy)
17. [Future Enhancements](#-future-enhancements)
18. [License & Attribution](#-license--attribution)

---

## 🛡️ Project Overview

**CreditGuard AI** is an end-to-end financial intelligence platform designed to detect and analyze potentially fraudulent credit card transactions using machine learning.

Credit card fraud is a major challenge in digital financial transactions. Traditional rule-based approaches may struggle to identify complex and unusual transaction patterns.

CreditGuard AI addresses this challenge through supervised machine learning algorithms, cost-sensitive model training, fraud risk scoring, and interactive transaction analytics.

The platform combines a Python-based machine learning engine, FastAPI backend, and React frontend to deliver an integrated fraud detection experience.

### Main Objectives

- Detect potentially fraudulent credit card transactions.
- Develop an effective machine learning classification model.
- Handle highly imbalanced transaction datasets.
- Provide real-time transaction predictions.
- Support batch CSV transaction analysis.
- Visualize fraud patterns and model performance.
- Maintain a searchable transaction audit history.
- Provide understandable model feature importance.

### Platform Highlights

- **Real-Time Risk Scoring:** Generate transaction fraud scores using the trained ML pipeline.
- **Batch CSV Analysis:** Upload and process multiple transactions with downloadable prediction results.
- **Dataset Intelligence:** Explore 284,807 transactions through interactive analytics.
- **Model Explainability:** Understand important predictive features through feature importance analysis.
- **Audit Logging:** Store prediction metadata using SQLite.
- **Interactive Dashboard:** Monitor dataset statistics, fraud rates, and model performance.

---

## 🏗️ System Architecture

CreditGuard AI follows a modular architecture that separates the frontend, backend, machine learning engine, and persistence layer.

```text
                    CREDITGUARD AI
                           |
                           |
              React 19 + Vite Frontend
                           |
                  HTTP REST / JSON
                           |
                           |
                  FastAPI Backend
                           |
               +-----------+-----------+
               |                       |
               |                       |
        ML Inference Engine       Database Layer
               |                       |
        Scikit-learn Model           SQLite
               |
             Joblib
               |
         creditcard.csv
```

### Architecture Components

**1. Frontend – React + Vite**

Responsible for:
- User interface.
- Dashboard analytics.
- Transaction prediction forms.
- Batch CSV uploads.
- Dataset exploration.
- Model performance visualization.
- Prediction history.

**2. Backend – FastAPI**

Responsible for:
- REST API endpoints.
- Request validation.
- Model inference.
- Dataset processing.
- Batch predictions.
- Database operations.
- Prediction history.

**3. Machine Learning Engine**

Responsible for:
- Data preprocessing.
- Model training.
- Model evaluation.
- Feature importance.
- Fraud risk prediction.

**4. Persistence Layer**

SQLite stores prediction history and relevant transaction analysis metadata.

---

## 📊 Dataset Information

**Dataset:** European Credit Card Fraud Detection Dataset

**Source:** ULB / Worldline

**Dataset File:** `creditcard.csv`

The dataset contains anonymized credit card transactions made by European cardholders.

### Dataset Statistics

| Property | Value |
|---|---:|
| Total Transactions | 284,807 |
| Total Columns | 31 |
| Input Features | 30 |
| Legitimate Transactions | 284,315 |
| Fraudulent Transactions | 492 |
| Fraud Percentage | 0.173% |
| Legitimate Percentage | 99.827% |
| Target Variable | Class |

### Dataset Features

| Feature | Description |
|---|---|
| Time | Seconds elapsed between transactions and the first transaction |
| V1–V28 | Anonymized PCA-transformed features |
| Amount | Transaction amount |
| Class | Target classification variable |

### Target Classification

- `Class = 0` → Legitimate Transaction
- `Class = 1` → Fraudulent Transaction

### Class Imbalance

The dataset is extremely imbalanced.

Approximately 99.827% of transactions are legitimate, while only 0.173% are fraudulent.

This creates a significant machine learning challenge.

A model that predicts every transaction as legitimate could achieve high accuracy while detecting no fraudulent transactions.

Therefore, CreditGuard AI emphasizes Precision, Recall, F1-score, PR-AUC, and ROC-AUC rather than relying on accuracy alone.

---

## 🧠 Machine Learning Model & Benchmarks

CreditGuard AI uses supervised machine learning algorithms to identify potentially fraudulent transactions.

### Model Selection

The following algorithms were evaluated using 5-fold stratified cross-validation.

| Algorithm | Validation PR-AUC | ROC-AUC | Recall | Precision | F1-Score |
|---|---:|---:|---:|---:|---:|
| Random Forest | **0.8442** | **0.9754** | **79.3%** | **83.5%** | **0.8136** |
| XGBoost | 0.8315 | 0.9712 | 78.1% | 81.4% | 0.7973 |
| Logistic Regression | 0.7240 | 0.9521 | 62.5% | 85.2% | 0.7210 |
| Decision Tree | 0.6812 | 0.8750 | 76.0% | 71.0% | 0.7342 |

**Selected Model: Random Forest Classifier**

Random Forest was selected based on its validation performance, particularly PR-AUC and fraud detection performance.

### Test Partition Performance

The selected model was evaluated on 42,722 previously unseen transactions.

| Evaluation Metric | Result |
|---|---:|
| PR-AUC | 0.8020 |
| ROC-AUC | 0.9722 |
| Recall | 78.87% |
| Precision | 82.35% |
| F1-Score | 0.8058 |
| Accuracy | 99.94% |

### Confusion Matrix

| Actual / Predicted | Legitimate | Fraud |
|---|---:|---:|
| Actual Legitimate | 42,639 | 12 |
| Actual Fraud | 15 | 56 |

Interpretation:

- True Negative: 42,639
- False Positive: 12
- False Negative: 15
- True Positive: 56

The model successfully detected 56 out of 71 fraudulent transactions in the test partition.

### Top Predictive Features

The following features have the highest Gini feature importance in the selected Random Forest model.

| Rank | Feature | Importance |
|---|---|---:|
| 1 | V14 | 21.03% |
| 2 | V12 | 15.00% |
| 3 | V4 | 9.37% |
| 4 | V10 | 9.23% |
| 5 | V17 | 8.37% |
| 6 | V11 | 6.60% |
| 7 | V3 | 4.71% |

Note: V1–V28 are anonymized PCA-derived features. Their importance does not provide a direct human-readable explanation of the original transaction attributes.

*The reported benchmarks describe the current documented model evaluation. Reproduce the training and evaluation pipeline to independently verify them.*

---

## 📁 Project Directory Structure

```text
CreditGuard-AI/
│
├── .gitignore
├── README.md
│
├── backend/
│   │
│   ├── requirements.txt
│   ├── creditguard.db
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── prediction.py
│   │   │
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── dashboard.py
│   │   │   ├── dataset.py
│   │   │   ├── model.py
│   │   │   └── prediction.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── dataset.py
│   │   │   ├── model.py
│   │   │   └── transaction.py
│   │   │
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── dataset_service.py
│   │       ├── model_service.py
│   │       └── prediction_service.py
│   │
│   ├── data/
│   │   └── creditcard.csv
│   │
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── evaluate.py
│   │   ├── explain.py
│   │   ├── preprocess.py
│   │   ├── save_best_model.py
│   │   └── train.py
│   │
│   ├── models/
│   │   ├── creditguard_pipeline.joblib
│   │   ├── feature_names.joblib
│   │   └── model_metadata.json
│   │
│   └── tests/
│       ├── __init__.py
│       └── test_api.py
│
└── frontend/
    │
    ├── package.json
    ├── vite.config.js
    ├── index.html
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        │
        ├── components/
        │   ├── Sidebar.jsx
        │   └── UI.jsx
        │
        ├── hooks/
        │   └── useApi.js
        │
        ├── layouts/
        │   └── DashboardLayout.jsx
        │
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── FraudDetectionPage.jsx
        │   ├── DatasetExplorerPage.jsx
        │   ├── ModelPerformancePage.jsx
        │   ├── HistoryPage.jsx
        │   └── AboutPage.jsx
        │
        ├── services/
        │   └── api.js
        │
        └── utils/
            └── helpers.js
```

---

## 💻 Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | User interface development |
| Vite 8 | Frontend development and build |
| Vanilla CSS | Custom styling and design system |
| React Router | Page navigation |
| Recharts | Interactive data visualizations |
| Lucide React | Interface icons |
| Axios | Backend communication |

### Backend

| Technology | Purpose |
|---|---|
| Python | Main programming language |
| FastAPI | REST API development |
| Uvicorn | ASGI server |
| Pydantic | Data validation |
| SQLAlchemy | Database ORM |
| SQLite | Prediction history storage |

### Machine Learning

| Technology | Purpose |
|---|---|
| Pandas | Dataset processing |
| NumPy | Numerical computation |
| Scikit-learn | Machine learning |
| XGBoost | Model comparison |
| Joblib | Model serialization |
| Matplotlib | Data visualization |
| Imbalanced-learn | Class imbalance handling |

### Testing

- Pytest
- FastAPI TestClient
- Frontend production build verification

---

## ⚙️ Prerequisites

Install the following before running CreditGuard AI:

| Software | Recommended Version |
|---|---|
| Python | 3.11 or newer |
| Node.js | 18 or newer |
| npm | 9 or newer |
| Visual Studio Code | Latest version |
| Git | Latest version |

Python 3.14 was used in the documented development environment. Package compatibility should be verified for your installed Python version.

---

## 🚀 Installation & Setup

### Step 1: Open the Project

Open your terminal or PowerShell and navigate to the project folder.

```powershell
cd CreditGuard-AI
```

If cloning from GitHub:

```powershell
git clone YOUR_GITHUB_REPOSITORY_URL

cd CreditGuard-AI
```

### Step 2: Backend Setup

Navigate into the backend directory.

```powershell
cd backend
```

Create a Python virtual environment.

```powershell
python -m venv .venv
```

Activate the virtual environment.

```powershell
.\.venv\Scripts\Activate.ps1
```

Upgrade pip.

```powershell
python -m pip install --upgrade pip
```

Install the required Python dependencies.

```powershell
pip install -r requirements.txt
```

### Step 3: Add the Dataset

Ensure the original dataset is available at:

```text
backend/data/creditcard.csv
```

Check whether the dataset exists.

```powershell
Test-Path data/creditcard.csv
```

Expected result:

```text
True
```

If the result is False, place your original `creditcard.csv` inside the `backend/data/` directory.

### Step 4: Frontend Setup

Open a second terminal.

Navigate into the frontend directory.

```powershell
cd frontend
```

Install the frontend dependencies.

```powershell
npm install
```

---

## 🏃 Running the Application

CreditGuard AI requires two running development servers: one for FastAPI and one for React.

### 1. Start the Backend Server

Open Terminal 1.

```powershell
cd CreditGuard-AI/backend

.\.venv\Scripts\Activate.ps1

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Interactive Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

ReDoc documentation:

```text
http://127.0.0.1:8000/redoc
```

### 2. Start the Frontend Server

Open Terminal 2.

```powershell
cd CreditGuard-AI/frontend

npm run dev
```

Frontend URL:

```text
http://localhost:5173/
```

Open the frontend URL in your browser to access the CreditGuard AI platform.

### Server Overview

| Component | URL |
|---|---|
| React Frontend | http://localhost:5173 |
| FastAPI Backend | http://127.0.0.1:8000 |
| Swagger API Docs | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |

---

## 🧠 Model Training & Evaluation Pipeline

The pre-trained model artifacts are stored in:

```text
backend/models/
```

The existing artifacts include:

```text
creditguard_pipeline.joblib
feature_names.joblib
model_metadata.json
```

To reproduce the model benchmarking process, run the following commands from the backend directory.

### Run Multi-Model Benchmarking

```powershell
cd backend

python ml/train.py
```

### Train the Selected Random Forest Model

```powershell
python ml/save_best_model.py
```

### Model Training Workflow

1. Load `creditcard.csv`.
2. Analyze dataset structure.
3. Split data into training, validation, and testing partitions.
4. Apply preprocessing.
5. Train and compare ML algorithms.
6. Evaluate validation performance.
7. Select the appropriate model.
8. Determine the decision threshold.
9. Evaluate the selected model on unseen test data.
10. Save the trained model artifacts.

The model training scripts should preserve the same preprocessing and feature ordering used by the inference service.

---

## 📡 API Reference

All backend endpoints use the `/api` prefix.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Backend and model health check |
| GET | `/api/dashboard/overview` | Dashboard statistics |
| GET | `/api/dataset/overview` | Dataset summary |
| GET | `/api/dataset/records` | Paginated transaction records |
| GET | `/api/dataset/distribution` | Amount and time distributions |
| GET | `/api/dataset/correlation` | Feature correlation data |
| GET | `/api/model/info` | Model information |
| GET | `/api/model/metrics` | Evaluation metrics |
| GET | `/api/model/features` | Feature importance |
| POST | `/api/predict` | Single transaction prediction |
| POST | `/api/predict/batch` | Batch CSV prediction |
| GET | `/api/predictions/history` | Prediction audit history |
| GET | `/api/predictions/{id}` | Individual prediction details |
| GET | `/api/export/predictions` | Download prediction history |

### Example: Health Check

```http
GET http://127.0.0.1:8000/api/health
```

### Example: Single Prediction

```http
POST http://127.0.0.1:8000/api/predict
Content-Type: application/json
```

The request must include all 30 model input features, using the exact feature names and types expected by the backend.

### API Documentation

All available endpoints and request schemas can be inspected through:

```text
http://127.0.0.1:8000/docs
```

---

## 🧪 Running Automated Tests

The backend includes an automated API test suite.

Navigate to the backend directory.

```powershell
cd backend
```

Run all tests.

```powershell
python -m pytest tests/ -v
```

### Test Coverage

The documented test suite includes 18 test cases covering:

- Health endpoint.
- Dashboard overview.
- Dataset statistics.
- Dataset pagination.
- Dataset distribution.
- Model information.
- Model metrics.
- Feature importance.
- Single transaction prediction.
- Invalid transaction amount.
- Missing prediction fields.
- Batch CSV prediction.
- Invalid CSV extension.
- Missing CSV columns.
- Prediction history.
- History pagination.
- Missing prediction records.

### Frontend Production Build

Navigate to the frontend directory.

```powershell
cd frontend
```

Run:

```powershell
npm run build
```

This checks whether the frontend can be compiled for production.

---

## 🖥️ Application Pages

CreditGuard AI includes seven primary pages.

| Route | Page | Functionality |
|---|---|---|
| `/` | Landing Page | Project overview, platform introduction, and navigation |
| `/dashboard` | Dashboard | Transaction KPIs, fraud distribution, amount analytics, and recent predictions |
| `/detection` | Fraud Detection | Single prediction, presets, risk indicators, and batch CSV upload |
| `/dataset` | Dataset Explorer | Paginated transaction records, filters, distributions, and correlation analysis |
| `/model` | Model Performance | PR-AUC, ROC-AUC, Recall, Precision, F1, confusion matrix, and feature rankings |
| `/history` | Transaction History | Prediction audit log, search, filters, detail modal, and CSV export |
| `/about` | About Project | Architecture, ML methodology, benchmarks, and privacy disclosures |

### Dashboard

Displays overall platform statistics and transaction analytics.

### Fraud Detection

Supports single and batch transaction prediction using the trained ML model.

### Dataset Explorer

Provides interactive exploration of the original credit card transaction dataset.

### Model Performance

Visualizes model evaluation results and feature importance.

### Transaction History

Maintains a searchable record of previous prediction requests.

### About Project

Explains the technical architecture, methodology, and project limitations.

---

## 🎨 Design System

CreditGuard AI follows a **Premium Organic SaaS** design philosophy.

The visual identity combines natural colors, elegant typography, refined layouts, and subtle interactions.

### Color Palette

| Color | Hex Code | Usage |
|---|---|---|
| Organic Cream | `#FDFBF7` | Main background |
| White | `#FFFFFF` | Cards and surfaces |
| Forest Green | `#2D5A43` | Primary actions |
| Sage Green | `#397B5D` | Legitimate transaction indicators |
| Coral Terracotta | `#CC5B54` | Fraud indicators |
| Soft Neutral | `#E9E4D8` | Secondary surfaces |

### Typography

- Playfair Display – Headings.
- Outfit – Body content.
- JetBrains Mono – Numerical metrics and transaction identifiers.

### Design Principles

- Light theme only.
- Natural color combinations.
- Clean layouts.
- Consistent spacing.
- Subtle shadows.
- Carefully balanced rounded components.
- Responsive navigation.
- Interactive data visualizations.
- Minimal decorative elements.

The goal is to create a professional financial technology interface that feels human-designed and commercially polished.

---

## 🔐 Security & Privacy

CreditGuard AI follows basic security and data handling practices.

- Validate transaction inputs.
- Restrict uploaded CSV file types and sizes.
- Avoid storing unnecessary sensitive transaction information.
- Never store actual credit card numbers or CVVs.
- Keep application secrets outside source code.
- Use appropriate API error handling.
- Handle malformed CSV files safely.
- Protect internal file paths and model artifacts.

**Disclaimer:** CreditGuard AI is an educational and analytical machine learning prototype. It is not a certified banking fraud prevention system and should not be used as the sole basis for real financial decisions.

---

## 🚀 Future Enhancements

Potential improvements include:

- Advanced ensemble learning.
- Real-time transaction stream processing.
- Advanced SHAP-based explainability.
- Model drift detection.
- Automated model retraining.
- Authentication and role-based access.
- Cloud deployment.
- Advanced fraud pattern detection.
- Improved model monitoring.
- Integration with external financial security systems.

---

## 📄 License & Attribution

### Dataset Attribution

The European Credit Card Fraud Detection dataset is associated with:

- Machine Learning Group – Université Libre de Bruxelles (ULB).
- Andrea Dal Pozzolo.
- Olivier Caelen.
- Reid A. Johnson.
- Gianluca Bontempi.

Review the original dataset licensing and terms before redistribution.

### Project

**CreditGuard AI**

Machine Learning | Artificial Intelligence | Financial Technology

---

<p align="center">

### CREDITGUARD AI

**Intelligent Fraud Detection Through Machine Learning.**

*Detect the Unusual. Protect Every Transaction.*

</p>
