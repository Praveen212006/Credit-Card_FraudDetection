import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layout
import DashboardLayout from './layouts/DashboardLayout'

// Pages
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import FraudDetectionPage from './pages/FraudDetectionPage'
import DatasetExplorerPage from './pages/DatasetExplorerPage'
import ModelPerformancePage from './pages/ModelPerformancePage'
import HistoryPage from './pages/HistoryPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected / Core Dashboard System */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/detection" element={<FraudDetectionPage />} />
          <Route path="/dataset" element={<DatasetExplorerPage />} />
          <Route path="/model" element={<ModelPerformancePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Fallback to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
