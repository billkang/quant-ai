import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Badge, Dropdown, Space, Input } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  LineChartOutlined,
  SettingOutlined,
  FundOutlined,
  BookOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  SearchOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import api, { quantApi } from '../services/api'

const navItems = [
  { key: '/', label: '仪表盘', icon: DashboardOutlined },
  { key: '/market-analysis', label: '行情分析', icon: LineChartOutlined },
  { key: '/strategy-management', label: '策略管理', icon: SettingOutlined },
  { key: '/portfolio', label: '资产组合', icon: FundOutlined },
  { key: '/settings', label: '系统设置', icon: SettingOutlined },
  { key: '/strategy-library', label: '策略库', icon: BookOutlined },
  { key: '/backtest', label: '回测报告', icon: BarChartOutlined },
  { key: '/data-management', label: '数据管理', icon: DatabaseOutlined },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(3)
  const [username, setUsername] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')

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
        const count = res.data?.data?.length || 0
        setUnreadCount(count > 0 ? count : 3)
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
          height: 64,
          padding: '0 24px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 180 }}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#3b82f6',
              letterSpacing: 0.5,
            }}
          >
            QuantMaster
          </span>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 480, margin: '0 24px' }}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
            placeholder="搜索交易对、策略或指标..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{
              borderRadius: 20,
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Global controls */}
        <Space size={20}>
          {/* 告警入口 */}
          <Link
            to="/alerts"
            data-testid="nav-alerts"
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
              position: 'relative',
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
            <BellOutlined style={{ fontSize: 18 }} />
            {unreadCount > 0 && (
              <Badge
                count={unreadCount}
                style={{
                  background: '#ef4444',
                  fontSize: 10,
                  minWidth: 16,
                  height: 16,
                  lineHeight: '16px',
                  position: 'absolute',
                  top: 2,
                  right: 2,
                }}
              />
            )}
          </Link>

          {/* 用户信息 */}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <button
              data-testid="user-menu"
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
              <UserOutlined style={{ fontSize: 16 }} />
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
            width: 200,
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
                  data-testid={`nav-${item.key.replace('/', '') || 'dashboard'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    margin: '2px 8px',
                    borderRadius: 8,
                    color: isActive ? '#3b82f6' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
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
                  <Icon style={{ fontSize: 16 }} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Bottom */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#22c55e',
                    display: 'inline-block',
                  }}
                />
                运行中
              </span>
              <span>v2.1.5</span>
            </div>
            <button
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
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
              <FileTextOutlined style={{ fontSize: 12 }} />
              系统日志
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div style={{ padding: '24px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
