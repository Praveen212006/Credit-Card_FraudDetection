import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, AlertTriangle, CheckCircle, Database,
  TrendingUp, Activity, ArrowRight, Zap, RefreshCw, BarChart2, Info
} from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { dashboardApi, predictionApi } from '../services/api'
import {
  KpiCard, LoadingSpinner, PageLoading, ErrorState,
  PredictionBadge, ScoreBar, ChartCard
} from '../components/UI'
import { formatNumber, formatPercent, formatCurrency, formatDate, truncateRef } from '../utils/helpers'

const PIE_COLORS = ['#3D7A5A', '#C85A54']

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [recentPredictions, setRecentPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboard = async () => {
    try {
      setRefreshing(true)
      const [overviewRes, historyRes] = await Promise.all([
        dashboardApi.getOverview(),
        predictionApi.getHistory({ page: 1, page_size: 5 }).catch(() => ({ predictions: [] }))
      ])
      setData(overviewRes)
      setRecentPredictions(historyRes.predictions || [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (loading) return <PageLoading />
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />

  const dataset = data?.dataset || {}
  const model = data?.model || {}
  const training = data?.training || {}

  const classData = [
    { name: 'Legitimate', value: dataset.legitimate_count || 284315 },
    { name: 'Fraud', value: dataset.fraud_count || 492 },
  ]

  const amountComparisonData = [
    {
      category: 'Mean Amount',
      Legitimate: Number((dataset.amount_stats?.mean || 88.29).toFixed(2)),
      Fraud: Number((dataset.fraud_amount_stats?.mean || 122.21).toFixed(2)),
    },
    {
      category: 'Median Amount',
      Legitimate: Number((dataset.amount_stats?.median || 22.00).toFixed(2)),
      Fraud: Number((dataset.fraud_amount_stats?.median || 9.25).toFixed(2)),
    },
  ]

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-green)', marginBottom: 4 }}>
            System Monitoring & Telemetry
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Fraud Intelligence Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
            Real-time telemetry from the live credit card fraud detection engine and 284,807 verified transactions.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadDashboard}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link to="/detection" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} />
            Run Detection
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16
      }}>
        <KpiCard
          label="Total Records"
          value={formatNumber(dataset.total_records)}
          sub="European Cardholder Transactions"
          icon={Database}
          iconClass="kpi-icon-green"
        />
        <KpiCard
          label="Fraud Rate"
          value={formatPercent(dataset.fraud_percentage, 3)}
          sub={`${formatNumber(dataset.fraud_count)} confirmed fraud cases`}
          icon={AlertTriangle}
          iconClass="kpi-icon-red"
        />
        <KpiCard
          label="Model PR-AUC"
          value={Number(model.pr_auc || 0.802).toFixed(4)}
          sub="Precision-Recall Area (Optimal metric)"
          icon={TrendingUp}
          iconClass="kpi-icon-green"
        />
        <KpiCard
          label="Recall Rate"
          value={formatPercent((model.recall || 0.7887) * 100, 1)}
          sub="True positive capture rate on test set"
          icon={Shield}
          iconClass="kpi-icon-green"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 20
      }}>
        {/* Class Distribution Donut Chart */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 14,
          padding: '24px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Class Imbalance Distribution
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
                Breakdown of authentic transactions vs. confirmed fraud attacks in creditcard.csv
              </p>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(204, 91, 84, 0.1)',
              color: '#CC5B54',
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.04em'
            }}>
              0.173% FRAUD
            </span>
          </div>

          {/* Visual Notice for minAngle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'rgba(204, 91, 84, 0.06)',
            border: '1px solid rgba(204, 91, 84, 0.2)',
            borderRadius: 6,
            fontSize: '0.75rem',
            color: '#B04740',
            marginTop: 8,
            marginBottom: 12,
            lineHeight: 1.4
          }}>
            <Info size={14} style={{ flexShrink: 0 }} />
            <span>
              <strong>Visual Notice:</strong> Fraud slice is visually emphasized (<code>minAngle=8°</code>) so the rare 0.173% segment is identifiable; proportions are not strictly to scale.
            </span>
          </div>

          {/* Donut Chart Container */}
          <div style={{ position: 'relative', height: 280, width: '100%', background: '#FFFFFF' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={3}
                  minAngle={8}
                  dataKey="value"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                >
                  {classData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.name === 'Fraud' ? '#CC5B54' : '#397B5D'}
                      stroke="#FFFFFF"
                      strokeWidth={2.5}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0]
                      const total = dataset.total_records || 284807
                      const pct = ((item.value / total) * 100).toFixed(3)
                      const isFraud = item.name === 'Fraud'
                      return (
                        <div style={{
                          background: '#FFFFFF',
                          border: '1px solid var(--border-light)',
                          borderRadius: 8,
                          padding: '10px 14px',
                          boxShadow: 'var(--shadow-md)',
                          fontSize: '0.8125rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: isFraud ? '#CC5B54' : '#397B5D'
                            }} />
                            <strong style={{ color: 'var(--text-primary)' }}>{isFraud ? 'Fraudulent' : 'Legitimate'}</strong>
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: isFraud ? '#CC5B54' : '#397B5D'
                          }}>
                            {formatNumber(item.value)} &nbsp;
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                              ({pct}%)
                            </span>
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {isFraud ? 'Confirmed fraud cases' : 'Authentic cardholder transactions'}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 8 }}
                  formatter={(value, entry) => (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0 8px' }}>
                      {value === 'Fraud' ? 'Fraudulent' : 'Legitimate'}: {formatNumber(entry.payload.value)}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label inside Donut Hole */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -64%)',
              textAlign: 'center',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#CC5B54',
                lineHeight: 1
              }}>
                {formatPercent(dataset.fraud_percentage || 0.173, 3)}
              </div>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginTop: 4
              }}>
                Fraud Rate
              </div>
            </div>
          </div>

          {/* External Counts Displayed Clearly Outside Chart */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 10,
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--border-light)'
          }}>
            <div style={{
              padding: '10px 12px',
              background: 'rgba(57, 123, 93, 0.06)',
              border: '1px solid rgba(57, 123, 93, 0.18)',
              borderRadius: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#397B5D' }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#397B5D', textTransform: 'uppercase' }}>
                  Legitimate
                </span>
              </div>
              <div className="mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatNumber(dataset.legitimate_count || 284315)}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {formatPercent(((dataset.legitimate_count || 284315) / (dataset.total_records || 284807)) * 100, 3)}
              </div>
            </div>

            <div style={{
              padding: '10px 12px',
              background: 'rgba(204, 91, 84, 0.06)',
              border: '1px solid rgba(204, 91, 84, 0.18)',
              borderRadius: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#CC5B54' }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#CC5B54', textTransform: 'uppercase' }}>
                  Fraudulent
                </span>
              </div>
              <div className="mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#CC5B54' }}>
                {formatNumber(dataset.fraud_count || 492)}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {formatPercent(dataset.fraud_percentage || 0.173, 3)}
              </div>
            </div>

            <div style={{
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 8
            }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>
                Imbalance Ratio
              </div>
              <div className="mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                1 : 578
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                1 fraud in 579 total
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Amount Comparison Bar Chart */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 14,
          padding: '24px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Transaction Amount Statistics ($)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
              Comparing Mean and Median financial volume between legitimate and fraudulent transactions
            </p>
          </div>

          <div style={{ height: 280, width: '100%', background: '#FFFFFF' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amountComparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val, name) => [`$${Number(val).toFixed(2)}`, name === 'Fraud' ? 'Fraudulent' : 'Legitimate']}
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-light)',
                    borderRadius: 8,
                    fontSize: '0.8125rem',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 8 }}
                  formatter={(value) => (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0 8px' }}>
                      {value === 'Fraud' ? 'Fraudulent' : 'Legitimate'}
                    </span>
                  )}
                />
                <Bar dataKey="Legitimate" fill="#397B5D" radius={[4, 4, 0, 0]} stroke="#FFFFFF" strokeWidth={1} />
                <Bar dataKey="Fraud" fill="#CC5B54" radius={[4, 4, 0, 0]} stroke="#FFFFFF" strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Amount Breakdown Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--border-light)'
          }}>
            <div style={{
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 8,
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Mean vs Median Fraud
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                Fraud median is low (<strong>$9.25</strong>) due to card-testing micropayments, while mean (<strong>$122.21</strong>) is driven by high-value drain attempts.
              </div>
            </div>

            <div style={{
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 8,
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Maximum Observed
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                Legitimate peak: <strong>$25,691.16</strong> vs Fraud peak: <strong>$2,125.87</strong> (fraudsters avoid triggering instant high-value bank alerts).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Status & Engine Details Banner */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 14,
        padding: '24px 28px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 24,
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: model.is_loaded ? 'var(--success)' : 'var(--fraud)',
              boxShadow: model.is_loaded ? '0 0 0 3px rgba(61,122,90,0.2)' : 'none'
            }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-green)' }}>
              Active Inference Engine
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {model.name || 'Random Forest Classifier'}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Version: {model.version || '1.0.0'} &nbsp;·&nbsp; Threshold: {model.decision_threshold || 0.50}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ROC-AUC</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
              {Number(model.roc_auc || 0.9722).toFixed(4)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precision</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
              {Number(model.precision || 0.8235).toFixed(4)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>F1-Score</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
              {Number(model.f1_score || 0.8057).toFixed(4)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Test Set Size</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
              {formatNumber(training.test_samples || 42722)}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <Link to="/model" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>Deep Dive Metrics</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 14,
        padding: '24px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Recent Prediction Audits
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Latest transactions evaluated by the model.
            </p>
          </div>
          <Link to="/history" style={{ fontSize: '0.8125rem', color: 'var(--color-green)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            View Full History <ArrowRight size={14} />
          </Link>
        </div>

        {recentPredictions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <Activity size={28} style={{ opacity: 0.5, marginBottom: 8 }} />
            <p style={{ fontSize: '0.875rem', margin: 0 }}>No transaction predictions logged yet.</p>
            <p style={{ fontSize: '0.75rem', marginTop: 4 }}>
              Try running a test prediction using the <Link to="/detection" style={{ color: 'var(--color-green)' }}>Fraud Detection interface</Link>.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Classification</th>
                  <th>Fraud Score</th>
                  <th>Threshold</th>
                  <th>Evaluated At</th>
                </tr>
              </thead>
              <tbody>
                {recentPredictions.map((pred) => (
                  <tr key={pred.id}>
                    <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                      {truncateRef(pred.transaction_reference, 18)}
                    </td>
                    <td>
                      <PredictionBadge prediction={pred.prediction} />
                    </td>
                    <td className="mono" style={{
                      fontWeight: 600,
                      color: pred.prediction === 'fraud' ? 'var(--fraud)' : 'var(--success)'
                    }}>
                      {Number(pred.fraud_score).toFixed(4)}
                    </td>
                    <td className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {Number(pred.decision_threshold).toFixed(2)}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {formatDate(pred.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
