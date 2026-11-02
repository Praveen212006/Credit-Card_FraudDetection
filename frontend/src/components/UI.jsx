import React from 'react'
import { AlertTriangle, CheckCircle, TrendingUp, X } from 'lucide-react'
import { formatScore, formatPercent } from '../utils/helpers'

export function LoadingSpinner({ size = 20, text = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
      <div className="spinner" style={{ width: size, height: size }} />
      {text && <span style={{ fontSize: '0.875rem' }}>{text}</span>}
    </div>
  )
}

export function PageLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 16 }}>
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>Loading data...</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      background: 'var(--fraud-bg)', borderRadius: 12,
      border: '1px solid rgba(184,93,80,0.15)',
    }}>
      <AlertTriangle size={36} color="var(--fraud)" style={{ marginBottom: 12 }} />
      <h4 style={{ color: 'var(--fraud)', marginBottom: 6 }}>Something went wrong</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>Try Again</button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={24} />
      </div>
      <h4 style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{title}</h4>
      {description && <p style={{ fontSize: '0.875rem' }}>{description}</p>}
    </div>
  )
}

export function KpiCard({ label, value, sub, icon: Icon, iconClass = 'kpi-icon-green', mono = true }) {
  return (
    <div className="kpi-card">
      {Icon && (
        <div className={`kpi-icon ${iconClass}`}>
          <Icon size={18} />
        </div>
      )}
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${mono ? 'mono' : ''}`}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  )
}

export function Badge({ type = 'neutral', children }) {
  return <span className={`badge badge-${type}`}>{children}</span>
}

export function PredictionBadge({ prediction }) {
  if (prediction === 'fraud') {
    return (
      <span className="badge badge-fraud">
        <AlertTriangle size={10} />
        Potential Fraud
      </span>
    )
  }
  return (
    <span className="badge badge-legitimate">
      <CheckCircle size={10} />
      Legitimate
    </span>
  )
}

export function ScoreBar({ score, threshold }) {
  const isFraud = score >= threshold
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fraud Score</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.8125rem',
          fontWeight: 500,
          color: isFraud ? 'var(--fraud)' : 'var(--success)',
        }}>
          {formatScore(score)}
        </span>
      </div>
      <div className="score-bar">
        <div
          className={`score-bar-fill ${isFraud ? 'score-bar-fill-high' : 'score-bar-fill-low'}`}
          style={{ width: `${Math.min(score * 100, 100)}%` }}
        />
        {/* Threshold marker */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${threshold * 100}%`,
          width: 2, background: 'var(--text-light)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>0</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          Threshold: {formatScore(threshold)}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>1</span>
      </div>
    </div>
  )
}

export function SectionHeader({ label, title, description }) {
  return (
    <div className="section-header">
      {label && <div className="section-label">{label}</div>}
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-desc">{description}</p>}
    </div>
  )
}

export function ChartCard({ title, subtitle, children, style }) {
  return (
    <div className="chart-container" style={style}>
      <div className="chart-title">{title}</div>
      {subtitle && <div className="chart-subtitle">{subtitle}</div>}
      {children}
    </div>
  )
}

export function MetricRow({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--border-light)',
    }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: 500,
        color: highlight || 'var(--text-primary)',
      }}>
        {value}
      </span>
    </div>
  )
}

export function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '16px 0' }}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ← Prev
      </button>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0 12px' }}>
        Page {page} of {totalPages} &nbsp;·&nbsp; {total.toLocaleString()} records
      </span>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next →
      </button>
    </div>
  )
}
