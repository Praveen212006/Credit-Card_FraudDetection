import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Shield, LayoutDashboard, Radar, Database,
  BarChart3, History, Info, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/detection', icon: Radar, label: 'Fraud Detection' },
  { to: '/dataset', icon: Database, label: 'Dataset Explorer' },
  { to: '/model', icon: BarChart3, label: 'Model Performance' },
  { to: '/history', icon: History, label: 'Transaction History' },
  { to: '/about', icon: Info, label: 'About Project' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--color-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              CreditGuard
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-green)', fontWeight: 500, letterSpacing: '0.05em' }}>
              AI PLATFORM
            </div>
          </div>
        </NavLink>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, paddingLeft: 12 }}>
          Navigation
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-green)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-highlight)' : 'transparent',
                  border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-secondary)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Model Status */}
      <div style={{
        marginTop: 24,
        padding: '12px 14px',
        borderRadius: 10,
        background: 'var(--bg-highlight)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Model Active</span>
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Random Forest v1.0.0</div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    </aside>
  )
}
