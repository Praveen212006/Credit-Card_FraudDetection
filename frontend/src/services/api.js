// CreditGuard AI - Axios API service layer
import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
})

// Request interceptor
api.interceptors.request.use((config) => {
  return config
}, (error) => Promise.reject(error))

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

// ─────────────────────────────────────────────
//  API Methods
// ─────────────────────────────────────────────

export const healthApi = {
  check: () => api.get('/health'),
}

export const dashboardApi = {
  getOverview: () => api.get('/dashboard/overview'),
}

export const datasetApi = {
  getOverview: () => api.get('/dataset/overview'),
  getRecords: (params) => api.get('/dataset/records', { params }),
  getDistribution: () => api.get('/dataset/distribution'),
  getCorrelation: () => api.get('/dataset/correlation'),
}

export const modelApi = {
  getInfo: () => api.get('/model/info'),
  getMetrics: () => api.get('/model/metrics'),
  getFeatures: () => api.get('/model/features'),
}

export const predictionApi = {
  predictSingle: (data) => api.post('/predict', data),
  predictBatch: (formData) => api.post('/predict/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
  getHistory: (params) => api.get('/predictions/history', { params }),
  getById: (id) => api.get(`/predictions/${id}`),
  exportCSV: () => {
    return axios.get(`${BASE_URL}/export/predictions`, {
      responseType: 'blob',
      timeout: 30000,
    })
  },
}

export default api
