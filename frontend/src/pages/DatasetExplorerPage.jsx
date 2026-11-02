import React, { useEffect, useState } from 'react'
import {
  Database, Filter, Search, ArrowUpDown, Download,
  BarChart2, RefreshCw, AlertTriangle, CheckCircle, Info
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts'
import { datasetApi } from '../services/api'
import {
  PageLoading, ErrorState, Pagination, ChartCard,
  KpiCard, Badge
} from '../components/UI'
import { formatNumber, formatPercent, formatCurrency } from '../utils/helpers'

export default function DatasetExplorerPage() {
  const [overview, setOverview] = useState(null)
  const [records, setRecords] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [classFilter, setClassFilter] = useState('') // '' | '0' | '1'
  const [correlation, setCorrelation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch Dataset Overview & Initial Records
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const [ovRes, corrRes] = await Promise.all([
          datasetApi.getOverview(),
          datasetApi.getCorrelation().catch(() => null)
        ])
        setOverview(ovRes)
        setCorrelation(corrRes)
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load dataset metadata')
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  // Fetch Records on Page or Filter Change
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setRecordsLoading(true)
        const params = {
          page,
          page_size: pageSize,
        }
        if (classFilter !== '') {
          params.class_filter = parseInt(classFilter, 10)
        }
        const res = await datasetApi.getRecords(params)
        setRecords(res.records || [])
        setTotalRecords(res.total || 0)
      } catch (err) {
        console.error('Failed to fetch records:', err)
      } finally {
        setRecordsLoading(false)
      }
    }
    fetchRecords()
  }, [page, pageSize, classFilter])

  if (loading) return <PageLoading />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  const amountStats = overview?.amount_stats || {}
  const fraudAmountStats = overview?.fraud_amount_stats || {}

  // Top correlated features with fraud class
  const topCorrelations = correlation?.top_correlated || [
    { feature: 'V17', correlation: -0.3265 },
    { feature: 'V14', correlation: -0.3025 },
    { feature: 'V12', correlation: -0.2606 },
    { feature: 'V10', correlation: -0.2169 },
    { feature: 'V16', correlation: -0.1965 },
    { feature: 'V3', correlation: -0.1930 },
    { feature: 'V4', correlation: 0.1334 },
    { feature: 'V11', correlation: 0.1549 },
  ]

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-green)', marginBottom: 4 }}>
          Raw Data Intelligence
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Credit Card Dataset Explorer
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
          Explore 284,807 transactions recorded over two days by European cardholders in September 2013.
        </p>
      </div>

      {/* Dataset Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16
      }}>
        <KpiCard
          label="Total Records"
          value={formatNumber(overview?.total_records || 284807)}
          sub="30 Numeric Features"
          icon={Database}
          iconClass="kpi-icon-green"
        />
        <KpiCard
          label="Legitimate Records"
          value={formatNumber(overview?.legitimate_count || 284315)}
          sub="99.828% of total volume"
          icon={CheckCircle}
          iconClass="kpi-icon-green"
        />
        <KpiCard
          label="Fraudulent Records"
          value={formatNumber(overview?.fraud_count || 492)}
          sub="0.172% extreme imbalance"
          icon={AlertTriangle}
          iconClass="kpi-icon-red"
        />
        <KpiCard
          label="Time Span"
          value="48.0 Hours"
          sub="172,792 elapsed seconds"
          icon={BarChart2}
          iconClass="kpi-icon-green"
        />
      </div>

      {/* Statistical Comparison Table Card */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 14,
        padding: '24px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: 16 }}>
          Transaction Amount Distribution Comparison ($)
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Cohort</th>
                <th>Count</th>
                <th>Mean ($)</th>
                <th>Std Dev ($)</th>
                <th>Median ($)</th>
                <th>Min ($)</th>
                <th>Max ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className="badge badge-legitimate">Legitimate Transactions</span>
                </td>
                <td className="mono">{formatNumber(overview?.legitimate_count)}</td>
                <td className="mono">${Number(amountStats.mean || 88.29).toFixed(2)}</td>
                <td className="mono">${Number(amountStats.std || 250.12).toFixed(2)}</td>
                <td className="mono">${Number(amountStats.median || 22.00).toFixed(2)}</td>
                <td className="mono">${Number(amountStats.min || 0.00).toFixed(2)}</td>
                <td className="mono">${Number(amountStats.max || 25691.16).toFixed(2)}</td>
              </tr>
              <tr>
                <td>
                  <span className="badge badge-fraud">Fraudulent Transactions</span>
                </td>
                <td className="mono">{formatNumber(overview?.fraud_count)}</td>
                <td className="mono" style={{ color: 'var(--fraud)', fontWeight: 600 }}>
                  ${Number(fraudAmountStats.mean || 122.21).toFixed(2)}
                </td>
                <td className="mono">${Number(fraudAmountStats.std || 256.68).toFixed(2)}</td>
                <td className="mono" style={{ color: 'var(--fraud)', fontWeight: 600 }}>
                  ${Number(fraudAmountStats.median || 9.25).toFixed(2)}
                </td>
                <td className="mono">${Number(fraudAmountStats.min || 0.00).toFixed(2)}</td>
                <td className="mono">${Number(fraudAmountStats.max || 2125.87).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Correlation Chart */}
      <ChartCard
        title="Key Feature Correlations with Fraud Class"
        subtitle="Features with highest positive or negative linear correlation to Class variable"
      >
        <div style={{ height: 260, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topCorrelations}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} domain={[-0.4, 0.4]} />
              <YAxis dataKey="feature" type="category" stroke="var(--text-secondary)" fontSize={12} width={45} />
              <Tooltip
                formatter={(val) => [Number(val).toFixed(4), 'Correlation']}
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 8,
                  fontSize: '0.8125rem'
                }}
              />
              <Bar
                dataKey="correlation"
                radius={[4, 4, 4, 4]}
              >
                {topCorrelations.map((entry, index) => (
                  <Cell
                    key={`corr-${index}`}
                    fill={entry.correlation >= 0 ? '#397B5D' : '#CC5B54'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Paginated Transactions Table Card */}
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
        {/* Table Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
              Transaction Records
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Showing {records.length} records · {totalRecords.toLocaleString()} total matches
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Filter by class */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.8125rem', width: 'auto' }}
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Transactions</option>
                <option value="0">Legitimate Only (Class 0)</option>
                <option value="1">Fraud Only (Class 1)</option>
              </select>
            </div>

            {/* Page Size */}
            <select
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.8125rem', width: 'auto' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div style={{ overflowX: 'auto', minHeight: 300, position: 'relative' }}>
          {recordsLoading && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10
            }}>
              <div className="spinner" style={{ width: 28, height: 28 }} />
            </div>
          )}

          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Index</th>
                <th>Time (s)</th>
                <th>Amount ($)</th>
                <th>Class</th>
                <th>V1</th>
                <th>V2</th>
                <th>V3</th>
                <th>V4</th>
                <th>V10</th>
                <th>V12</th>
                <th>V14</th>
                <th>V17</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row, idx) => (
                <tr key={idx}>
                  <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    #{(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="mono">{row.Time}</td>
                  <td className="mono" style={{ fontWeight: 600 }}>
                    ${Number(row.Amount).toFixed(2)}
                  </td>
                  <td>
                    {row.Class === 1 ? (
                      <span className="badge badge-fraud">Fraud</span>
                    ) : (
                      <span className="badge badge-legitimate">Legit</span>
                    )}
                  </td>
                  <td className="mono" style={{ fontSize: '0.75rem' }}>{Number(row.V1).toFixed(3)}</td>
                  <td className="mono" style={{ fontSize: '0.75rem' }}>{Number(row.V2).toFixed(3)}</td>
                  <td className="mono" style={{ fontSize: '0.75rem' }}>{Number(row.V3).toFixed(3)}</td>
                  <td className="mono" style={{ fontSize: '0.75rem' }}>{Number(row.V4).toFixed(3)}</td>
                  <td className="mono" style={{ fontSize: '0.75rem' }}>{Number(row.V10).toFixed(3)}</td>
                  <td className="mono" style={{ fontSize: '0.75rem' }}>{Number(row.V12).toFixed(3)}</td>
                  <td className="mono" style={{ fontSize: '0.75rem', fontWeight: row.Class === 1 ? 600 : 400 }}>
                    {Number(row.V14).toFixed(3)}
                  </td>
                  <td className="mono" style={{ fontSize: '0.75rem', fontWeight: row.Class === 1 ? 600 : 400 }}>
                    {Number(row.V17).toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          pageSize={pageSize}
          total={totalRecords}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
