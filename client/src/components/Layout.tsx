import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, Typography, Badge } from 'antd'
import {
  LineChartOutlined,
  FileTextOutlined,
  FundOutlined,
  RobotOutlined,
  BarChartOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { quantApi } from '../services/api'

const { Title, Text } = Typography

const menuItems = [
  {
    key: '/',
    label: (
      <Link to="/">
        <LineChartOutlined /> 首页
      </Link>
    ),
  },
  {
    key: '/news',
    label: (
      <Link to="/news">
        <FileTextOutlined /> 资讯中心
      </Link>
    ),
  },
  {
    key: '/ai-advice',
    label: (
      <Link to="/ai-advice">
        <RobotOutlined /> AI诊断
      </Link>
    ),
  },
  {
    key: '/portfolio',
    label: (
      <Link to="/portfolio">
        <FundOutlined /> 持仓管理
      </Link>
    ),
  },
  {
    key: '/backtest',
    label: (
      <Link to="/backtest">
        <BarChartOutlined /> 策略回测
      </Link>
    ),
  },
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
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 72,
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(0,212,255,0.3)',
                }}
              >
                <LineChartOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, color: '#fff', letterSpacing: 1 }}>
                  QUANT AI
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                  智能量化投资平台
                </Text>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Menu
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={menuItems}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  justifyContent: 'flex-end',
                  marginRight: -16,
                }}
                theme="dark"
              />
              <Link to="/alerts" style={{ color: 'rgba(255,255,255,0.65)', padding: '0 16px' }}>
                <Badge count={unreadCount} size="small">
                  <BellOutlined style={{ fontSize: 18 }} />
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
        <Outlet />
      </main>
    </div>
  )
}
