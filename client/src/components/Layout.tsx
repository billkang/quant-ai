import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Badge } from 'antd'
import {
  LineChartOutlined,
  FileTextOutlined,
  FundOutlined,
  RobotOutlined,
  BarChartOutlined,
  BellOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { quantApi } from '../services/api'

const navItems = [
  { key: '/', label: '首页', icon: AppstoreOutlined },
  { key: '/portfolio', label: '持仓', icon: FundOutlined },
  { key: '/backtest', label: '回测', icon: BarChartOutlined },
  { key: '/ai-advice', label: 'AI诊断', icon: RobotOutlined },
  { key: '/news', label: '资讯', icon: FileTextOutlined },
]

export default function Layout() {
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await quantApi.getAlerts(false, 1)
        setUnreadCount(res.data?.data?.length || 0)
      } catch (e) {
        console.error(e)
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(14, 165, 233, 0.3)',
            }}
          >
            <LineChartOutlined style={{ fontSize: 18, color: '#fff' }} />
          </div>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: 0.5,
              }}
            >
              QUANT AI
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -2 }}>
              智能量化平台
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.key
            const Icon = item.icon
            return (
              <Link
                key={item.key}
                to={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  margin: '2px 10px',
                  borderRadius: 10,
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-hover)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                <Icon style={{ fontSize: 18 }} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/alerts"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              padding: '8px 12px',
              borderRadius: 8,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-hover)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            <BellOutlined style={{ fontSize: 16 }} />
            告警
            {unreadCount > 0 && (
              <Badge
                count={unreadCount}
                style={{
                  background: '#ef4444',
                  fontSize: 11,
                  minWidth: 18,
                  height: 18,
                  lineHeight: '18px',
                }}
              />
            )}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: 220,
          padding: '28px 32px',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}
