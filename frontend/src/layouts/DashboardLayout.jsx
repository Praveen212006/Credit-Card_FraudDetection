import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '32px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
