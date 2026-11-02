import React, { useState } from 'react'
import {
  Shield, AlertTriangle, CheckCircle, Upload, FileText,
  RefreshCw, ArrowRight, Download, Zap, Layers, Info
} from 'lucide-react'
import { predictionApi } from '../services/api'
import {
  PredictionBadge, ScoreBar, LoadingSpinner, Badge
} from '../components/UI'
import {
  formatNumber, formatPercent, formatScore,
  formatCurrency, getRiskLevel, SAMPLE_TRANSACTION
} from '../utils/helpers'

// Real fraud transaction template extracted from verified fraud instances in creditcard.csv
const FRAUD_PRESET = {
  Time: 406.0, Amount: 1.00,
  V1: -2.3122, V2: 1.9519, V3: -1.6098, V4: 3.9979, V5: -0.5221,
  V6: -1.4265, V7: -2.5373, V8: 1.3916, V9: -2.7700, V10: -2.7722,
  V11: 3.2020, V12: -2.8999, V13: -0.5952, V14: -4.2892, V15: 0.3897,
  V16: -1.1407, V17: -2.8300, V18: -0.0168, V19: 0.4169, V20: 0.1269,
  V21: 0.5172, V22: -0.0350, V23: -0.4652, V24: 0.3201, V25: 0.0445,
  V26: 0.1778, V27: 0.2611, V28: -0.1432,
}

// Borderline / edge case transaction template
const BORDERLINE_PRESET = {
  Time: 75200.0, Amount: 245.50,
  V1: -0.8540, V2: 0.9230, V3: -0.3450, V4: 1.2500, V5: -0.2100,
  V6: -0.4500, V7: -0.8900, V8: 0.4200, V9: -0.9200, V10: -1.1500,
  V11: 1.4500, V12: -1.2000, V13: -0.1200, V14: -1.8500, V15: 0.2500,
  V16: -0.6500, V17: -0.9800, V18: 0.1200, V19: 0.3100, V20: 0.0800,
  V21: 0.2100, V22: -0.1200, V23: -0.0500, V24: 0.1100, V25: 0.0500,
  V26: 0.0800, V27: 0.0900, V28: 0.0200,
}

const FEATURE_KEYS = [
  'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
  'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20',
  'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28'
]

