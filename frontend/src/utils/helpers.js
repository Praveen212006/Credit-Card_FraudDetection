// Utility functions
export function formatNumber(n, decimals = 0) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

export function formatPercent(n, decimals = 2) {
  if (n == null) return '—'
  return `${Number(n).toFixed(decimals)}%`
}

export function formatScore(n, decimals = 4) {
  if (n == null) return '—'
  return Number(n).toFixed(decimals)
}

export function formatCurrency(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export function truncateRef(ref, len = 16) {
  if (!ref) return '—'
  return ref.length > len ? ref.substring(0, len) + '...' : ref
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function getRiskLevel(score) {
  if (score < 0.3) return { level: 'Low', color: 'var(--success)' }
  if (score < 0.6) return { level: 'Medium', color: 'var(--warning)' }
  return { level: 'High', color: 'var(--fraud)' }
}

export const SAMPLE_TRANSACTION = {
  Time: 406, Amount: 149.62,
  V1: -1.3598, V2: -0.0728, V3: 2.5363, V4: 1.3782, V5: -0.3383,
  V6: 0.4624, V7: 0.2396, V8: 0.0987, V9: 0.3638, V10: 0.0908,
  V11: -0.5516, V12: -0.6178, V13: -0.9914, V14: -0.3112, V15: 1.4682,
  V16: -0.4704, V17: 0.2080, V18: 0.0258, V19: 0.4040, V20: 0.2514,
  V21: -0.0183, V22: 0.2778, V23: -0.1105, V24: 0.0669, V25: 0.1285,
  V26: -0.1891, V27: 0.1336, V28: -0.0211,
}
