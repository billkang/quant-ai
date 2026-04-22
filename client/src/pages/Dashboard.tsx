import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
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
  StarOutlined,
  RiseOutlined,
  FallOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RadarChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

interface Stock {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [newCode, setNewCode] = useState('')

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/stocks/watchlist')
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
      const res = await axios.post(`/api/stocks/watchlist?stock_code=${newCode}`)
      if (res.data.status === 'error') {
        message.error(res.data.message || '添加失败')
        return
      }
      message.success(`已添加 ${res.data.name}`)
      setNewCode('')
      await fetchWatchlist()
    } catch {
      message.error('添加失败')
    }
  }

  const avgChange =
    stocks.length > 0
      ? stocks.reduce((sum, s) => sum + (s.changePercent || 0), 0) / stocks.length
      : 0

  const upCount = stocks.filter(s => (s.changePercent || 0) > 0).length
  const downCount = stocks.filter(s => (s.changePercent || 0) < 0).length

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
              await axios.delete(`/api/stocks/watchlist/${record.code}`)
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
    suffix,
    icon: Icon,
    color,
    glow,
  }: {
    title: string
    value: string | number
    suffix?: string
    icon: React.ElementType
    color: string
    glow?: string
  }) => (
    <Card
      className="metric-card"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        transition: 'all 0.3s ease',
        cursor: 'default',
      }}
      bodyStyle={{ padding: '20px 24px' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-hover)'
        e.currentTarget.style.boxShadow = glow || 'var(--shadow-lg)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'var(--shadow)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <Space align="start" size={16}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon style={{ fontSize: 22, color }} />
        </div>
        <div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          <div
            style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}
          >
            {value}
            {suffix && (
              <span
                style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}
              >
                {suffix}
              </span>
            )}
          </div>
        </div>
      </Space>
    </Card>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page header */}
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          首页
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>实时监控自选股行情与动态</Text>
      </div>

      {/* Stats */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="自选股数量"
            value={stocks.length}
            suffix="只"
            icon={StarOutlined}
            color="#f59e0b"
            glow="0 8px 32px rgba(245, 158, 11, 0.15)"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="平均涨跌幅"
            value={avgChange.toFixed(2)}
            suffix="%"
            icon={avgChange >= 0 ? RiseOutlined : FallOutlined}
            color={avgChange >= 0 ? 'var(--up)' : 'var(--down)'}
            glow={
              avgChange >= 0
                ? '0 8px 32px rgba(239, 68, 68, 0.15)'
                : '0 8px 32px rgba(34, 197, 94, 0.15)'
            }
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="上涨家数"
            value={upCount}
            suffix="只"
            icon={ArrowUpOutlined}
            color="#22c55e"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="下跌家数"
            value={downCount}
            suffix="只"
            icon={ArrowDownOutlined}
            color="#ef4444"
          />
        </Col>
      </Row>

      {/* Add stock */}
      <Card
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}
        bodyStyle={{ padding: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RadarChartOutlined style={{ fontSize: 18, color: 'var(--accent)' }} />
          <Text
            strong
            style={{ color: 'var(--text-secondary)', fontSize: 14, whiteSpace: 'nowrap' }}
          >
            添加自选股
          </Text>
          <Input
            placeholder="输入股票代码 (如: 600519 或 00700.HK)"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
            onPressEnter={addStock}
            size="large"
            style={{
              flex: 1,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border)',
              maxWidth: 400,
            }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addStock}
            disabled={!newCode}
            size="large"
            style={{ borderRadius: 'var(--radius-sm)', minWidth: 120 }}
          >
            添加
          </Button>
        </div>
      </Card>

      {/* Watchlist table */}
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
