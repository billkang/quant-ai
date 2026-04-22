import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Badge, Dropdown, Space } from 'antd'
import type { MenuProps } from 'antd'
import {
  LineChartOutlined,
  FileTextOutlined,
  FundOutlined,
  RobotOutlined,
  BarChartOutlined,
  BellOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  UserOutlined,
  BgColorsOutlined,
  CheckOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import api, { quantApi } from '../services/api'
import { useTheme } from '../hooks/useTheme'

const navItems = [
  { key: '/', label: '首页', icon: AppstoreOutlined },
  { key: '/screener', label: '选股', icon: FilterOutlined },
  { key: '/portfolio', label: '持仓', icon: FundOutlined },
  { key: '/backtest', label: '回测', icon: BarChartOutlined },
  { key: '/ai-advice', label: 'AI诊断', icon: RobotOutlined },
  { key: '/news', label: '资讯', icon: FileTextOutlined },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [username, setUsername] = useState<string | null>(null)
  const { currentTheme, setTheme, themeList } = useTheme()

  const themeMenuItems: MenuProps['items'] = themeList.map(t => ({
    key: t.key,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {currentTheme === t.key && (
          <CheckOutlined style={{ fontSize: 12, color: 'var(--accent)' }} />
        )}
        <span style={{ marginLeft: currentTheme === t.key ? 0 : 20 }}>{t.label}</span>
      </span>
    ),
    onClick: () => setTheme(t.key),
  }))

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    const cached = localStorage.getItem('username')
    if (cached) {
      setUsername(cached)
    } else {
      api
        .get('/auth/me')
        .then(res => {
          if (res.data?.code === 0 && res.data.data?.username) {
            const name = res.data.data.username
            localStorage.setItem('username', name)
            setUsername(name)
          }
        })
        .catch(() => {
          // ignore
        })
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    window.location.href = '/login'
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogoutOutlined style={{ fontSize: 14 }} />
          <span>登出</span>
        </span>
      ),
      onClick: handleLogout,
    },
  ]

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
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-body)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Full-width Header */}
      <header
        style={{
          height: 56,
          padding: '0 32px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(14, 165, 233, 0.3)',
            }}
          >
            <LineChartOutlined style={{ fontSize: 14, color: '#fff' }} />
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: 0.5,
                lineHeight: 1.2,
              }}
            >
              QUANT AI
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.2 }}>
              智能量化平台
            </div>
          </div>
        </div>

        {/* Global controls */}
        <Space size={16}>
          {/* 告警入口 */}
          <Link
            to="/alerts"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              padding: '6px 8px',
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
            {unreadCount > 0 && (
              <Badge
                count={unreadCount}
                style={{
                  background: 'var(--up)',
                  fontSize: 11,
                  minWidth: 18,
                  height: 18,
                  lineHeight: '18px',
                }}
              />
            )}
          </Link>

          {/* 主题切换 */}
          <Dropdown menu={{ items: themeMenuItems }} placement="bottomRight" arrow>
            <button
              aria-label="切换主题"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-hover)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-elevated)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <BgColorsOutlined style={{ fontSize: 15 }} />
            </button>
          </Dropdown>

          {/* 用户信息 */}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <button
              aria-label="用户菜单"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: 13,
                fontWeight: 500,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-hover)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-elevated)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <UserOutlined style={{ fontSize: 14 }} />
              <span>{username || '用户'}</span>
            </button>
          </Dropdown>
        </Space>
      </header>

      {/* Body: Sidebar + Main */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 220,
            flexShrink: 0,
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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
              padding: '12px 20px',
              borderTop: '1px solid var(--border)',
              fontSize: 11,
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            Quant AI v0.1.0
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minHeight: 0 }}>
          <div style={{ padding: '28px 32px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
