import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, Typography } from 'antd'

const { Title } = Typography

const menuItems = [
  { key: '/', label: <Link to="/">首页</Link> },
  { key: '/watchlist', label: <Link to="/watchlist">自选股</Link> },
  { key: '/news', label: <Link to="/news">资讯</Link> },
  { key: '/ai-advice', label: <Link to="/ai-advice">AI诊断</Link> },
  { key: '/portfolio', label: <Link to="/portfolio">持仓</Link> },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 64 }}>
            <Title level={4} style={{ margin: 0, marginRight: 40, color: '#1677ff' }}>
              Quant AI
            </Title>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{ flex: 1, border: 'none' }}
              theme="light"
            />
          </div>
        </div>
      </div>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  )
}