export default function FraudDetectionPage() {
  const [activeTab, setActiveTab] = useState('single') // 'single' | 'batch'

  // Single Prediction Form State
  const [formData, setFormData] = useState({ ...SAMPLE_TRANSACTION })
  const [singleLoading, setSingleLoading] = useState(false)
  const [singleResult, setSingleResult] = useState(null)
  const [singleError, setSingleError] = useState(null)

  // Batch Prediction State
  const [batchFile, setBatchFile] = useState(null)
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchResult, setBatchResult] = useState(null)
  const [batchError, setBatchError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  // Handle Input Changes for Single Form
  const handleInputChange = (field, val) => {
    const num = parseFloat(val)
    setFormData(prev => ({
      ...prev,
      [field]: isNaN(num) ? val : num
    }))
  }

  // Load Presets
  const applyPreset = (preset) => {
    setFormData({ ...preset })
    setSingleResult(null)
    setSingleError(null)
  }

  // Submit Single Transaction
  const handleSingleSubmit = async (e) => {
    e.preventDefault()
    setSingleLoading(true)
    setSingleError(null)
    setSingleResult(null)

    try {
      // Ensure all fields are numbers
      const payload = { ...formData }
      for (const k of Object.keys(payload)) {
        payload[k] = Number(payload[k]) || 0
      }
      const res = await predictionApi.predictSingle(payload)
      setSingleResult(res)
    } catch (err) {
      setSingleError(err.message || 'Prediction request failed')
    } finally {
      setSingleLoading(false)
    }
  }

  // Handle Batch File Drop/Selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setBatchFile(file)
      setBatchError(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.name.endsWith('.csv')) {
      setBatchFile(file)
      setBatchError(null)
    } else {
      setBatchError('Please select a valid .csv file.')
    }
  }

  // Upload Batch
  const handleBatchUpload = async () => {
    if (!batchFile) return
    setBatchLoading(true)
    setBatchError(null)
    setBatchResult(null)

    const fd = new FormData()
    fd.append('file', batchFile)

    try {
      const res = await predictionApi.predictBatch(fd)
      setBatchResult(res)
    } catch (err) {
      setBatchError(err.message || 'Batch prediction failed')
    } finally {
      setBatchLoading(false)
    }
  }

  // Generate Sample Batch CSV
  const handleDownloadSampleCSV = () => {
    const headers = ['Time', ...FEATURE_KEYS, 'Amount'].join(',')
    const row1 = ['406.0', ...FEATURE_KEYS.map(k => SAMPLE_TRANSACTION[k]), '149.62'].join(',')
    const row2 = ['407.0', ...FEATURE_KEYS.map(k => FRAUD_PRESET[k]), '1.00'].join(',')
    const row3 = ['408.0', ...FEATURE_KEYS.map(k => BORDERLINE_PRESET[k]), '245.50'].join(',')
    const csvData = [headers, row1, row2, row3].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_creditguard_transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-green)', marginBottom: 4 }}>
          Inference Engine
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Fraud Detection & Risk Scoring
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
          Evaluate transaction telemetry in real-time or process batch CSV datasets using the trained model.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('single')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'single' ? 'var(--color-green)' : 'transparent',
            color: activeTab === 'single' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s ease'
          }}
        >
          <Zap size={15} />
          Single Transaction Analysis
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'batch' ? 'var(--color-green)' : 'transparent',
            color: activeTab === 'batch' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s ease'
          }}
        >
          <Layers size={15} />
          Batch CSV Analysis
        </button>
      </div>

      {/* SINGLE INFERENCE TAB */}
      {activeTab === 'single' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: 24, alignItems: 'start' }}>
          {/* Form Card */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 14,
            padding: '24px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.0625rem', fontWeight: 600, margin: 0 }}>
                  Transaction Features
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  All 30 input attributes required for inference
                </span>
              </div>

              {/* Presets */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => applyPreset(SAMPLE_TRANSACTION)}
                  title="Load a verified legitimate transaction"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  Legitimate Preset
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => applyPreset(FRAUD_PRESET)}
                  title="Load a verified fraudulent transaction"
                  style={{ fontSize: '0.75rem', padding: '4px 10px', color: 'var(--fraud)', borderColor: 'rgba(200,90,84,0.3)' }}
                >
                  Fraud Preset
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => applyPreset(BORDERLINE_PRESET)}
                  title="Load an ambiguous borderline transaction"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  Borderline Preset
                </button>
              </div>
            </div>

            <form onSubmit={handleSingleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Primary Attributes: Time & Amount */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: 10,
                border: '1px solid var(--border-light)'
              }}>
                <div>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Amount ($)</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>Non-negative</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input mono"
                    value={formData.Amount}
                    onChange={(e) => handleInputChange('Amount', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Time (Seconds)</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>Elapsed index</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="form-input mono"
                    value={formData.Time}
                    onChange={(e) => handleInputChange('Time', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* PCA Features Grid */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    PCA Transformed Attributes (V1 — V28)
                  </label>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Confidential banking features
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: 10,
                  maxHeight: 340,
                  overflowY: 'auto',
                  paddingRight: 6
                }}>
                  {FEATURE_KEYS.map((key) => (
                    <div key={key}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>
                        {key}
                      </span>
                      <input
                        type="number"
                        step="0.0001"
                        className="form-input mono"
                        style={{ fontSize: '0.75rem', padding: '6px 8px' }}
                        value={formData[key]}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => applyPreset(SAMPLE_TRANSACTION)}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={singleLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {singleLoading ? (
                    <LoadingSpinner size={16} text="Evaluating..." />
                  ) : (
                    <>
                      <Zap size={16} />
                      Analyze Risk
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results Side Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {singleError && (
              <div style={{
                padding: '16px',
                background: 'rgba(200,90,84,0.1)',
                border: '1px solid rgba(200,90,84,0.3)',
                borderRadius: 12,
                color: 'var(--fraud)',
                fontSize: '0.875rem',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start'
              }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Evaluation Failed</strong>
                  <div style={{ marginTop: 4 }}>{singleError}</div>
                </div>
              </div>
            )}

            {singleResult ? (
              <div className="animate-fade-in" style={{
                background: 'var(--bg-card)',
                borderRadius: 14,
                padding: '24px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                    Inference Verdict
                  </div>
                  <PredictionBadge prediction={singleResult.prediction} />
                </div>

                {/* Main Risk Score Gauge */}
                <div style={{
                  padding: '20px',
                  borderRadius: 12,
                  background: singleResult.prediction === 'fraud' ? 'var(--fraud-bg)' : 'rgba(61,122,90,0.06)',
                  border: singleResult.prediction === 'fraud' ? '1px solid rgba(200,90,84,0.25)' : '1px solid rgba(61,122,90,0.2)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Model Fraud Probability Score
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: singleResult.prediction === 'fraud' ? 'var(--fraud)' : 'var(--color-green)'
                  }}>
                    {Number(singleResult.fraud_score).toFixed(4)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 6 }}>
                    <Badge type={singleResult.prediction === 'fraud' ? 'fraud' : 'legitimate'}>
                      {getRiskLevel(singleResult.fraud_score).level} Risk
                    </Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Decision Threshold: {Number(singleResult.decision_threshold).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Score Bar with marker */}
                <ScoreBar
                  score={singleResult.fraud_score}
                  threshold={singleResult.decision_threshold}
                />

                {/* Audit Telemetry */}
                <div style={{
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  fontSize: '0.8125rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Transaction Reference</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{singleResult.transaction_reference}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Evaluated Model</span>
                    <span>{singleResult.model_version}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Timestamp</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 14,
                padding: '36px 24px',
                border: '1px dashed var(--border-light)',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}>
                <Shield size={36} style={{ opacity: 0.35, marginBottom: 12 }} />
                <h4 style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9375rem' }}>
                  Awaiting Input
                </h4>
                <p style={{ fontSize: '0.8125rem', marginTop: 6, lineHeight: 1.4 }}>
                  Select one of the presets above or adjust parameters, then click <strong>Analyze Risk</strong> to evaluate.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BATCH INFERENCE TAB */}
      {activeTab === 'batch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Upload Card */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 14,
            padding: '28px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
                  Upload Batch Transaction CSV
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 4 }}>
                  File must contain headers: <code>Time, V1..V28, Amount</code>. (Up to 10,000 transactions per run).
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleDownloadSampleCSV}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={14} />
                Download Sample CSV
              </button>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragOver ? 'var(--color-green)' : 'var(--border-light)'}`,
                borderRadius: 12,
                padding: '40px 24px',
                textAlign: 'center',
                background: dragOver ? 'rgba(61,122,90,0.05)' : 'var(--bg-secondary)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('csv-upload-input')?.click()}
            >
              <input
                id="csv-upload-input"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <Upload size={36} color="var(--color-green)" style={{ opacity: 0.8, marginBottom: 12 }} />
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {batchFile ? batchFile.name : 'Click to select or drag and drop your CSV file here'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {batchFile ? `${(batchFile.size / 1024).toFixed(1)} KB` : 'Maximum file size: 50MB'}
              </div>
            </div>

            {batchError && (
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                background: 'rgba(200,90,84,0.1)',
                border: '1px solid rgba(200,90,84,0.25)',
                borderRadius: 8,
                color: 'var(--fraud)',
                fontSize: '0.8125rem'
              }}>
                {batchError}
              </div>
            )}

            {batchFile && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleBatchUpload}
                  disabled={batchLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {batchLoading ? (
                    <LoadingSpinner size={16} text="Processing Batch..." />
                  ) : (
                    <>
                      <Zap size={16} />
                      Execute Batch Prediction
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Batch Results Output */}
          {batchResult && (
            <div className="animate-fade-in" style={{
              background: 'var(--bg-card)',
              borderRadius: 14,
              padding: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
                    Batch Analysis Summary
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Processed {formatNumber(batchResult.total_records)} transactions
                  </span>
                </div>
              </div>

              {/* Summary KPIs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 14
              }}>
                <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Rows</div>
                  <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 4 }}>
                    {formatNumber(batchResult.total_records)}
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(61,122,90,0.08)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-green)', textTransform: 'uppercase' }}>Legitimate</div>
                  <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-green)', marginTop: 4 }}>
                    {formatNumber(batchResult.legitimate_count)}
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(200,90,84,0.08)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fraud)', textTransform: 'uppercase' }}>Flagged Fraud</div>
                  <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--fraud)', marginTop: 4 }}>
                    {formatNumber(batchResult.fraud_count)}
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Flag Rate</div>
                  <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 4 }}>
                    {formatPercent(batchResult.fraud_percentage)}
                  </div>
                </div>
              </div>

              {/* Batch Table */}
              <div style={{ overflowX: 'auto', maxHeight: 360 }}>
                <table className="table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Reference ID</th>
                      <th>Classification</th>
                      <th>Fraud Score</th>
                      <th>Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(batchResult.predictions || []).slice(0, 50).map((row, idx) => (
                      <tr key={idx}>
                        <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          #{idx + 1}
                        </td>
                        <td className="mono" style={{ fontSize: '0.8125rem' }}>
                          {row.transaction_reference}
                        </td>
                        <td>
                          <PredictionBadge prediction={row.prediction} />
                        </td>
                        <td className="mono" style={{
                          fontWeight: 600,
                          color: row.prediction === 'fraud' ? 'var(--fraud)' : 'var(--success)'
                        }}>
                          {Number(row.fraud_score).toFixed(4)}
                        </td>
                        <td>
                          <Badge type={row.prediction === 'fraud' ? 'fraud' : 'legitimate'}>
                            {getRiskLevel(row.fraud_score).level}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {batchResult.predictions?.length > 50 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Showing first 50 results of {batchResult.predictions.length} transactions.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
