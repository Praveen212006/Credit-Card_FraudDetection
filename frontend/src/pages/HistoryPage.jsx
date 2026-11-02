import React, { useEffect, useState } from 'react'
import {
  History, Search, Filter, Download, Eye, X,
  Shield, AlertTriangle, CheckCircle, RefreshCw, FileText
} from 'lucide-react'
import { predictionApi } from '../services/api'
import {
  PageLoading, ErrorState, Pagination, PredictionBadge,
  ScoreBar, Badge
} from '../components/UI'
import {
  formatDate, formatScore, getRiskLevel,
  downloadBlob, truncateRef
} from '../utils/helpers'

export default function HistoryPage() {
  const [predictions, setPredictions] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('') // '' | 'fraud' | 'legitimate'
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [error, setError] = useState(null)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        page_size: pageSize,
      }
      if (search.trim()) params.search = search.trim()
      if (filterType) params.prediction_filter = filterType

      const res = await predictionApi.getHistory(params)
      setPredictions(res.predictions || [])
      setTotal(res.total || 0)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load prediction history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [page, pageSize, filterType])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchHistory()
  }

  const handleExportCSV = async () => {
    try {
      setExporting(true)
      const res = await predictionApi.exportCSV()
      downloadBlob(res.data, 'creditguard_predictions.csv')
    } catch (err) {
      alert('Export failed: ' + (err.message || 'No records to export.'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-green)', marginBottom: 4 }}>
            Audit Trail & Records
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Transaction Prediction History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
            Immutable logging of single and batch model inferences stored in the platform database.
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={handleExportCSV}
          disabled={exporting || total === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Download size={14} />
          {exporting ? 'Exporting...' : 'Export History (CSV)'}
        </button>
      </div>

      {/* Main Card */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 14,
        padding: '24px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: '1 1 280px', maxWidth: 420 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search reference ID..."
                className="form-input"
                style={{ paddingLeft: 36, fontSize: '0.8125rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.8125rem', width: 'auto' }}
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Classifications</option>
                <option value="fraud">Fraud Only</option>
                <option value="legitimate">Legitimate Only</option>
              </select>
            </div>

            <select
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.8125rem', width: 'auto' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        {loading ? (
          <PageLoading />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchHistory} />
        ) : predictions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
            <History size={36} style={{ opacity: 0.35, marginBottom: 12 }} />
            <h4 style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9375rem' }}>
              No Prediction Records Found
            </h4>
            <p style={{ fontSize: '0.8125rem', marginTop: 4 }}>
              Try adjusting your search filters or run a prediction from the Fraud Detection page.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Reference ID</th>
                  <th>Classification</th>
                  <th>Fraud Score</th>
                  <th>Risk Level</th>
                  <th>Threshold</th>
                  <th>Evaluated At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => {
                  const isFraud = p.prediction === 'fraud'
                  const risk = getRiskLevel(p.fraud_score)
                  return (
                    <tr key={p.id}>
                      <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        #{p.id}
                      </td>
                      <td className="mono" style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {truncateRef(p.transaction_reference, 20)}
                      </td>
                      <td>
                        <PredictionBadge prediction={p.prediction} />
                      </td>
                      <td className="mono" style={{
                        fontWeight: 600,
                        color: isFraud ? 'var(--fraud)' : 'var(--success)'
                      }}>
                        {formatScore(p.fraud_score)}
                      </td>
                      <td>
                        <Badge type={isFraud ? 'fraud' : 'legitimate'}>
                          {risk.level}
                        </Badge>
                      </td>
                      <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {formatScore(p.decision_threshold, 2)}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {formatDate(p.created_at)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedRecord(p)}
                          style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <Eye size={13} />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      </div>

      {/* Detail Inspection Modal */}
      {selectedRecord && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(28,40,38,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 16
        }}>
          <div className="animate-fade-in" style={{
            background: 'var(--bg-card)',
            borderRadius: 16,
            maxWidth: 520,
            width: '100%',
            padding: '24px 28px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
            display: 'flex', flexDirection: 'column', gap: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="var(--color-green)" />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
                  Audit Record Inspection
                </h3>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedRecord(null)}
                style={{ padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 12,
              background: selectedRecord.prediction === 'fraud' ? 'var(--fraud-bg)' : 'rgba(61,122,90,0.06)',
              border: selectedRecord.prediction === 'fraud' ? '1px solid rgba(200,90,84,0.25)' : '1px solid rgba(61,122,90,0.2)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classification Verdict</div>
                <div style={{ marginTop: 4 }}>
                  <PredictionBadge prediction={selectedRecord.prediction} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model Score</div>
                <div className="mono" style={{
                  fontSize: '1.5rem', fontWeight: 700,
                  color: selectedRecord.prediction === 'fraud' ? 'var(--fraud)' : 'var(--color-green)'
                }}>
                  {formatScore(selectedRecord.fraud_score)}
                </div>
              </div>
            </div>

            <ScoreBar
              score={selectedRecord.fraud_score}
              threshold={selectedRecord.decision_threshold}
            />

            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              fontSize: '0.8125rem', borderTop: '1px solid var(--border-light)',
              paddingTop: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction Reference</span>
                <span className="mono" style={{ fontWeight: 600 }}>{selectedRecord.transaction_reference}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Model Version</span>
                <span>{selectedRecord.model_version}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Risk Classification</span>
                <span>{getRiskLevel(selectedRecord.fraud_score).level} Risk</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Decision Threshold</span>
                <span className="mono">{selectedRecord.decision_threshold}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recorded Timestamp</span>
                <span>{formatDate(selectedRecord.created_at)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedRecord(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
