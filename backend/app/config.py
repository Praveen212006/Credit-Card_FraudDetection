"""
CreditGuard AI - Application Configuration
"""
import os

# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "models")

DATASET_PATH = os.path.join(DATA_DIR, "creditcard.csv")
PIPELINE_PATH = os.path.join(MODEL_DIR, "creditguard_pipeline.joblib")
FEATURE_NAMES_PATH = os.path.join(MODEL_DIR, "feature_names.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'creditguard.db')}"

# ─────────────────────────────────────────────
#  API Settings
# ─────────────────────────────────────────────
APP_TITLE = "CreditGuard AI"
APP_DESCRIPTION = "Intelligent Credit Card Fraud Detection Platform"
APP_VERSION = "1.0.0"

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

MAX_UPLOAD_SIZE_MB = 50
MAX_BATCH_ROWS = 50000
DATASET_PREVIEW_ROWS = 1000

# ─────────────────────────────────────────────
#  Feature Definitions
# ─────────────────────────────────────────────
FEATURE_COLUMNS = [
    'Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9',
    'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18',
    'V19', 'V20', 'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27',
    'V28', 'Amount'
]
