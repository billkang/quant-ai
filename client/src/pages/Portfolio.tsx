import { useState, useEffect } from 'react'
import { portfolioApi, quantApi } from '../services/api'
import { Card, Table, Typography, Tag, Empty, Row, Col, Space } from 'antd'
import { FundOutlined, DollarOutlined, BarChartOutlined, WarningOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'

const { Title, Text } = Typography

interface VirtualPosition {
  id?: number
  backtestTaskId?: number
  strategyId?: number
  code: string
  name: string
  quantity: number
  avgCost?: number
  costPrice?: number
  currentPrice: number
  unrealizedPnl?: number
  profit: number
  profitPercent: number
  isActive?: number
}

interface PortfolioAnalysis {
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  industryDistribution: Record<string, number>
  correlationMatrix: Record<string, Record<string, number>>
}

export default function Portfolio() {
  const [data, setData] = useState<{
    positions: VirtualPosition[]
    totalValue: number
    totalCost: number
    totalProfit: number
  }>({ positions: [], totalValue: 0, totalCost: 0, totalProfit: 0 })
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolio()
    fetchAnalysis()
  }, [])

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const res = await portfolioApi.getPortfolio()
      if (res.data) {
        setData(
          res.data as {
            positions: VirtualPosition[]
            totalValue: number
            totalCost: number
            totalProfit: number
          }
        )
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalysis = async () => {
    try {
      const res = await quantApi.getPortfolioAnalysis()
      if (res.data?.code === 0) setAnalysis(res.data.data)
    } catch (error) {
      console.error('Failed to fetch analysis:', error)
    }
  }

  const totalProfitPercent = data.totalCost > 0 ? (data.totalProfit / data.totalCost) * 100 : 0

  const StatCard = ({
    label,
    value,
    suffix,
    icon: Icon,
    color,
  }: {
    label: string
    value: string | number
    suffix?: string
    icon: React.ElementType
    color: string
  }) => (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <Space align="start" size={14}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon style={{ fontSize: 20, color }} />
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              fontWeight: 500,
              marginBottom: 4,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
            {value}
            {suffix && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>
                {suffix}
              </span>
            )}
          </div>
        </div>
      </Space>
    </Card>
  )

  const columns = [
    {
      title: '股票',
      key: 'name',
      width: '20%',
      render: (_: unknown, record: VirtualPosition) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>
            {record.name}
          </Text>
          <Text style={{ fontSize: 12, color: 'var(--text-muted)' }}>{record.code}</Text>
        </Space>
      ),
    },
    {
      title: '持仓量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      render: (qty: number) => <Text style={{ color: 'var(--text-primary)' }}>{qty} 股</Text>,
    },
    {
      title: '平均成本',
      dataIndex: 'avgCost',
      key: 'avgCost',
      align: 'right' as const,
      render: (price: number) => (
        <Text style={{ color: 'var(--text-primary)' }}>¥{price?.toFixed(2) || '-'}</Text>
      ),
    },
    {
      title: '收盘价',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      align: 'right' as const,
      render: (price: number) => (
        <Text style={{ color: 'var(--text-primary)' }}>¥{price?.toFixed(2) || '-'}</Text>
      ),
    },
    {
      title: '未实现盈亏',
      dataIndex: 'unrealizedPnl',
      key: 'unrealizedPnl',
      align: 'right' as const,
      render: (pnl: number) => (
        <Text style={{ color: (pnl || 0) >= 0 ? 'var(--up)' : 'var(--down)', fontWeight: 600 }}>
          {pnl >= 0 ? '+' : ''}¥{pnl?.toFixed(2) || '-'}
        </Text>
      ),
    },
    {
      title: '盈亏比',
      dataIndex: 'profitPercent',
      key: 'profitPercent',
      align: 'right' as const,
      render: (pct: number) => (
        <Tag
          style={{
            background: (pct || 0) >= 0 ? 'var(--up-soft)' : 'var(--down-soft)',
            color: (pct || 0) >= 0 ? 'var(--up)' : 'var(--down)',
            border: 'none',
            fontWeight: 600,
          }}
        >
          {pct >= 0 ? '+' : ''}
          {pct?.toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: number) => (
        <Tag
          style={{
            borderRadius: 6,
            background: active === 1 ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)',
            color: active === 1 ? '#22c55e' : 'var(--text-muted)',
            border: 'none',
          }}
        >
          {active === 1 ? '持仓中' : '已平仓'}
        </Tag>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          资产组合
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>虚拟持仓与组合风险分析</Text>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={8}>
          <StatCard
            label="持仓市值"
            value={data.totalValue.toFixed(2)}
            suffix="¥"
            icon={DollarOutlined}
            color="var(--accent)"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            label="持仓盈亏"
            value={data.totalProfit.toFixed(2)}
            suffix="¥"
            icon={FundOutlined}
            color={data.totalProfit >= 0 ? 'var(--up)' : 'var(--down)'}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            label="盈亏比例"
            value={totalProfitPercent.toFixed(2)}
            suffix="%"
            icon={BarChartOutlined}
            color={data.totalProfit >= 0 ? 'var(--up)' : 'var(--down)'}
          />
        </Col>
      </Row>

      {analysis && (
        <Card
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
          title={
            <Space>
              <WarningOutlined style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>组合风险分析</span>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div
                style={{
                  padding: '16px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                  }}
                >
                  夏普比率
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {analysis.sharpeRatio?.toFixed(2) ?? '-'}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div
                style={{
                  padding: '16px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                  }}
                >
                  最大回撤
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: analysis.maxDrawdown < -10 ? 'var(--down)' : 'var(--text-primary)',
                  }}
                >
                  {analysis.maxDrawdown?.toFixed(2) ?? '-'}%
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div
                style={{
                  padding: '16px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                  }}
                >
                  波动率
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {analysis.volatility?.toFixed(2) ?? '-'}%
                </div>
              </div>
            </Col>
          </Row>
          {Object.keys(analysis.correlationMatrix).length > 1 && (
            <div style={{ marginTop: 20 }}>
              <Text strong style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                相关性矩阵
              </Text>
              <ReactECharts
                option={{
                  backgroundColor: 'transparent',
                  tooltip: { position: 'top' },
                  grid: { height: '50%', top: '10%' },
                  xAxis: {
                    type: 'category',
                    data: Object.keys(analysis.correlationMatrix),
                    splitArea: {
                      show: true,
                      areaStyle: { color: ['var(--bg-hover)', 'transparent'] },
                    },
                    axisLine: { lineStyle: { color: 'var(--border-hover)' } },
                    axisLabel: { color: 'var(--text-muted)' },
                  },
                  yAxis: {
                    type: 'category',
                    data: Object.keys(analysis.correlationMatrix),
                    splitArea: {
                      show: true,
                      areaStyle: { color: ['var(--bg-hover)', 'transparent'] },
                    },
                    axisLine: { lineStyle: { color: 'var(--border-hover)' } },
                    axisLabel: { color: 'var(--text-muted)' },
                  },
                  visualMap: {
                    min: -1,
                    max: 1,
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '10%',
                    inRange: { color: ['var(--down)', 'var(--bg-body)', 'var(--up)'] },
                    textStyle: { color: 'var(--text-muted)' },
                  },
                  series: [
                    {
                      name: '相关性',
                      type: 'heatmap',
                      data: Object.entries(analysis.correlationMatrix).flatMap(([row, cols]) =>
                        Object.entries(cols).map(([col, val]) => [row, col, val])
                      ),
                      label: {
                        show: true,
                        formatter: (p: { value: [string, string, number] }) =>
                          p.value[2].toFixed(2),
                        color: 'var(--text-primary)',
                      },
                    },
                  ],
                }}
                style={{ height: 360 }}
              />
            </div>
          )}
        </Card>
      )}

      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
        title={
          <Space>
            <FundOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>虚拟持仓明细</span>
          </Space>
        }
        bodyStyle={{ padding: 0 }}
        data-testid="portfolio-holdings-card"
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Text style={{ color: 'var(--text-muted)' }}>加载中...</Text>
          </div>
        ) : data.positions.length === 0 ? (
          <Empty
            description="暂无持仓记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: 60 }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={data.positions}
            rowKey="id"
            pagination={false}
            size="small"
          />
        )}
      </Card>
    </div>
  )
}
