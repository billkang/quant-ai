import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dashboardApi, stockApi } from '../services/api'
import {
  Card,
  Table,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Empty,
  Tag,
  Input,
  Popconfirm,
  message,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  BookOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'

const { Text } = Typography

interface Stock {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface DashboardData {
  stats: {
    strategyCount: number
    backtestCount: number
    watchlistCount: number
    dataCoverage: {
      prices: number
      indicators: number
      events: number
    }
  }
  recentBacktests: Array<{
    id: number
    strategy: string
    stockCode: string
    startDate: string
    endDate: string
    totalReturn: number
    status: string
    createdAt: string
  }>
  topStrategies: Array<{
    id: number
    strategy: string
    stockCode: string
    totalReturn: number
    sharpeRatio: number
    maxDrawdown: number
  }>
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [newCode, setNewCode] = useState('')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)

  useEffect(() => {
    fetchWatchlist()
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setDashboardLoading(true)
      const res = await dashboardApi.getOverview()
      if (res.data?.code === 0) {
        setDashboardData(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setDashboardLoading(false)
    }
  }

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const res = await stockApi.getWatchlist()
      setStocks(res.data || [])
    } catch (error) {
      console.error('Failed to fetch watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const addStock = async () => {
    if (!newCode) return
    try {
      const res = await stockApi.addStock(newCode)
      if (res.data.status === 'error') {
        message.error(res.data.message || '添加失败')
        return
      }
      message.success(`已添加 ${res.data.data?.name || newCode}`)
      setNewCode('')
      await fetchWatchlist()
      await fetchDashboard()
    } catch {
      message.error('添加失败')
    }
  }

  const stats = dashboardData?.stats

  const backtestColumns = [
    {
      title: '策略',
      key: 'strategy',
      render: (_: unknown, record: DashboardData['recentBacktests'][0]) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{record.strategy}</span>
      ),
    },
    {
      title: '股票',
      key: 'stockCode',
      render: (_: unknown, record: DashboardData['recentBacktests'][0]) => (
        <span style={{ color: 'var(--text-secondary)' }}>{record.stockCode}</span>
      ),
    },
    {
      title: '收益率',
      key: 'totalReturn',
      align: 'right' as const,
      render: (_: unknown, record: DashboardData['recentBacktests'][0]) => (
        <Tag
          style={{
            borderRadius: 6,
            fontWeight: 600,
            background: (record.totalReturn || 0) >= 0 ? 'var(--up-soft)' : 'var(--down-soft)',
            color: (record.totalReturn || 0) >= 0 ? 'var(--up)' : 'var(--down)',
            border: 'none',
          }}
        >
          {record.totalReturn
            ? `${record.totalReturn >= 0 ? '+' : ''}${record.totalReturn.toFixed(2)}%`
            : '-'}
        </Tag>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, record: DashboardData['recentBacktests'][0]) => (
        <Tag
          style={{
            borderRadius: 6,
            fontWeight: 500,
            background:
              record.status === 'completed'
                ? 'rgba(34, 197, 94, 0.1)'
                : record.status === 'running'
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
            color:
              record.status === 'completed'
                ? '#22c55e'
                : record.status === 'running'
                  ? '#3b82f6'
                  : '#ef4444',
            border: 'none',
          }}
        >
          {record.status === 'completed'
            ? '已完成'
            : record.status === 'running'
              ? '运行中'
              : '失败'}
        </Tag>
      ),
    },
    {
      title: '时间',
      key: 'createdAt',
      render: (_: unknown, record: DashboardData['recentBacktests'][0]) => (
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ]

  const topStrategyColumns = [
    {
      title: '策略',
      key: 'strategy',
      render: (_: unknown, record: DashboardData['topStrategies'][0]) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{record.strategy}</span>
      ),
    },
    {
      title: '股票',
      key: 'stockCode',
      render: (_: unknown, record: DashboardData['topStrategies'][0]) => (
        <span style={{ color: 'var(--text-secondary)' }}>{record.stockCode}</span>
      ),
    },
    {
      title: '总收益',
      key: 'totalReturn',
      align: 'right' as const,
      render: (_: unknown, record: DashboardData['topStrategies'][0]) => (
        <Tag
          style={{
            borderRadius: 6,
            fontWeight: 600,
            background: (record.totalReturn || 0) >= 0 ? 'var(--up-soft)' : 'var(--down-soft)',
            color: (record.totalReturn || 0) >= 0 ? 'var(--up)' : 'var(--down)',
            border: 'none',
          }}
        >
          {record.totalReturn
            ? `${record.totalReturn >= 0 ? '+' : ''}${record.totalReturn.toFixed(2)}%`
            : '-'}
        </Tag>
      ),
    },
    {
      title: '夏普比率',
      key: 'sharpeRatio',
      align: 'right' as const,
      render: (_: unknown, record: DashboardData['topStrategies'][0]) => (
        <span style={{ color: 'var(--text-secondary)' }}>
          {record.sharpeRatio?.toFixed(2) ?? '-'}
        </span>
      ),
    },
    {
      title: '最大回撤',
      key: 'maxDrawdown',
      align: 'right' as const,
      render: (_: unknown, record: DashboardData['topStrategies'][0]) => (
        <span style={{ color: 'var(--down)' }}>
          {record.maxDrawdown ? `${record.maxDrawdown.toFixed(2)}%` : '-'}
        </span>
      ),
    },
  ]

  const columns = [
    {
      title: '股票',
      key: 'name',
      width: '35%',
      render: (_: unknown, record: Stock) => (
        <Space direction="vertical" size={2}>
          <Link
            to={`/stock/${record.code}`}
            style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}
          >
            {record.name}
          </Link>
          <Text style={{ fontSize: 12, color: 'var(--text-muted)' }}>{record.code}</Text>
        </Space>
      ),
    },
    {
      title: '现价',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      width: '20%',
      render: (price: number) => (
        <Text style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
          {price ? `¥${price.toFixed(2)}` : '-'}
        </Text>
      ),
    },
    {
      title: '涨跌额',
      dataIndex: 'change',
      key: 'change',
      align: 'right' as const,
      width: '18%',
      render: (change: number) => (
        <Text style={{ color: (change || 0) >= 0 ? 'var(--up)' : 'var(--down)', fontWeight: 500 }}>
          {change ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}` : '-'}
        </Text>
      ),
    },
    {
      title: '涨跌幅',
      dataIndex: 'changePercent',
      key: 'changePercent',
      align: 'right' as const,
      width: '18%',
      render: (pct: number) => (
        <Tag
          style={{
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 13,
            padding: '2px 10px',
            background: (pct || 0) >= 0 ? 'var(--up-soft)' : 'var(--down-soft)',
            color: (pct || 0) >= 0 ? 'var(--up)' : 'var(--down)',
            border: 'none',
          }}
        >
          {pct ? `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%` : '-'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      align: 'center' as const,
      width: '9%',
      render: (_: unknown, record: Stock) => (
        <Popconfirm
          title="确认删除"
          description={`确定要从自选股中删除 ${record.name} 吗？`}
          onConfirm={async () => {
            try {
              await stockApi.removeStock(record.code)
              message.success('删除成功')
              await fetchWatchlist()
            } catch {
              message.error('删除失败')
            }
          }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            style={{ opacity: 0.6, transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
          />
        </Popconfirm>
      ),
    },
  ]

  const StatCard = ({
    title,
    value,
    icon,
    color,
    link,
  }: {
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
    link?: string
  }) => (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        cursor: link ? 'pointer' : 'default',
      }}
      bodyStyle={{ padding: '20px 24px' }}
      onClick={() => link && navigate(link)}
      hoverable={!!link}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color, fontSize: 20 }}>{icon}</span>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
        {dashboardLoading ? '-' : value}
      </div>
    </Card>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="策略总数"
            value={stats?.strategyCount ?? 0}
            icon={<BookOutlined />}
            color="var(--accent)"
            link="/strategy-management"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="回测次数"
            value={stats?.backtestCount ?? 0}
            icon={<BarChartOutlined />}
            color="#22c55e"
            link="/backtest"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="自选股数量"
            value={stats?.watchlistCount ?? 0}
            icon={<ThunderboltOutlined />}
            color="#f59e0b"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="事件数据量"
            value={stats?.dataCoverage?.events ?? 0}
            icon={<DatabaseOutlined />}
            color="#a855f7"
          />
        </Col>
      </Row>

      {/* Recent Backtests + Top Strategies */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
            }}
            title={
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                <ClockCircleOutlined style={{ marginRight: 8, color: 'var(--accent)' }} />
                最近回测
              </span>
            }
            extra={
              <Link to="/backtest" style={{ fontSize: 13, color: 'var(--accent)' }}>
                查看全部 →
              </Link>
            }
          >
            {dashboardLoading ? (
              <Empty description="加载中..." image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : !dashboardData?.recentBacktests?.length ? (
              <Empty description="暂无回测记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                columns={backtestColumns}
                dataSource={dashboardData.recentBacktests}
                rowKey="id"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
            }}
            title={
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                <BarChartOutlined style={{ marginRight: 8, color: '#22c55e' }} />
                收益排行
              </span>
            }
            extra={
              <Link to="/strategy-management" style={{ fontSize: 13, color: 'var(--accent)' }}>
                策略管理 →
              </Link>
            }
          >
            {dashboardLoading ? (
              <Empty description="加载中..." image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : !dashboardData?.topStrategies?.length ? (
              <Empty description="暂无策略收益数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                columns={topStrategyColumns}
                dataSource={dashboardData.topStrategies}
                rowKey="id"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Watchlist */}
      <Card
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
        }}
        title={
          <Space size={8}>
            <ThunderboltOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>我的自选股</span>
            <Tag
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
                border: 'none',
                fontSize: 12,
              }}
            >
              {stocks.length}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="输入股票代码"
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
              onPressEnter={addStock}
              size="small"
              data-testid="dashboard-add-stock-input"
              style={{
                width: 200,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
              }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addStock}
              disabled={!newCode}
              size="small"
              data-testid="dashboard-add-stock-btn"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              添加
            </Button>
          </Space>
        }
        bodyStyle={{ padding: 0 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="animate-pulse-glow" style={{ display: 'inline-block' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--accent-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ThunderboltOutlined style={{ color: 'var(--accent)', fontSize: 20 }} />
              </div>
            </div>
          </div>
        ) : stocks.length === 0 ? (
          <Empty
            description="暂无自选股，请在上方添加股票"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: 60 }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={stocks}
            rowKey="code"
            pagination={false}
            data-testid="dashboard-watchlist-table"
            onRow={record => ({
              onClick: () => navigate(`/stock/${record.code}`),
              style: { cursor: 'pointer' },
            })}
            locale={{ emptyText: '暂无自选股' }}
          />
        )}
      </Card>
    </div>
  )
}
