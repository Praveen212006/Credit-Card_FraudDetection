import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, ArrowRight, Zap, BarChart3, Lock, Database, Brain, CheckCircle, Activity, Code2 } from 'lucide-react'
import { healthApi } from '../services/api'

const STATS = [
  { value: '284,807', label: 'Transactions Analyzed' },
  { value: '492', label: 'Fraud Cases Detected' },
  { value: '0.17%', label: 'Real-World Fraud Rate' },
  { value: '80.2%', label: 'Model PR-AUC Score' },
]

const HOW_IT_WORKS = [
  { n: '01', title: 'Submit Transaction', desc: 'Enter the 30 transaction features or upload a CSV file for batch analysis.' },
  { n: '02', title: 'AI Analysis', desc: 'Our trained Random Forest model evaluates the transaction against learned fraud patterns.' },
  { n: '03', title: 'Risk Assessment', desc: 'Receive a fraud score, classification, and feature contribution insights.' },
]

const FEATURES = [
  { icon: Brain, title: 'Real ML Model', desc: 'Trained Random Forest on 283K real-world transactions with optimized decision threshold.' },
  { icon: BarChart3, title: 'Interactive Analytics', desc: 'Explore dataset distribution, model performance curves, and feature importances.' },
  { icon: Zap, title: 'Instant Prediction', desc: 'Single transaction prediction in milliseconds. Batch CSV processing up to 50K rows.' },
  { icon: Database, title: 'Dataset Explorer', desc: 'Browse and filter the full creditcard dataset with search and pagination.' },
  { icon: Lock, title: 'Privacy-First', desc: 'No sensitive card data stored. Only anonymized prediction metadata is persisted.' },
  { icon: Activity, title: 'Model Explainability', desc: 'Feature importance rankings show which factors most influence each prediction.' },
]

const TECH_STACK = [
  { label: 'ML', items: ['Python 3.14', 'scikit-learn', 'imbalanced-learn', 'SHAP', 'pandas'] },
  { label: 'Backend', items: ['FastAPI', 'SQLAlchemy', 'SQLite', 'Pydantic', 'Uvicorn'] },
  { label: 'Frontend', items: ['React', 'Vite', 'Recharts', 'React Router', 'Axios'] },
]

