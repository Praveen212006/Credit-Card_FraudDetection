import React, { useEffect, useState } from 'react'
import {
  Shield, Database, Cpu, Layout, Lock, CheckCircle,
  Activity, ExternalLink, Code2, Server, Award
} from 'lucide-react'
import { healthApi } from '../services/api'
import { Badge } from '../components/UI'

export default function AboutPage() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    healthApi.check()
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', model_loaded: false, dataset_loaded: false }))
  }, [])

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 960 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-green)', marginBottom: 4 }}>
          Platform Documentation
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          About CreditGuard AI
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
          Architecture, machine learning methodology, and real-world fraud detection design principles.
        </p>
      </div>

      {/* System Telemetry & Status Pill Banner */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: health?.status === 'ok' ? 'rgba(61,122,90,0.1)' : 'rgba(200,90,84,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={20} color={health?.status === 'ok' ? 'var(--color-green)' : 'var(--fraud)'} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Core Infrastructure Health
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              FastAPI Engine Status: <strong>{health?.status === 'ok' ? 'Online & Healthy' : 'Initializing / Offline'}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <span className={`badge ${health?.model_loaded ? 'badge-legitimate' : 'badge-neutral'}`}>
            <Cpu size={12} />
            Model {health?.model_loaded ? 'Loaded' : 'Pending'}
          </span>
          <span className={`badge ${health?.dataset_loaded ? 'badge-legitimate' : 'badge-neutral'}`}>
            <Database size={12} />
            Dataset {health?.dataset_loaded ? 'Cached' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Architectural Pillars Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16
      }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 12,
          padding: '22px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(61,122,90,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Database size={18} color="var(--color-green)" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            ULB Benchmark Dataset
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Trained on 284,807 European cardholder transactions. With only 492 fraud cases (0.172%), this real-world dataset reflects the extreme class imbalance encountered in authentic financial institutions.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 12,
          padding: '22px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(61,122,90,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Cpu size={18} color="var(--color-green)" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            Ensemble Random Forest
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Selected over Logistic Regression, Decision Trees, and XGBoost after rigorous 5-fold Stratified Cross-Validation. Delivers <strong>0.8020 PR-AUC</strong> and <strong>0.9722 ROC-AUC</strong> with low false positive overhead.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 12,
          padding: '22px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(61,122,90,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Server size={18} color="var(--color-green)" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            FastAPI Asynchronous Backend
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            High-throughput REST API with Pydantic v2 strict schemas, thread-safe model caching, batch CSV multipart streaming, and persistent SQLite prediction history auditing.
          </p>
        </div>
      </div>

      {/* Methodology Section */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 14,
        padding: '28px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
          Machine Learning Methodology & Technical Design
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', margin: '0 0 4px 0', fontSize: '0.9375rem' }}>
              1. Addressing Extreme Class Imbalance (0.172% Fraud Rate)
            </h4>
            <p style={{ margin: 0 }}>
              Standard loss functions optimize for accuracy, which fails completely when 99.828% of data points belong to the majority class. CreditGuard AI employs <strong>Stratified Cross-Validation</strong> to maintain proportional class representations across folds and evaluates models strictly based on <strong>PR-AUC</strong> (Area Under the Precision-Recall Curve), which is mathematically robust against extreme skew.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', margin: '0 0 4px 0', fontSize: '0.9375rem' }}>
              2. Confidentiality via Principal Component Analysis (PCA)
            </h4>
            <p style={{ margin: 0 }}>
              Features <code>V1</code> through <code>V28</code> represent the output of a PCA transformation applied to the original financial attributes to protect consumer privacy and sensitive cardholder metadata. Features <code>Time</code> and <code>Amount</code> remain untransformed to preserve temporal cadence and transaction magnitude.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', margin: '0 0 4px 0', fontSize: '0.9375rem' }}>
              3. Decision Threshold Calibration
            </h4>
            <p style={{ margin: 0 }}>
              A standard 0.50 threshold is calibrated to balance the operational cost of fraud loss against the merchant friction of false positives. On the held-out test set of 42,722 transactions, the model generated only 12 false positives while successfully intercepting 56 confirmed fraud attacks.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Breakdown */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 14,
        padding: '24px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: 16 }}>
          Technology Stack
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Machine Learning & Data
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Python 3.14</li>
              <li>Scikit-learn 1.6</li>
              <li>Pandas & NumPy</li>
              <li>Joblib serialization</li>
            </ul>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Backend Services
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>FastAPI 0.115</li>
              <li>Uvicorn ASGI</li>
              <li>SQLAlchemy 2.0 (SQLite)</li>
              <li>Pydantic v2 validation</li>
            </ul>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Frontend Application
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>React 19 & Vite 8</li>
              <li>React Router v7</li>
              <li>Recharts visualizers</li>
              <li>Lucide React icons</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
