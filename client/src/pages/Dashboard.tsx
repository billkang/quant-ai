import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { stockApi } from '../services/api'
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
import { PlusOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'

const { Text } = Typography

interface Stock {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
}

type TimeRange = '1D' | '1W' | '1M' | '3M'
type DistMode = '资产' | '数量'
type KlinePeriod = '5m' | '15m' | '1h' | '4h'

function generateTrendData(range: TimeRange) {
  const points: { label: string; value: number }[] = []
  const base = 90000
  const count = range === '1D' ? 24 : range === '1W' ? 7 : range === '1M' ? 30 : 90
  const labels =
    range === '1D'
      ? Array.from({ length: count }, (_, i) => `${i}:00`)
      : range === '1W'
        ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        : range === '1M'
          ? Array.from({ length: count }, (_, i) => `${i + 1}日`)
          : Array.from({ length: count }, (_, i) => `${i + 1}`)

  let current = base
  for (let i = 0; i < count; i++) {
    current = current * (1 + (Math.random() - 0.45) * 0.03)
    if (range === '1M' || range === '3M') {
      if (i < 3) current = base * (1 + i * 0.02)
    }
    points.push({ label: labels[i] ?? `${i}`, value: Math.round(current) })
  }
  return points
}

function generateKlineData(count: number) {
  const data: [string, number, number, number, number][] = []
  let base = 31000
  const now = new Date()
  for (let i = count; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000)
    const timeStr = `${t.getMonth() + 1}/${t.getDate()} ${t.getHours()}:00`
    const open = base + (Math.random() - 0.5) * 400
    const close = open + (Math.random() - 0.5) * 600
    const high = Math.max(open, close) + Math.random() * 200
    const low = Math.min(open, close) - Math.random() * 200
    data.push([timeStr, Math.round(open), Math.round(close), Math.round(high), Math.round(low)])
    base = close
  }
  return data
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [newCode, setNewCode] = useState('')

  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const [distMode, setDistMode] = useState<DistMode>('资产')
  const [klinePeriod, setKlinePeriod] = useState<KlinePeriod>('1h')

  useEffect(() => {
    fetchWatchlist()
  }, [])

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
    } catch {
      message.error('添加失败')
    }
  }

  const trendData = generateTrendData(timeRange)

  const trendOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: (params: Array<{ name: string; value: number }>) => {
        const p = params[0]
        return `${p.name}<br/>$${p.value.toLocaleString()}`
      },
    },
    grid: { left: 16, right: 16, top: 16, bottom: 32, containLabel: true },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.label),
      axisLine: { lineStyle: { color: 'var(--border-hover)' } },
      axisLabel: { color: 'var(--text-muted)', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'var(--border)' } },
      axisLabel: {
        color: 'var(--text-muted)',
        fontSize: 11,
        formatter: (v: number) => `$${(v / 1000).toFixed(0)}k`,
      },
    },
    series: [
      {
        data: trendData.map(d => d.value),
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.02)' },
            ],
          },
        },
      },
    ],
  }

  const pieColors = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#6b7280']
  const pieAssetData = [
    { value: 45000, name: '趋势跟踪' },
    { value: 28000, name: '网格交易' },
    { value: 22000, name: '套利策略' },
    { value: 18000, name: '均值回归' },
    { value: 15450, name: '其他' },
  ]
  const pieCountData = [
    { value: 6, name: '趋势跟踪' },
    { value: 3, name: '网格交易' },
    { value: 2, name: '套利策略' },
    { value: 2, name: '均值回归' },
    { value: 1, name: '其他' },
  ]

  const pieOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'center',
      textStyle: { color: 'var(--text-secondary)', fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 12,
    },
    color: pieColors,
    series: [
      {
        name: '策略分布',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: 'var(--bg-surface)', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: false } },
        data: distMode === '资产' ? pieAssetData : pieCountData,
      },
    ],
  }

  const klineRaw = generateKlineData(
    klinePeriod === '5m' ? 48 : klinePeriod === '15m' ? 48 : klinePeriod === '1h' ? 24 : 12
  )
  const klineOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (
        params: Array<{ seriesName: string; value: [string, number, number, number, number] }>
      ) => {
        const d = params[0]?.value
        if (!d) return ''
        return `${d[0]}<br/>开盘: $${d[1]}<br/>收盘: $${d[2]}<br/>最高: $${d[3]}<br/>最低: $${d[4]}`
      },
    },
    grid: { left: 16, right: 16, top: 16, bottom: 32, containLabel: true },
    xAxis: {
      type: 'category',
      data: klineRaw.map(d => d[0]),
      axisLine: { lineStyle: { color: 'var(--border-hover)' } },
      axisLabel: { color: 'var(--text-muted)', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      scale: true,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'var(--border)' } },
      axisLabel: { color: 'var(--text-muted)', fontSize: 11 },
    },
    series: [
      {
        type: 'candlestick',
        data: klineRaw.map(d => [d[1], d[2], d[3], d[4]]),
        itemStyle: {
          color: '#ef4444',
          color0: '#22c55e',
          borderColor: '#ef4444',
          borderColor0: '#22c55e',
        },
      },
    ],
  }

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
    sub,
    subColor,
  }: {
    title: string
    value: string
    sub: string
    subColor?: string
  }) => (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
      }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: subColor || 'var(--text-muted)', marginTop: 8 }}>
        {sub}
      </div>
    </Card>
  )

  const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M']
  const distModes: DistMode[] = ['资产', '数量']
  const klinePeriods: KlinePeriod[] = ['5m', '15m', '1h', '4h']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总资产 (USD)"
            value="$128,450.36"
            sub="↑ 2.3% (24h)"
            subColor="#22c55e"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="今日收益" value="$3,245.18" sub="↑ 1.8%" subColor="#22c55e" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="运行中策略" value="14" sub="较昨日 +2" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="风险指标" value="0.24" sub="↑ 0.05 (需关注)" subColor="#ef4444" />
        </Col>
      </Row>

      {/* Trend + Pie */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
            }}
            title={
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                资产组合走势
              </span>
            }
            extra={
              <Space size={4}>
                {timeRanges.map(r => (
                  <Button
                    key={r}
                    type={timeRange === r ? 'primary' : 'text'}
                    size="small"
                    onClick={() => setTimeRange(r)}
                    style={{
                      borderRadius: 6,
                      fontSize: 12,
                      minWidth: 36,
                      background: timeRange === r ? '#eff6ff' : 'transparent',
                      color: timeRange === r ? '#3b82f6' : 'var(--text-muted)',
                    }}
                  >
                    {r}
                  </Button>
                ))}
              </Space>
            }
          >
            <ReactECharts option={trendOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
            }}
            title={
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                策略分布
              </span>
            }
            extra={
              <Space size={4}>
                {distModes.map(m => (
                  <Button
                    key={m}
                    type={distMode === m ? 'primary' : 'text'}
                    size="small"
                    onClick={() => setDistMode(m)}
                    style={{
                      borderRadius: 6,
                      fontSize: 12,
                      minWidth: 36,
                      background: distMode === m ? '#eff6ff' : 'transparent',
                      color: distMode === m ? '#3b82f6' : 'var(--text-muted)',
                    }}
                  >
                    {m}
                  </Button>
                ))}
              </Space>
            }
          >
            <ReactECharts option={pieOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* Kline */}
      <Card
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}
        title={
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
            实时行情 - BTC/USDT
          </span>
        }
        extra={
          <Space size={4}>
            {klinePeriods.map(p => (
              <Button
                key={p}
                type={klinePeriod === p ? 'primary' : 'text'}
                size="small"
                onClick={() => setKlinePeriod(p)}
                style={{
                  borderRadius: 6,
                  fontSize: 12,
                  minWidth: 36,
                  background: klinePeriod === p ? '#eff6ff' : 'transparent',
                  color: klinePeriod === p ? '#3b82f6' : 'var(--text-muted)',
                }}
              >
                {p}
              </Button>
            ))}
          </Space>
        }
      >
        <ReactECharts option={klineOption} style={{ height: 320 }} />
      </Card>

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