export default function LandingPage() {
  const [apiStatus, setApiStatus] = useState(null)

  useEffect(() => {
    healthApi.check().then(setApiStatus).catch(() => setApiStatus({ status: 'offline' }))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Navbar ── */}
      <nav style={{
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(244,245,239,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: 'var(--color-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            CreditGuard AI
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {apiStatus && (
            <span style={{ fontSize: '0.75rem', color: apiStatus.status === 'ok' ? 'var(--success)' : 'var(--fraud)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {apiStatus.status === 'ok' ? 'API Online' : 'API Offline'}
            </span>
          )}
          <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
          <Link to="/detection" className="btn btn-primary btn-sm">
            Start Detection <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        padding: '80px 40px 100px',
        background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(55,107,87,0.08), transparent)`,
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background blob */}
        <div style={{
          position: 'absolute', top: -100, right: -200, width: 600, height: 600,
          borderRadius: '50%', background: 'rgba(201,130,101,0.04)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -150, left: -100, width: 500, height: 500,
          borderRadius: '50%', background: 'rgba(55,107,87,0.04)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 99,
            background: 'var(--success-bg)', border: '1px solid rgba(84,131,99,0.2)',
            fontSize: '0.8125rem', fontWeight: 500, color: 'var(--success)',
            marginBottom: 28,
          }}>
            <CheckCircle size={13} />
            Trained on 284,807 real transactions · ML-powered
          </div>

          <h1 style={{ marginBottom: 8, letterSpacing: '-0.03em' }}>
            Trust Every Transaction.
          </h1>
          <h1 style={{
            color: 'var(--color-clay)', marginBottom: 24,
            letterSpacing: '-0.03em', fontWeight: 700,
          }}>
            Question the Unusual.
          </h1>

          <p style={{ fontSize: '1.125rem', lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            CreditGuard AI is an intelligent fraud detection platform that applies a trained Random Forest model to identify potentially fraudulent credit card transactions — with full model transparency and real-time analytics.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/detection" className="btn btn-primary btn-lg">
              Start Detection <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg">
              Explore Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Dataset Stats ── */}
      <section style={{ padding: '0 40px', marginTop: -32, position: 'relative', zIndex: 10 }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        }}>
          {STATS.map(({ value, label }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                {value}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label">Process</div>
            <h2 style={{ marginBottom: 12 }}>How CreditGuard AI Works</h2>
            <p style={{ fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
              Three steps from transaction data to actionable fraud intelligence.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {HOW_IT_WORKS.map(({ n, title, desc }) => (
              <div key={n} className="card" style={{ position: 'relative' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 500,
                  color: 'var(--border)', marginBottom: 16, lineHeight: 1,
                }}>
                  {n}
                </div>
                <h4 style={{ marginBottom: 8 }}>{title}</h4>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '0 40px 100px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label">Features</div>
            <h2 style={{ marginBottom: 12 }}>Everything You Need</h2>
            <p style={{ maxWidth: 480, margin: '0 auto', fontSize: '1rem' }}>
              A complete end-to-end machine learning platform — from raw data to explainable predictions.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card" style={{ background: 'var(--bg-card)' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--success-bg)', color: 'var(--color-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={18} />
                </div>
                <h4 style={{ marginBottom: 8 }}>{title}</h4>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ML Methodology ── */}
      <section style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div className="section-label">Methodology</div>
            <h2 style={{ marginBottom: 16 }}>Engineered for Imbalanced Fraud Data</h2>
            <p style={{ marginBottom: 16 }}>
              Real-world fraud datasets are highly imbalanced — only 0.17% of transactions are fraudulent. Standard accuracy metrics fail here.
            </p>
            <p style={{ marginBottom: 24 }}>
              CreditGuard AI uses <strong style={{ color: 'var(--text-primary)' }}>class-weighted learning</strong>, <strong style={{ color: 'var(--text-primary)' }}>F2-score threshold optimization</strong> (prioritizing recall), and <strong style={{ color: 'var(--text-primary)' }}>PR-AUC</strong> as the primary evaluation metric — all designed for fraud-centric performance.
            </p>
            {['Stratified 70/15/15 train-val-test split', 'F2-score optimized decision threshold', 'PR-AUC as primary metric (not accuracy)', 'Model comparison across 4 algorithms'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <CheckCircle size={14} color="var(--success)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { metric: 'PR-AUC', value: '0.8020', desc: 'Primary metric for imbalanced data', color: 'var(--color-green)' },
              { metric: 'Recall', value: '78.87%', desc: 'Fraud cases correctly identified', color: 'var(--success)' },
              { metric: 'Precision', value: '82.35%', desc: 'Alerts that are actual fraud', color: 'var(--color-clay)' },
              { metric: 'ROC-AUC', value: '0.9722', desc: 'Overall discriminative ability', color: 'var(--warning)' },
            ].map(({ metric, value, desc, color }) => (
              <div key={metric} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 2 }}>{metric}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 500, color }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section style={{ padding: '80px 40px', background: 'var(--bg-sand)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-label">Technology</div>
          <h2 style={{ marginBottom: 40 }}>Built with Modern Tools</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {TECH_STACK.map(({ label, items }) => (
              <div key={label} className="card">
                <div style={{ fontWeight: 600, color: 'var(--color-green)', marginBottom: 12, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.map(item => (
                    <div key={item} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Code2 size={11} style={{ flexShrink: 0, color: 'var(--text-light)' }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>Ready to Detect Fraud?</h2>
        <p style={{ marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
          Analyze transactions instantly using real machine learning. No setup required.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/detection" className="btn btn-primary btn-lg">
            Start Detection <ArrowRight size={16} />
          </Link>
          <Link to="/about" className="btn btn-secondary btn-lg">Learn More</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '24px 40px',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={14} color="var(--color-green)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>CreditGuard AI</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>· Fraud Detection Platform</span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.4 }}>
          Research & educational prototype. Not a certified fraud prevention system.<br />
          Dataset: ULB Machine Learning Group — Credit Card Fraud Detection.
        </p>
      </footer>
    </div>
  )
}
