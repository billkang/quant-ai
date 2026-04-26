import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Badge, Dropdown, Space, Input } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckOutlined,
  ContainerOutlined,
  AppstoreOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  CloudSyncOutlined,
  ProfileOutlined,
  FundOutlined,
  BarChartOutlined,
  AreaChartOutlined,
  PieChartOutlined,
  ApiOutlined,
  ScheduleOutlined,
  AlertOutlined,
  SafetyCertificateOutlined,
  DesktopOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  StockOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  BgColorsOutlined,
} from '@ant-design/icons'
import api, { notificationApi } from '../services/api'
import { useTheme } from '../hooks/useTheme'
import type { ThemeKey } from '../styles/themes'

interface NavGroup {
  key: string
  label: string
  icon: React.ComponentType<{ style?: React.CSSProperties }>
  children: Array<{
    key: string
    label: string
    icon: React.ComponentType<{ style?: React.CSSProperties }>
  }>
}

const navGroups: NavGroup[] = [
  {
    key: 'dashboard',
    label: '',
    icon: DashboardOutlined,
    children: [{ key: '/', label: 'Dashboard', icon: DashboardOutlined }],
  },
  {
    key: 'research',
    label: '研究管理',
    icon: ExperimentOutlined,
    children: [
      { key: '/factor-management', label: '因子管理', icon: AppstoreOutlined },
      { key: '/feature-management', label: '特征管理', icon: ContainerOutlined },
      { key: '/feature-evaluation', label: '特征评估', icon: LineChartOutlined },
      { key: '/strategy-management', label: '策略管理', icon: ExperimentOutlined },
    ],
  },
  {
    key: 'backtest',
    label: '回测系统',
    icon: BarChartOutlined,
    children: [
      { key: '/backtest-tasks', label: '回测任务', icon: ScheduleOutlined },
      { key: '/backtest-results', label: '回测结果', icon: BarChartOutlined },
      { key: '/comparison-analysis', label: '对比分析', icon: AreaChartOutlined },
      { key: '/backtest-reports', label: '回测报告', icon: FileTextOutlined },
    ],
  },
  {
    key: 'data',
    label: '数据管理',
    icon: DatabaseOutlined,
    children: [
      { key: '/data-sources', label: '数据源', icon: ApiOutlined },
      { key: '/data-collection', label: '数据采集', icon: CloudSyncOutlined },
      { key: '/event-management', label: '事件管理', icon: AlertOutlined },
      { key: '/stock-management', label: '股票管理', icon: StockOutlined },
    ],
  },
  {
    key: 'system',
    label: '系统管理',
    icon: SettingOutlined,
    children: [
      { key: '/system-status', label: '系统状态', icon: DesktopOutlined },
      { key: '/user-management', label: '用户管理', icon: TeamOutlined },
      { key: '/settings', label: '设置', icon: SettingOutlined },
    ],
  },
]

const themeSwatches: Record<ThemeKey, string> = {
  'ocean-blue': '#0ea5e9',
  'dawn-white': '#4f46e5',
  'midnight-black': '#d946ef',
}

const themeIcons: Record<ThemeKey, React.ReactNode> = {
  'ocean-blue': <BgColorsOutlined style={{ color: '#0ea5e9' }} />,
  'dawn-white': <BulbOutlined style={{ color: '#4f46e5' }} />,
  'midnight-black': <BgColorsOutlined style={{ color: '#d946ef' }} />,
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(3)
  const [username, setUsername] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const { currentTheme, setTheme, themeList } = useTheme()

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

  const themeMenuItems: MenuProps['items'] = themeList.map(t => ({
    key: t.key,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: themeSwatches[t.key],
            boxShadow: `0 0 0 2px ${currentTheme === t.key ? themeSwatches[t.key] + '40' : 'transparent'}`,
            transition: 'box-shadow 0.2s ease',
          }}
        />
        <span style={{ flex: 1 }}>{t.label}</span>
        {currentTheme === t.key && (
          <CheckOutlined style={{ fontSize: 12, color: 'var(--accent)' }} />
        )}
      </span>
    ),
    onClick: () => setTheme(t.key),
  }))

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
        const res = await notificationApi.getHistory(1, false)
        const count = res.data?.data?.length || 0
        setUnreadCount(count)
      } catch (e) {
        console.error(e)
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 60000)
    return () => clearInterval(interval)
  }, [])

  const sidebarWidth = collapsed ? 64 : 220

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
          padding: '0 20px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: collapsed ? 40 : 180 }}
        >
          <span
            className="gradient-text"
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            QuantLab
          </span>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 400, margin: '0 24px' }}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
            placeholder="搜索股票、策略或指标..."
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
        <Space size={16}>
          {/* Date Range display */}
          <span
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ScheduleOutlined />
            2024-05-12 ~ 2024-06-11
          </span>

          {/* Auto refresh toggle */}
          <span
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            自动刷新
            <span
              style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                background: 'var(--accent)',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
            </span>
          </span>

          {/* Theme toggle */}
          <Dropdown
            menu={{ items: themeMenuItems }}
            placement="bottomRight"
            arrow
            overlayStyle={{ minWidth: 160 }}
          >
            <button
              data-testid="theme-switcher"
              aria-label="切换主题"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${themeSwatches[currentTheme]} 0%, var(--accent-hover) 100%)`,
                  display: 'block',
                }}
              />
            </button>
          </Dropdown>

          {/* Alerts */}
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

          {/* User */}
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
              <span>{username || 'Quant User'}</span>
            </button>
          </Dropdown>
        </Space>
      </header>

      {/* Body: Sidebar + Main */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside
          style={{
            width: sidebarWidth,
            flexShrink: 0,
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.2s ease',
          }}
        >
          {/* Navigation */}
          <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
            {navGroups.map(group => {
              if (group.children.length === 1 && group.children[0].key === '/') {
                // Dashboard single item
                const item = group.children[0]
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
                      margin: '4px 8px',
                      borderRadius: 8,
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      background: isActive ? 'var(--accent)' : 'transparent',
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
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon style={{ fontSize: 16, flexShrink: 0 }} />
                    {!collapsed && item.label}
                  </Link>
                )
              }

              return (
                <div key={group.key} style={{ marginBottom: 4 }}>
                  {!collapsed && (
                    <div
                      style={{
                        padding: '8px 16px 4px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {group.label}
                    </div>
                  )}
                  {group.children.map(item => {
                    const isActive = location.pathname === item.key
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.key}
                        to={item.key}
                        data-testid={`nav-${item.key.replace('/', '')}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 16px',
                          margin: '2px 8px',
                          borderRadius: 6,
                          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                          background: isActive ? 'var(--accent-soft)' : 'transparent',
                          fontSize: 13,
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
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon style={{ fontSize: 15, flexShrink: 0 }} />
                        {!collapsed && item.label}
                      </Link>
                    )
                  })}
                </div>
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
            {!collapsed && (
              <>
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
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  主题切换
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {themeList.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setTheme(t.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: `1px solid ${currentTheme === t.key ? themeSwatches[t.key] : 'var(--border)'}`,
                        background:
                          currentTheme === t.key ? themeSwatches[t.key] + '15' : 'transparent',
                        color: currentTheme === t.key ? themeSwatches[t.key] : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: 11,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {themeIcons[t.key]}
                      {t.label.replace('主题', '')}
                    </button>
                  ))}
                </div>
              </>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: 4,
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
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              {!collapsed && '收起菜单'}
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
